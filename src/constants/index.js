// ─── Typography ──────────────────────────────────────────────────────────────

export const UI_FONT   = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
export const MONO_FONT = "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";

// ─── Design tokens — single source of truth for all colors ───────────────────

export const COLORS = {
  // Backgrounds
  bgBase:    "#0d1117",
  bgSurface: "#161b22",
  bgSunken:  "#0d1117",
  bgHover:   "#21262d",

  // Borders
  border:       "#21262d",
  borderSubtle: "#30363d",

  // Text
  textPrimary:  "#e6edf3",
  textSecondary:"#8b949e",
  textMuted:    "#484f58",

  // Accents
  blue:   "#58a6ff",
  green:  "#3fb950",
  amber:  "#f59e0b",
  orange: "#f97316",
  red:    "#f85149",
  purple: "#8b5cf6",
  cyan:   "#06b6d4",

  // Semantic surfaces
  blueBg:   "#0c2d6b",
  greenBg:  "#0a3a2a",
  amberBg:  "#2d1a00",
  redBg:    "#1c1010",

  // Router / switch accent
  routerBg:    "#0c1f4a",
  routerBorder:"#1d3a6b",
  switchBg:    "#061f14",
  switchBorder:"#0a3a2a",
};

// ─── Storage ─────────────────────────────────────────────────────────────────

/** Bump version suffix when localStorage schema changes to avoid parse errors. */
export const LS_KEY = "vlan-planner-v1";

/** Max file size for JSON import (bytes). */
export const MAX_IMPORT_SIZE = 1024 * 1024; // 1 MB

// ─── Validation limits ───────────────────────────────────────────────────────

export const LIMITS = {
  vlanIdMin:      1,
  vlanIdMax:      4094,
  nameMaxLen:     64,
  portNameMaxLen: 32,
  noteMaxLen:     200,
  subnetMaxLen:   18,
  gatewayMaxLen:  15,
  purposeMaxLen:  100,
  maxVlans:       100,
  maxDevices:     50,
  maxPortsPerDev: 64,
};

// ─── Domain data ─────────────────────────────────────────────────────────────

export const VLAN_SUGGESTIONS = [
  { id: 10, name: "Управление",      subnet: "192.168.10.0/24", gateway: "192.168.10.1", color: "#3b82f6", purpose: "Управление сетевым оборудованием" },
  { id: 20, name: "Серверы",         subnet: "192.168.20.0/24", gateway: "192.168.20.1", color: "#8b5cf6", purpose: "Гипервизоры и виртуальные машины"  },
  { id: 30, name: "IPKVM",           subnet: "192.168.30.0/24", gateway: "192.168.30.1", color: "#06b6d4", purpose: "Удалённый доступ к серверам"        },
  { id: 40, name: "Видеонаблюдение", subnet: "192.168.40.0/24", gateway: "192.168.40.1", color: "#f59e0b", purpose: "Камеры и видеорегистратор"          },
  { id: 50, name: "Хранилище",       subnet: "192.168.50.0/24", gateway: "192.168.50.1", color: "#10b981", purpose: "NAS и резервное копирование"        },
  { id: 60, name: "Wi-Fi основной",  subnet: "192.168.60.0/24", gateway: "192.168.60.1", color: "#f97316", purpose: "Рабочие устройства по Wi-Fi"        },
  { id: 70, name: "Wi-Fi гостевой",  subnet: "192.168.70.0/24", gateway: "192.168.70.1", color: "#ef4444", purpose: "Гостевой доступ в интернет"         },
];

export const DEVICE_TYPES = [
  { value: "router", label: "Роутер",     icon: "⬡" },
  { value: "switch", label: "Коммутатор", icon: "⬢" },
  { value: "other",  label: "Другое",     icon: "◆" },
];

const VALID_DEVICE_TYPE_VALUES = new Set(DEVICE_TYPES.map((t) => t.value));
export { VALID_DEVICE_TYPE_VALUES };

export const INITIAL_DEVICES = [
  { id: "router",  name: "Роутер",               icon: "⬡", type: "router", ports: ["ether1-WAN", "ether2", "ether3", "ether4", "ether5", "sfp1"] },
  { id: "switch",  name: "Коммутатор",            icon: "⬢", type: "switch", ports: ["ether1", "ether2", "ether3", "ether4", "ether5", "ether6", "ether7", "ether8", "sfp1"] },
  { id: "server1", name: "Сервер 1 (Гипервизор)", icon: "▣", type: "other",  ports: ["eth0", "eth1", "IPKVM"] },
  { id: "server2", name: "Сервер 2 (Гипервизор)", icon: "▣", type: "other",  ports: ["eth0", "eth1", "IPKVM"] },
  { id: "nvr",     name: "Видеорегистратор",       icon: "◉", type: "other",  ports: ["LAN"] },
  { id: "nas",     name: "Сетевое хранилище",      icon: "▤", type: "other",  ports: ["eth0", "eth1"] },
  { id: "ap",      name: "Точка доступа",          icon: "◎", type: "other",  ports: ["ether1", "SSID-Main", "SSID-Guest"] },
  { id: "cameras", name: "Камеры (группа)",        icon: "◈", type: "other",  ports: ["LAN"] },
];

export const INITIAL_STATE = {
  vlans:   [VLAN_SUGGESTIONS[0], VLAN_SUGGESTIONS[3]],
  devices: INITIAL_DEVICES,
  portCfg: {},
};

// ─── UI ──────────────────────────────────────────────────────────────────────

/** Default color for a newly created VLAN */
export const DEFAULT_VLAN_COLOR = "#6366f1";

export const TABS = [
  { id: "vlans",   label: "1. VLAN"               },
  { id: "ports",   label: "2. Устройства и порты" },
  { id: "summary", label: "3. Итог и CLI"          },
];

// ─── Demo state — full topology from mikrotik.wiki article ───────────────────
// Source: https://mikrotik.wiki/wiki/Настройка_VLAN_на_MikroTik

export const DEMO_VLANS = [
  { id: 10, name: "Управление",  subnet: "192.168.10.0/24", gateway: "192.168.10.1", color: "#3b82f6", purpose: "Управление сетевым оборудованием" },
  { id: 20, name: "Сотрудники",  subnet: "192.168.20.0/24", gateway: "192.168.20.1", color: "#8b5cf6", purpose: "Рабочие устройства сотрудников"    },
  { id: 30, name: "Телефония",   subnet: "192.168.30.0/24", gateway: "192.168.30.1", color: "#06b6d4", purpose: "IP-телефония"                       },
  { id: 40, name: "Серверы",     subnet: "192.168.40.0/24", gateway: "192.168.40.1", color: "#10b981", purpose: "Серверный сегмент"                  },
  { id: 50, name: "Гостевые",    subnet: "192.168.50.0/24", gateway: "192.168.50.1", color: "#f97316", purpose: "Гостевой Wi-Fi"                     },
];

export const DEMO_DEVICES = [
  {
    id:    "demo-r1",
    name:  "R1 (Маршрутизатор)",
    icon:  "⬡",
    type:  "router",
    ports: ["ether1-WAN", "sfp-sfpplus1"],
  },
  {
    id:    "demo-sw1",
    name:  "SW1 (Коммутатор уровня распределения)",
    icon:  "⬢",
    type:  "switch",
    ports: ["sfp-sfpplus1", "ether1", "ether2", "ether3"],
  },
  {
    id:    "demo-sw2",
    name:  "SW2 (Коммутатор уровня доступа)",
    icon:  "⬢",
    type:  "switch",
    ports: ["ether1", "ether2", "ether3"],
  },
  {
    id:    "demo-ap1",
    name:  "AP1 (Точка доступа Wi-Fi)",
    icon:  "◎",
    type:  "other",
    ports: ["ether1", "SSID-Office", "SSID-Guest"],
  },
];

// Port configuration matching the article topology exactly:
//
// R1:
//   ether1-WAN  — WAN uplink, не в bridge
//   sfp-sfpplus1 — trunk к SW1, tagged все VLAN, bridge добавлен (CPU-порт для всех VLAN)
//
// SW1:
//   sfp-sfpplus1 — trunk к R1, tagged все VLAN
//   ether1       — trunk к SW2, tagged VLAN 10,20,30
//   ether2       — access к серверу, untagged VLAN 40
//   ether3       — trunk к AP1, tagged VLAN 10,20,50
//   bridge добавлен в VLAN 10 (управление)
//
// SW2:
//   ether1 — trunk к SW1, tagged VLAN 10,20,30
//   ether2 — access к ПК, untagged VLAN 20
//   ether3 — hybrid (телефон VLAN30 tagged + ПК VLAN20 untagged)
//   bridge добавлен в VLAN 10 (управление)
//
// AP1 (type=other — CLI не генерируется):
//   ether1     — trunk к SW1, tagged VLAN 10,20,50
//   SSID-Office — untagged VLAN 20
//   SSID-Guest  — untagged VLAN 50

export const DEMO_PORT_CFG = {
  "demo-r1": {
    "ether1-WAN":    { vlan: "",    frameType: "",        addBridge: false, note: "WAN — подключение к интернету" },
    "sfp-sfpplus1":  { vlan: "trunk", trunkVlans: "10,20,30,40,50", frameType: "tagged", addBridge: true,  note: "Trunk к SW1" },
  },
  "demo-sw1": {
    "sfp-sfpplus1":  { vlan: "trunk", trunkVlans: "10,20,30,40,50", frameType: "tagged", addBridge: false, note: "Trunk к R1" },
    "ether1":        { vlan: "trunk", trunkVlans: "10,20,30",        frameType: "tagged", addBridge: false, note: "Trunk к SW2" },
    "ether2":        { vlan: "40",    frameType: "untagged", addBridge: false, note: "Сервер (VLAN 40)" },
    "ether3":        { vlan: "trunk", trunkVlans: "10,20,50",        frameType: "tagged", addBridge: false, note: "Trunk к AP1" },
  },
  "demo-sw1-bridge": {
    // Bridge в VLAN 10 задаётся через addBridge на порту sfp-sfpplus1 + запись в таблице VLAN
    // Реализуется через отдельную запись для bridge-порта коммутатора
  },
  "demo-sw2": {
    "ether1":        { vlan: "trunk", trunkVlans: "10,20,30", frameType: "tagged",   addBridge: false, note: "Trunk к SW1" },
    "ether2":        { vlan: "20",    frameType: "untagged", addBridge: false, note: "ПК сотрудника (VLAN 20)" },
    "ether3":        { vlan: "20",    frameType: "hybrid",   addBridge: false, note: "Телефон (VLAN 30 tagged) + ПК (VLAN 20 untagged)" },
  },
  "demo-ap1": {
    "ether1":        { vlan: "trunk", trunkVlans: "10,20,50", frameType: "tagged",   addBridge: false, note: "Trunk к SW1" },
    "SSID-Office":   { vlan: "20",    frameType: "untagged", addBridge: false, note: "Основная Wi-Fi сеть сотрудников" },
    "SSID-Guest":    { vlan: "50",    frameType: "untagged", addBridge: false, note: "Гостевая Wi-Fi сеть" },
  },
};

// Fix: SW1 bridge needs to be in VLAN 10 — set addBridge on sfp-sfpplus1
// and ether1 (trunk ports that carry VLAN 10) won't have addBridge,
// but the bridge itself must be listed as tagged in VLAN 10.
// We accomplish this by setting addBridge=true on the sfp-sfpplus1 port of SW1
// which triggers the CLI generator to add bridge1 to VLAN 10 tagged list.

// Override SW1 sfp-sfpplus1 to have addBridge=true for management VLAN
DEMO_PORT_CFG["demo-sw1"]["sfp-sfpplus1"].addBridge = true;

// Override SW2 ether1 to have addBridge=true for management VLAN
DEMO_PORT_CFG["demo-sw2"]["ether1"].addBridge = true;

// Remove the placeholder bridge entry
delete DEMO_PORT_CFG["demo-sw1-bridge"];

export const DEMO_STATE = {
  vlans:   DEMO_VLANS,
  devices: DEMO_DEVICES,
  portCfg: DEMO_PORT_CFG,
};

// ─── Empty state — for "Clear all" action ────────────────────────────────────

export const EMPTY_STATE = {
  vlans:   [],
  devices: [],
  portCfg: {},
};
