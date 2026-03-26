import { useState } from "react";
import { Btn, Inp } from "../ui";
import { DEVICE_TYPES, UI_FONT, COLORS, LIMITS } from "../../constants";

const EMPTY = { name: "", icon: "◆", type: "router" };

export const DeviceForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState(EMPTY);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    setForm(EMPTY);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div
      style={{ background: COLORS.bgSurface, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 8, padding: 12 }}
      onKeyDown={handleKeyDown}
    >
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 9 }}>Новое устройство</div>

      <div style={{ display: "flex", gap: 7, marginBottom: 9, flexWrap: "wrap" }}>
        <div>
          <label htmlFor="new-dev-icon" style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}>Иконка</label>
          <Inp id="new-dev-icon" value={form.icon} onChange={(e) => set("icon", e.target.value)} maxLength={2} style={{ width: 34 }} />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label htmlFor="new-dev-name" style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}>Название</label>
          <Inp
            id="new-dev-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Роутер 2, AP-офис..."
            maxLength={LIMITS.nameMaxLen}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label htmlFor="new-dev-type" style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}>Тип</label>
          <select
            id="new-dev-type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            style={{
              background: COLORS.bgBase, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 4,
              color: COLORS.textPrimary, fontFamily: UI_FONT, fontSize: 11, padding: "4px 7px",
            }}
          >
            {DEVICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 7 }}>
        <Btn green onClick={handleSubmit}>Добавить</Btn>
        <Btn onClick={onCancel}>Отмена</Btn>
      </div>
    </div>
  );
};
