import { LIMITS } from "../constants";

/**
 * Sanitize a value destined for RouterOS CLI output.
 *
 * Strips characters that could inject additional CLI commands:
 * - \n \r \t         — newlines and tabs (obvious command separators)
 * - \u2028 \u2029    — Unicode line/paragraph separators (terminal injection)
 * - " \ ;            — RouterOS string/escape/command delimiters
 * - [ ]              — RouterOS command substitution syntax e.g. [/ip route get ...]
 *
 * @param {unknown} val
 * @param {number}  maxLen  Maximum allowed length after sanitization
 * @returns {string}
 */
export const sanitizeCLIValue = (val, maxLen = 64) =>
  String(val ?? "")
    .replace(/[\n\r\t\u2028\u2029"\\;\[\]]/g, "")  // strip all injection chars incl. [] and Unicode LS/PS
    .replace(/\s+/g, " ")                             // collapse remaining whitespace
    .trim()
    .slice(0, maxLen);

/**
 * Sanitize a port name for CLI output.
 */
export const sanitizePortName = (name) =>
  sanitizeCLIValue(name, LIMITS.portNameMaxLen);

/**
 * Sanitize a device or VLAN name for CLI comment output.
 */
export const sanitizeName = (name) =>
  sanitizeCLIValue(name, LIMITS.nameMaxLen);

/**
 * Sanitize and validate an IPv4 address.
 * Only allows digits and dots. Returns empty string if invalid.
 */
export const sanitizeIPv4 = (ip) => {
  const cleaned = String(ip ?? "").replace(/[^0-9.]/g, "").slice(0, 15);
  // Validate: four octets 0-255
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(cleaned) &&
    cleaned.split(".").every((o) => parseInt(o, 10) <= 255)
    ? cleaned
    : "";
};

/**
 * Sanitize and validate a CIDR subnet string (e.g. "192.168.10.0/24").
 * Returns empty string if invalid.
 */
export const sanitizeSubnet = (subnet) => {
  const cleaned = String(subnet ?? "").replace(/[^0-9./]/g, "").slice(0, 18);
  const [ip, prefix] = cleaned.split("/");
  if (!ip || prefix === undefined) return "";
  const prefixNum = parseInt(prefix, 10);
  if (prefixNum < 0 || prefixNum > 32 || isNaN(prefixNum)) return "";
  const validIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every((o) => parseInt(o, 10) <= 255);
  return validIP ? cleaned : "";
};

/**
 * Sanitize IP or subnet — tries subnet first, then plain IP.
 * Used for gateway fields that never contain prefix.
 */
export const sanitizeIP = (ip) => sanitizeIPv4(ip);
