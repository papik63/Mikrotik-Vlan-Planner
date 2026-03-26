import { LIMITS } from "../constants";

/**
 * Parse a comma-separated trunk VLAN string into an array of valid VLAN IDs.
 * Invalid or out-of-range values are silently dropped.
 * @param {string} str  e.g. "10, 20, 30"
 * @returns {number[]}
 */
export const parseTrunkVlans = (str) =>
  (str || "")
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((id) => Number.isInteger(id) && id >= LIMITS.vlanIdMin && id <= LIMITS.vlanIdMax);

/**
 * Collect all unique VLAN IDs referenced by the ports of a device.
 * @param {object} dev     Device object with .ports[]
 * @param {object} devCfg  portCfg[dev.id]
 * @returns {Set<number>}
 */
export const getUsedVlanIds = (dev, devCfg) => {
  const ids = new Set();
  dev.ports.forEach((p) => {
    const c = devCfg[p];
    if (!c) return;
    if (c.vlan && c.vlan !== "trunk") {
      const id = parseInt(c.vlan, 10);
      if (id >= LIMITS.vlanIdMin && id <= LIMITS.vlanIdMax) ids.add(id);
    }
    if (c.vlan === "trunk" && c.trunkVlans) {
      parseTrunkVlans(c.trunkVlans).forEach((id) => ids.add(id));
    }
  });
  return ids;
};

/**
 * Derive the management IP for a switch (convention: last octet .2).
 */
export const deriveSwitchMgmtIp = (vlan) => {
  if (!vlan?.subnet) return null;
  const net    = vlan.subnet.replace(/\.\d+\/\d+$/, "");
  const prefix = "/" + vlan.subnet.split("/")[1];
  return `${net}.2${prefix}`;
};
