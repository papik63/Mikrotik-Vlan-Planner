import { useMemo } from "react";
import { Section, Tag, DeviceTypeBadge } from "../ui";
import { CliBlock } from "../cli/CliBlock";
import { DEVICE_TYPES, COLORS } from "../../constants";

export const SummaryTab = ({ vlans, devices, portCfg, getPortConfig }) => {
  const cliDevices = useMemo(
    () => devices.filter((d) => d.type === "router" || d.type === "switch"),
    [devices]
  );

  const portRows = useMemo(() =>
    devices.flatMap((dev) =>
      dev.ports.length === 0
        ? [{ dev, port: null, cfg: {} }]
        : dev.ports.map((port) => ({ dev, port, cfg: getPortConfig(dev.id, port) }))
    ),
    [devices, getPortConfig]
  );

  return (
    <div>
      {/* ── VLAN table ── */}
      <div style={{ marginBottom: 20 }}>
        <Section>VLAN-таблица</Section>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} aria-label="Таблица VLAN">
          <thead>
            <tr style={{ background: COLORS.bgSurface }}>
              {["VLAN ID", "Название", "Подсеть", "Шлюз", "DHCP пул", "Назначение"].map((h) => (
                <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: COLORS.textMuted, fontSize: 10, letterSpacing: 1, fontWeight: 500, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vlans.map((v, i) => {
              const net = v.subnet ? v.subnet.replace(/\.\d+\/\d+$/, "") : "";
              return (
                <tr key={v.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 ? COLORS.bgBase : "transparent" }}>
                  <td style={{ padding: "6px 10px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: v.color }} />
                      <strong style={{ color: v.color }}>{v.id}</strong>
                    </span>
                  </td>
                  <td style={{ padding: "6px 10px" }}>{v.name}</td>
                  <td style={{ padding: "6px 10px", color: COLORS.textSecondary }}>{v.subnet || "—"}</td>
                  <td style={{ padding: "6px 10px", color: COLORS.textSecondary }}>{v.gateway || "—"}</td>
                  <td style={{ padding: "6px 10px", color: COLORS.textSecondary }}>{net ? `${net}.10 – ${net}.254` : "—"}</td>
                  <td style={{ padding: "6px 10px", color: COLORS.textSecondary }}>{v.purpose || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Port assignment table ── */}
      <div style={{ marginBottom: 20 }}>
        <Section>Назначение портов</Section>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} aria-label="Назначение портов">
          <thead>
            <tr style={{ background: COLORS.bgSurface }}>
              {["Устройство", "Тип", "Порт", "VLAN", "Тип порта", "Bridge", "Заметка"].map((h) => (
                <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: COLORS.textMuted, fontSize: 10, letterSpacing: 1, fontWeight: 500, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {portRows.map(({ dev, port, cfg }, i) => {
              const vl        = vlans.find((v) => v.id === parseInt(cfg?.vlan, 10));
              const typeLabel = DEVICE_TYPES.find((t) => t.value === dev.type)?.label || dev.type;
              // P2 fix: stable key — use device id + port name only, not index
              const rowKey = port ? `${dev.id}::${port}` : `${dev.id}::empty`;
              return (
                <tr key={rowKey} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 ? COLORS.bgBase : "transparent" }}>
                  <td style={{ padding: "6px 10px", color: COLORS.textPrimary, whiteSpace: "nowrap" }}>
                    <span aria-hidden="true">{dev.icon}</span> {dev.name}
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    <DeviceTypeBadge type={dev.type} label={typeLabel} />
                  </td>
                  <td style={{ padding: "6px 10px", color: COLORS.blue }}>
                    {port || <span style={{ color: COLORS.textMuted }}>нет портов</span>}
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    {!port ? "—" : cfg.vlan === "trunk" ? (
                      <span style={{ color: COLORS.amber }}>Trunk: {cfg.trunkVlans || "—"}</span>
                    ) : vl ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: vl.color }} />
                        <span style={{ color: vl.color }}>VLAN{vl.id}</span>
                        <span style={{ color: COLORS.textMuted }}>· {vl.name}</span>
                      </span>
                    ) : <span style={{ color: COLORS.textMuted }}>—</span>}
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    {cfg.frameType ? <Tag type={cfg.frameType} /> : <span style={{ color: COLORS.textMuted }}>—</span>}
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    {cfg.addBridge
                      ? <span style={{ color: COLORS.green }} aria-label="Да">✓</span>
                      : <span style={{ color: COLORS.textMuted }} aria-label="Нет">—</span>}
                  </td>
                  <td style={{ padding: "6px 10px", color: COLORS.textMuted, fontSize: 11 }}>{cfg.note || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── CLI blocks ── */}
      {cliDevices.length === 0 ? (
        <div style={{ color: COLORS.textMuted, fontSize: 12, padding: 16, textAlign: "center", border: `1px dashed ${COLORS.border}`, borderRadius: 8 }}>
          Нет устройств с типом «Роутер» или «Коммутатор» — CLI не генерируется.
          <br />Измени тип устройства на вкладке «Устройства и порты».
        </div>
      ) : (
        <div>
          <Section>CLI конфигурации</Section>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cliDevices.map((dev) => (
              <CliBlock key={dev.id} device={dev} vlans={vlans} portCfg={portCfg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
