import { CopyButton, DeviceTypeBadge } from "../ui";
import { DEVICE_TYPES, MONO_FONT, COLORS } from "../../constants";
import { genRouterCLI, genSwitchCLI } from "../../utils/cli";

const DEVICE_STYLE = {
  router: { border: COLORS.routerBorder, headerBg: COLORS.routerBg, nameColor: COLORS.blue  },
  switch: { border: COLORS.switchBorder, headerBg: COLORS.switchBg, nameColor: COLORS.green },
};

export const CliBlock = ({ device, vlans, portCfg }) => {
  const cli       = device.type === "router"
    ? genRouterCLI(device, vlans, portCfg)
    : genSwitchCLI(device, vlans, portCfg);

  const style     = DEVICE_STYLE[device.type];
  const typeLabel = DEVICE_TYPES.find((t) => t.value === device.type)?.label;
  const cliId     = `cli-${device.id}`;

  return (
    <section aria-label={`CLI для ${device.name}`} style={{ background: COLORS.bgBase, border: `1px solid ${style.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{
        padding:      "8px 14px",
        background:   style.headerBg,
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        borderBottom: `1px solid ${style.border}`,
      }}>
        <span aria-hidden="true" style={{ fontSize: 16 }}>{device.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: style.nameColor }}>{device.name}</span>
        <DeviceTypeBadge type={device.type} label={typeLabel} />
        {/* P2 fix: CopyButton with visual feedback replaces silent navigator.clipboard */}
        <CopyButton text={cli} style={{ marginLeft: "auto" }} />
      </div>
      <pre
        id={cliId}
        aria-label={`RouterOS конфигурация для ${device.name}`}
        style={{ margin: 0, padding: "14px 16px", fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.85, overflowX: "auto", fontFamily: MONO_FONT }}
      >
        {cli}
      </pre>
    </section>
  );
};
