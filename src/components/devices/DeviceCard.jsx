import { useState } from "react";
import { Btn, Inp, DeviceTypeBadge } from "../ui";
import { PortCard } from "./PortCard";
import { DEVICE_TYPES, UI_FONT, COLORS, LIMITS } from "../../constants";

export const DeviceCard = ({ device, vlans, getPortConfig, store }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [newPort,  setNewPort]  = useState("");

  const typeLabel = DEVICE_TYPES.find((t) => t.value === device.type)?.label || device.type;

  const handleAddPort = () => {
    const name = newPort.trim();
    if (!name) return;
    store.addPort(device.id, name);
    setNewPort("");
  };

  const handlePortKeyDown = (e) => {
    if (e.key === "Enter") handleAddPort();
  };

  return (
    <div style={{ background: COLORS.bgSurface, border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>

      {/* ── Header row ── */}
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden="true" style={{ fontSize: 16 }}>{device.icon}</span>

        {editing ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1, flexWrap: "wrap" }}>
            <Inp
              value={device.icon}
              onChange={(e) => store.updateDevice(device.id, "icon", e.target.value)}
              maxLength={2}
              ariaLabel="Иконка устройства"
              style={{ width: 32 }}
            />
            <Inp
              value={device.name}
              onChange={(e) => store.updateDevice(device.id, "name", e.target.value)}
              maxLength={LIMITS.nameMaxLen}
              ariaLabel="Название устройства"
              style={{ flex: 1, minWidth: 120 }}
            />
            <select
              value={device.type}
              onChange={(e) => store.updateDevice(device.id, "type", e.target.value)}
              aria-label="Тип устройства"
              style={{
                background: COLORS.bgBase, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 4,
                color: COLORS.textPrimary, fontFamily: UI_FONT, fontSize: 11, padding: "4px 6px",
              }}
            >
              {DEVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <Btn accent onClick={() => setEditing(false)} ariaLabel="Сохранить изменения">✓ Готово</Btn>
          </div>
        ) : (
          <>
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-controls={`device-ports-${device.id}`}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, flex: 1, textAlign: "left",
                color: COLORS.textPrimary, fontFamily: UI_FONT,
              }}
            >
              {device.name}
            </button>
            <DeviceTypeBadge type={device.type} label={typeLabel} />
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{device.ports.length} портов</span>
            <Btn onClick={() => setEditing(true)} ariaLabel={`Редактировать ${device.name}`}>✎</Btn>
            <Btn danger onClick={() => store.deleteDevice(device.id)} ariaLabel={`Удалить ${device.name}`}>✕</Btn>
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={expanded ? "Свернуть" : "Развернуть"}
              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 11, userSelect: "none", fontFamily: UI_FONT }}
            >
              {expanded ? "▲" : "▼"}
            </button>
          </>
        )}
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div id={`device-ports-${device.id}`} style={{ borderTop: `1px solid ${COLORS.border}`, padding: 12 }}>
          {(device.type === "router" || device.type === "switch") && (
            <div style={{
              fontSize: 11, color: COLORS.textSecondary,
              background: COLORS.bgBase, border: `1px solid ${COLORS.borderSubtle}`,
              borderRadius: 5, padding: "6px 10px", marginBottom: 10,
            }}>
              💡 Добавляй <strong style={{ color: COLORS.blue }}>bridge</strong> в VLAN только
              если устройству нужен IP в этом VLAN (управление, DHCP, маршрутизация).
            </div>
          )}

          {device.ports.length === 0 && (
            <p style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 10, margin: "0 0 10px" }}>
              Нет портов — добавь ниже
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 9, marginBottom: 10 }}>
            {device.ports.map((port) => (
              <PortCard
                key={`${device.id}-${port}`}
                devId={device.id}
                port={port}
                vlans={vlans}
                cfg={getPortConfig(device.id, port)}
                onRename={store.renamePort}
                onDelete={store.deletePort}
                onSetConfig={store.setPortConfig}
              />
            ))}
          </div>

          {/* Add port */}
          <div style={{ display: "flex", gap: 6 }}>
            <Inp
              value={newPort}
              onChange={(e) => setNewPort(e.target.value)}
              placeholder="Имя нового порта (ether9, SSID-Corp, bond0...)"
              maxLength={LIMITS.portNameMaxLen}
              ariaLabel="Имя нового порта"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAddPort}
              onKeyDown={handlePortKeyDown}
              aria-label="Добавить порт"
              style={{
                background: COLORS.bgHover, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 4,
                padding: "4px 12px", color: COLORS.blue, cursor: "pointer",
                fontSize: 11, fontFamily: UI_FONT,
              }}
            >
              + Порт
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
