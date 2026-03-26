import { LS_KEY, INITIAL_STATE, LIMITS, VALID_DEVICE_TYPE_VALUES, MAX_IMPORT_SIZE } from "../constants";

/**
 * Load persisted plan from localStorage.
 * Returns INITIAL_STATE on first visit or if data is corrupt.
 */
export const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt data — fall through to initial state
  }
  return INITIAL_STATE;
};

/**
 * Persist the current plan to localStorage.
 * Silently ignores storage quota errors.
 */
export const saveState = (state) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — not critical
  }
};

/**
 * Remove persisted plan from localStorage.
 */
export const clearState = () => {
  try { localStorage.removeItem(LS_KEY); } catch {}
};

// ─── Validation helpers ───────────────────────────────────────────────────────

/** Safe string check — guards against prototype pollution via __proto__ keys. */
const isSafeString = (val, maxLen) =>
  typeof val === "string" && val.length <= maxLen;

/** Validate hex color — must be exactly #rrggbb */
const isValidHexColor = (val) =>
  typeof val === "string" && /^#[0-9a-fA-F]{6}$/.test(val);

/** Validate IPv4 address */
const isValidIPv4 = (val) => {
  if (!isSafeString(val, 15)) return false;
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(val) &&
    val.split(".").every((o) => parseInt(o, 10) <= 255);
};

/** Validate CIDR subnet (e.g. "192.168.10.0/24") */
const isValidSubnet = (val) => {
  if (!isSafeString(val, 18)) return false;
  const [ip, prefix] = val.split("/");
  if (!ip || prefix === undefined) return false;
  const prefixNum = parseInt(prefix, 10);
  if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 32) return false;
  return isValidIPv4(ip);
};

const isValidVlan = (v) => {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  // Guard against __proto__ on individual items
  if ("__proto__" in v || "constructor" in v || "prototype" in v) return false;
  const id = parseInt(v.id, 10);
  if (!Number.isInteger(id) || id < LIMITS.vlanIdMin || id > LIMITS.vlanIdMax) return false;
  if (!isSafeString(v.name, LIMITS.nameMaxLen) || !v.name.trim()) return false;
  // Optional fields — validate format if present
  if (v.subnet  !== undefined && v.subnet  !== "" && !isValidSubnet(v.subnet))  return false;
  if (v.gateway !== undefined && v.gateway !== "" && !isValidIPv4(v.gateway))   return false;
  if (v.purpose !== undefined && !isSafeString(v.purpose, LIMITS.purposeMaxLen)) return false;
  if (v.color   !== undefined && v.color   !== "" && !isValidHexColor(v.color)) return false;
  return true;
};

const isValidDevice = (d) => {
  if (typeof d !== "object" || d === null || Array.isArray(d)) return false;
  if ("__proto__" in d || "constructor" in d || "prototype" in d) return false;
  if (!isSafeString(d.id,   LIMITS.nameMaxLen))                    return false;
  if (!isSafeString(d.name, LIMITS.nameMaxLen) || !d.name.trim())  return false;
  if (!VALID_DEVICE_TYPE_VALUES.has(d.type))                        return false;
  if (!Array.isArray(d.ports))                                       return false;
  if (d.ports.length > LIMITS.maxPortsPerDev)                       return false;
  if (!d.ports.every((p) => isSafeString(p, LIMITS.portNameMaxLen))) return false;
  return true;
};

const isValidPortCfg = (cfg) => {
  if (typeof cfg !== "object" || cfg === null || Array.isArray(cfg)) return false;
  if ("__proto__" in cfg || "constructor" in cfg || "prototype" in cfg) return false;
  for (const devId of Object.keys(cfg)) {
    if (!isSafeString(devId, LIMITS.nameMaxLen)) return false;
    const devPorts = cfg[devId];
    if (typeof devPorts !== "object" || devPorts === null) return false;
    if ("__proto__" in devPorts) return false;
    for (const portName of Object.keys(devPorts)) {
      if (!isSafeString(portName, LIMITS.portNameMaxLen)) return false;
    }
  }
  return true;
};

/**
 * Validate that an imported JSON object matches the expected plan schema.
 * Deep validation — guards against prototype pollution, malformed data,
 * invalid IPs, out-of-range VLAN IDs, and hex color injection.
 *
 * @param {unknown} data
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImport = (data) => {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { valid: false, error: "Файл не является объектом JSON" };
  }
  if ("__proto__" in data || "constructor" in data || "prototype" in data) {
    return { valid: false, error: "Файл содержит недопустимые ключи" };
  }

  if (!Array.isArray(data.vlans)) {
    return { valid: false, error: "Отсутствует или повреждён список VLAN" };
  }
  if (data.vlans.length > LIMITS.maxVlans) {
    return { valid: false, error: `Слишком много VLAN (максимум ${LIMITS.maxVlans})` };
  }
  const invalidVlan = data.vlans.find((v) => !isValidVlan(v));
  if (invalidVlan) {
    return { valid: false, error: `Некорректный VLAN (ID: ${invalidVlan?.id ?? "?"})` };
  }
  const vlanIds = data.vlans.map((v) => parseInt(v.id, 10));
  if (new Set(vlanIds).size !== vlanIds.length) {
    return { valid: false, error: "Найдены дублирующиеся VLAN ID" };
  }

  if (!Array.isArray(data.devices)) {
    return { valid: false, error: "Отсутствует или повреждён список устройств" };
  }
  if (data.devices.length > LIMITS.maxDevices) {
    return { valid: false, error: `Слишком много устройств (максимум ${LIMITS.maxDevices})` };
  }
  const invalidDevice = data.devices.find((d) => !isValidDevice(d));
  if (invalidDevice) {
    return { valid: false, error: `Некорректное устройство: ${String(invalidDevice?.name ?? "?").slice(0, 30)}` };
  }
  const deviceIds = data.devices.map((d) => d.id);
  if (new Set(deviceIds).size !== deviceIds.length) {
    return { valid: false, error: "Найдены дублирующиеся ID устройств" };
  }

  if (!isValidPortCfg(data.portCfg)) {
    return { valid: false, error: "Повреждены данные конфигурации портов" };
  }

  return { valid: true };
};

export { MAX_IMPORT_SIZE };
