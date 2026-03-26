import { useState } from "react";
import { Btn, Inp, InlineError } from "../ui";
import { LIMITS, COLORS, DEFAULT_VLAN_COLOR } from "../../constants";

const EMPTY = { id: "", name: "", subnet: "", gateway: "", color: DEFAULT_VLAN_COLOR, purpose: "" };

const FIELDS = [
  ["ID",         "id",      LIMITS.nameMaxLen   ],
  ["Название",   "name",    LIMITS.nameMaxLen   ],
  ["Подсеть",    "subnet",  LIMITS.subnetMaxLen  ],
  ["Шлюз",       "gateway", LIMITS.gatewayMaxLen ],
  ["Назначение", "purpose", LIMITS.purposeMaxLen ],
];

/** Validate that a color value is a proper #rrggbb hex string. */
const isValidHex = (c) => /^#[0-9a-fA-F]{6}$/.test(c);

export const VlanForm = ({ onAdd, onCancel }) => {
  const [form,  setForm]  = useState(EMPTY);
  const [error, setError] = useState("");

  const set = (field, val) => {
    // For color field: only accept valid hex (browser <input type=color> always
    // returns #rrggbb, but guard against programmatic invalid values)
    if (field === "color" && !isValidHex(val)) return;
    setForm((f) => ({ ...f, [field]: val }));
    setError("");
  };

  const handleSubmit = () => {
    const err = onAdd(form);
    if (err) { setError(err); return; }
    setForm(EMPTY);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleSubmit();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div
      style={{ background: COLORS.bgSurface, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 8, padding: 13 }}
      onKeyDown={handleKeyDown}
    >
      <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 9 }}>Новый VLAN</div>

      <div style={{ display: "grid", gridTemplateColumns: "68px 1fr 1fr 1fr 1fr 32px", gap: 7, marginBottom: 8 }}>
        {FIELDS.map(([label, key, maxLen]) => (
          <div key={key}>
            <label htmlFor={`new-vlan-${key}`} style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}>
              {label}
            </label>
            <Inp
              id={`new-vlan-${key}`}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={label}
              maxLength={maxLen}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>
        ))}
        <div>
          <label htmlFor="new-vlan-color" style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}>
            Цвет
          </label>
          <input
            id="new-vlan-color"
            type="color"
            value={isValidHex(form.color) ? form.color : DEFAULT_VLAN_COLOR}
            onChange={(e) => set("color", e.target.value)}
            aria-label="Цвет VLAN"
            style={{ width: "100%", height: 27, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 4, background: COLORS.bgBase, cursor: "pointer" }}
          />
        </div>
      </div>

      <InlineError message={error} />

      <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
        <Btn green onClick={handleSubmit}>Добавить</Btn>
        <Btn onClick={onCancel}>Отмена</Btn>
      </div>
    </div>
  );
};
