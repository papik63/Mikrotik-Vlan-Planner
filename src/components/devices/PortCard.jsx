import { Inp, Lbl, Btn, Tag, Select } from "../ui";
import { LIMITS, COLORS } from "../../constants";

export const PortCard = ({ devId, port, vlans, cfg, onRename, onDelete, onSetConfig }) => {
  const set = (field, val) => onSetConfig(devId, port, field, val);
  const portId = `${devId}-${port}`.replace(/[^a-z0-9-]/gi, "_");

  return (
    <div style={{ background: COLORS.bgBase, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 10px" }}>

      {/* Port name */}
      <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 7 }}>
        <Inp
          value={port}
          onChange={(e) => onRename(devId, port, e.target.value)}
          maxLength={LIMITS.portNameMaxLen}
          ariaLabel="Имя порта"
          style={{ flex: 1, color: COLORS.blue, fontWeight: 600 }}
        />
        <Btn danger onClick={() => onDelete(devId, port)} ariaLabel={`Удалить порт ${port}`}>✕</Btn>
      </div>

      {/* VLAN */}
      <Lbl htmlFor={`${portId}-vlan`}>VLAN</Lbl>
      <Select
        value={cfg.vlan || ""}
        onChange={(e) => set("vlan", e.target.value)}
        ariaLabel="Назначение VLAN"
        style={{ marginBottom: 6 }}
      >
        <option value="">— не назначен —</option>
        {vlans.map((v) => (
          <option key={v.id} value={v.id}>VLAN{v.id} · {v.name}</option>
        ))}
        <option value="trunk">Trunk (несколько VLAN)</option>
      </Select>

      {cfg.vlan === "trunk" && (
        <>
          <Lbl htmlFor={`${portId}-trunk`}>VLAN-ы (через запятую)</Lbl>
          <Inp
            id={`${portId}-trunk`}
            value={cfg.trunkVlans || ""}
            onChange={(e) => set("trunkVlans", e.target.value)}
            placeholder="10,20,30"
            maxLength={100}
            style={{ width: "100%", boxSizing: "border-box", marginBottom: 6 }}
          />
        </>
      )}

      {/* Frame type */}
      <Lbl htmlFor={`${portId}-frame`}>Тип порта</Lbl>
      <Select
        value={cfg.frameType || ""}
        onChange={(e) => set("frameType", e.target.value)}
        ariaLabel="Тип порта"
        style={{ marginBottom: 6 }}
      >
        <option value="">— выбери —</option>
        <option value="tagged">tagged (trunk)</option>
        <option value="untagged">untagged (access)</option>
        <option value="hybrid">hybrid (mixed)</option>
      </Select>

      {cfg.frameType && (
        <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <Tag type={cfg.frameType} />
          <span style={{ fontSize: 10, color: COLORS.textMuted }}>
            {cfg.frameType === "tagged"   && "admit-only-vlan-tagged"}
            {cfg.frameType === "untagged" && "admit-only-untagged-and-priority-tagged"}
            {cfg.frameType === "hybrid"   && "admit-all"}
          </span>
        </div>
      )}

      {/* Bridge in VLAN */}
      <label
        htmlFor={`${portId}-bridge`}
        style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}
      >
        <input
          id={`${portId}-bridge`}
          type="checkbox"
          checked={cfg.addBridge || false}
          onChange={(e) => set("addBridge", e.target.checked)}
          style={{ accentColor: COLORS.blue }}
        />
        Добавить bridge в VLAN
      </label>

      {/* Note */}
      <Lbl htmlFor={`${portId}-note`}>Заметка</Lbl>
      <Inp
        id={`${portId}-note`}
        value={cfg.note || ""}
        onChange={(e) => set("note", e.target.value)}
        placeholder="Подключён к..."
        maxLength={LIMITS.noteMaxLen}
        style={{ width: "100%", boxSizing: "border-box", color: COLORS.textSecondary }}
      />
    </div>
  );
};
