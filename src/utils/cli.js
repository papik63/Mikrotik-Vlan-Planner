import { parseTrunkVlans, getUsedVlanIds, deriveSwitchMgmtIp } from "./vlan";
import { sanitizePortName, sanitizeName, sanitizeIP } from "./sanitize";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const FRAME_TYPE_MAP = {
  tagged:   "admit-only-vlan-tagged",
  untagged: "admit-only-untagged-and-priority-tagged",
  hybrid:   "admit-all",
};

const frameTypes = (portCfg) =>
  FRAME_TYPE_MAP[portCfg?.frameType] ?? "admit-only-vlan-tagged";

/**
 * For each VLAN, compute which ports are tagged, untagged, and whether
 * the bridge CPU-port should be included.
 * All port names are sanitized before use in CLI output.
 */
const resolveVlanPorts = (dev, devCfg, vlan) => {
  const tagged = dev.ports.filter((p) => {
    const c = devCfg[p];
    if (!c) return false;
    if (c.vlan === "trunk") return parseTrunkVlans(c.trunkVlans).includes(vlan.id);
    return parseInt(c.vlan, 10) === vlan.id && c.frameType === "tagged";
  });

  const untagged = dev.ports.filter((p) => {
    const c = devCfg[p];
    if (!c) return false;
    return (
      parseInt(c.vlan, 10) === vlan.id &&
      (c.frameType === "untagged" || c.frameType === "hybrid")
    );
  });

  const addBridge = dev.ports.some((p) => {
    const c = devCfg[p];
    if (!c?.addBridge) return false;
    if (c.vlan === "trunk") return parseTrunkVlans(c.trunkVlans).includes(vlan.id);
    return parseInt(c.vlan, 10) === vlan.id;
  });

  return {
    tagged:    tagged.map(sanitizePortName),
    untagged:  untagged.map(sanitizePortName),
    addBridge,
  };
};

// ─── Router CLI ───────────────────────────────────────────────────────────────

/**
 * Generate RouterOS v7 CLI config for a router device (RoaS topology).
 * All user-supplied values are sanitized before inclusion.
 *
 * @param {object}   dev      Device object
 * @param {object[]} vlans    All VLAN objects
 * @param {object}   portCfg  Global portCfg map
 * @returns {string}
 */
export const genRouterCLI = (dev, vlans, portCfg) => {
  const devCfg    = portCfg[dev.id] || {};
  const bridge    = "bridge-VLAN";
  const devName   = sanitizeName(dev.name);
  const usedIds   = getUsedVlanIds(dev, devCfg);
  const usedVlans = vlans.filter((v) => usedIds.has(v.id));

  const lines = [];
  lines.push(`# ${"═".repeat(60)}`);
  lines.push(`# Устройство : ${devName}`);
  lines.push(`# Тип        : Роутер (RoaS — Router on a Stick)`);
  lines.push(`# Генерация  : ${new Date().toLocaleDateString("ru-RU")}`);
  lines.push(`# ${"═".repeat(60)}`);
  lines.push("");

  // 1. Bridge interface
  lines.push("# 1. Bridge-интерфейс");
  lines.push("/interface/bridge/");
  lines.push(`add name=${bridge} frame-types=admit-only-vlan-tagged vlan-filtering=no`);
  lines.push("");

  // 2. Bridge ports (skip WAN interfaces)
  const lanPorts = dev.ports
    .filter((p) => !p.toLowerCase().includes("wan"))
    .map(sanitizePortName)
    .filter(Boolean);

  if (lanPorts.length) {
    lines.push("# 2. Порты bridge-интерфейса");
    lines.push("/interface/bridge/port/");
    lanPorts.forEach((p) => {
      const c    = devCfg[p] || {};
      const ft   = frameTypes(c);
      const pvid = c.frameType === "untagged" && c.vlan && c.vlan !== "trunk"
        ? ` pvid=${parseInt(c.vlan, 10)}`
        : "";
      lines.push(`add bridge=${bridge} interface=${p} frame-types=${ft}${pvid}`);
    });
    lines.push("");
  }

  // 3. Bridge VLAN table
  if (usedVlans.length) {
    lines.push("# 3. Таблица VLAN (bridge-интерфейс как CPU-порт)");
    lines.push("/interface/bridge/vlan/");
    usedVlans.forEach((v) => {
      const { tagged, untagged, addBridge } = resolveVlanPorts(dev, devCfg, v);
      const vlanName    = sanitizeName(v.name);
      const taggedList  = [...(addBridge ? [bridge] : []), ...tagged].join(",") || bridge;
      const untaggedStr = untagged.length ? ` untagged=${untagged.join(",")}` : "";
      lines.push(`add bridge=${bridge} tagged=${taggedList}${untaggedStr} vlan-ids=${v.id}  # ${vlanName}`);
    });
    lines.push("");
  }

  // 4. VLAN sub-interfaces
  if (usedVlans.length) {
    lines.push("# 4. VLAN-интерфейсы (для IP-адресов и DHCP)");
    lines.push("/interface/vlan/");
    usedVlans.forEach((v) => {
      lines.push(`add interface=${bridge} name=vlan${v.id} vlan-id=${v.id}  # ${sanitizeName(v.name)}`);
    });
    lines.push("");
  }

  // 5. IP addresses
  const vlansWithGw = usedVlans.filter((v) => v.gateway && v.subnet);
  if (vlansWithGw.length) {
    lines.push("# 5. IP-адреса (шлюзы для каждого VLAN)");
    lines.push("/ip/address/");
    vlansWithGw.forEach((v) => {
      const gw     = sanitizeIP(v.gateway);
      const prefix = "/" + sanitizeIP(v.subnet).split("/")[1];
      lines.push(`add address=${gw}${prefix} interface=vlan${v.id}  # ${sanitizeName(v.name)}`);
    });
    lines.push("");
  }

  // 6. Enable VLAN filtering last
  lines.push("# 6. Включить VLAN Filtering — выполнять ПОСЛЕДНИМ на всех устройствах");
  lines.push("/interface/bridge/");
  lines.push(`set ${bridge} vlan-filtering=yes`);

  return lines.join("\n");
};

// ─── Switch CLI ───────────────────────────────────────────────────────────────

/**
 * Generate RouterOS v7 CLI config for a switch device (Bridge VLAN Filtering).
 * All user-supplied values are sanitized before inclusion.
 *
 * @param {object}   dev      Device object
 * @param {object[]} vlans    All VLAN objects
 * @param {object}   portCfg  Global portCfg map
 * @returns {string}
 */
export const genSwitchCLI = (dev, vlans, portCfg) => {
  const devCfg    = portCfg[dev.id] || {};
  const bridge    = "bridge1";
  const devName   = sanitizeName(dev.name);
  const usedIds   = getUsedVlanIds(dev, devCfg);
  const usedVlans = vlans.filter((v) => usedIds.has(v.id));

  const lines = [];
  lines.push(`# ${"═".repeat(60)}`);
  lines.push(`# Устройство : ${devName}`);
  lines.push(`# Тип        : Коммутатор (Bridge VLAN Filtering)`);
  lines.push(`# Генерация  : ${new Date().toLocaleDateString("ru-RU")}`);
  lines.push(`# ${"═".repeat(60)}`);
  lines.push("");

  // 1. Bridge interface
  lines.push("# 1. Bridge-интерфейс");
  lines.push("/interface/bridge/");
  lines.push(`add name=${bridge} frame-types=admit-only-vlan-tagged vlan-filtering=no`);
  lines.push("");

  // 2. Bridge ports
  const sanitizedPorts = dev.ports.map(sanitizePortName).filter(Boolean);
  if (sanitizedPorts.length) {
    lines.push("# 2. Порты bridge-интерфейса");
    lines.push("/interface/bridge/port/");
    sanitizedPorts.forEach((p) => {
      const c    = devCfg[p] || {};
      const ft   = frameTypes(c);
      const pvid = c.frameType === "untagged" && c.vlan && c.vlan !== "trunk"
        ? ` pvid=${parseInt(c.vlan, 10)}`
        : "";
      lines.push(`add bridge=${bridge} interface=${p} frame-types=${ft}${pvid}`);
    });
    lines.push("");
  }

  // 3. Bridge VLAN table
  if (usedVlans.length) {
    lines.push("# 3. Таблица VLAN");
    lines.push("/interface/bridge/vlan/");
    usedVlans.forEach((v) => {
      const { tagged, untagged, addBridge } = resolveVlanPorts(dev, devCfg, v);
      const taggedParts = [...(addBridge ? [bridge] : []), ...tagged];
      const taggedStr   = taggedParts.length ? `tagged=${taggedParts.join(",")}` : "";
      const untaggedStr = untagged.length    ? `untagged=${untagged.join(",")}`  : "";
      const parts       = [taggedStr, untaggedStr].filter(Boolean).join(" ");
      lines.push(`add bridge=${bridge} ${parts} vlan-ids=${v.id}  # ${sanitizeName(v.name)}`);
    });
    lines.push("");
  }

  // 4. Management VLAN interface
  const mgmtPort   = dev.ports.find((p) => devCfg[p]?.addBridge && devCfg[p]?.vlan && devCfg[p].vlan !== "trunk");
  const mgmtVlanId = mgmtPort ? parseInt(devCfg[mgmtPort].vlan, 10) : null;
  const mgmtVlan   = mgmtVlanId ? vlans.find((v) => v.id === mgmtVlanId) : null;

  if (mgmtVlan) {
    const mgmtIp = deriveSwitchMgmtIp(mgmtVlan);
    lines.push(`# 4. Интерфейс управления коммутатором (${sanitizeName(mgmtVlan.name)})`);
    lines.push("/interface/vlan/");
    lines.push(`add interface=${bridge} name=vlan${mgmtVlanId} vlan-id=${mgmtVlanId}`);
    if (mgmtIp) {
      lines.push("/ip/address/");
      lines.push(`add address=${sanitizeIP(mgmtIp)} interface=vlan${mgmtVlanId}`);
    }
    if (mgmtVlan.gateway) {
      lines.push("/ip/route/");
      lines.push(`add dst-address=0.0.0.0/0 gateway=${sanitizeIP(mgmtVlan.gateway)}`);
    }
    lines.push("");
  }

  // 5. Enable VLAN filtering last
  lines.push("# 5. Включить VLAN Filtering — выполнять ПОСЛЕДНИМ на всех устройствах");
  lines.push("/interface/bridge/");
  lines.push(`set ${bridge} vlan-filtering=yes`);

  return lines.join("\n");
};
