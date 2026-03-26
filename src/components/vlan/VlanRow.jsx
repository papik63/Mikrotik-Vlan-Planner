import { useState } from "react";
import { Btn, Inp, InlineError } from "../ui";
import { COLORS, LIMITS, DEFAULT_VLAN_COLOR } from "../../constants";

const isValidHex = (c) => /^#[0-9a-fA-F]{6}$/.test(c);

export const VlanRow = ({ vlan, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [idError, setIdError] = useState("");

  const handleUpdate = (field, val) => {
    const err = onUpdate(vlan.id, field, val);
    if (field === "id") setIdError(err || "");
  };

  const handleToggleEdit = () => {
    setEditing((e) => !e);
    setIdError("");
  };

  const safeColor = isValidHex(vlan.color) ? vlan.color : DEFAULT_VLAN_COLOR;

  return (
    <div
      style={{
        background:          COLORS.bgSurface,
        border:              `1px solid ${COLORS.border}`,
        borderLeft:          `3px solid ${safeColor}`,
        borderRadius:        8,
        padding:             "8px 12px",
        display:             "grid",
        gridTemplateColumns: "60px 1fr 145px 145px 1fr auto",
        gap:                 8,
        alignItems:          "start",
      }}
    >
      {/* ID */}
      <div>
        <label style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }} htmlFor={`vlan-id-${vlan.id}`}>
          ID
        </label>
        {editing ? (
          <>
            <Inp
              id={`vlan-id-${vlan.id}`}
              value={String(vlan.id)}
              onChange={(e) => handleUpdate("id", e.target.value)}
              maxLength={4}
              ariaLabel="VLAN ID"
              style={{ width: 44, color: safeColor }}
            />
            <InlineError message={idError} />
          </>
        ) : (
          <strong style={{ color: safeColor, fontSize: 14 }}>{vlan.id}</strong>
        )}
      </div>

      {/* Text fields */}
      {[
        ["name",    "Название",  LIMITS.nameMaxLen   ],
        ["subnet",  "Подсеть",   LIMITS.subnetMaxLen  ],
        ["gateway", "Шлюз",      LIMITS.gatewayMaxLen ],
        ["purpose", "Назначение",LIMITS.purposeMaxLen ],
      ].map(([field, label, maxLen]) => (
        <div key={field}>
          <label
            htmlFor={`vlan-${field}-${vlan.id}`}
            style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}
          >
            {label}
          </label>
          {editing ? (
            <Inp
              id={`vlan-${field}-${vlan.id}`}
              value={vlan[field] || ""}
              onChange={(e) => handleUpdate(field, e.target.value)}
              maxLength={maxLen}
              style={{ width: "100%" }}
            />
          ) : (
            <div style={{ fontSize: 11, color: field === "name" ? COLORS.textPrimary : COLORS.textSecondary }}>
              {vlan[field] || "—"}
            </div>
          )}
        </div>
      ))}

      {/* Actions */}
      <div style={{ display: "flex", gap: 5, alignItems: "center", paddingTop: 16 }}>
        {editing && (
          <input
            type="color"
            value={isValidHex(vlan.color) ? vlan.color : DEFAULT_VLAN_COLOR}
            onChange={(e) => {
              if (isValidHex(e.target.value)) handleUpdate("color", e.target.value);
            }}
            aria-label="Цвет VLAN"
            style={{ width: 24, height: 24, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: 4, background: COLORS.bgBase, cursor: "pointer", padding: 1 }}
          />
        )}
        <Btn onClick={handleToggleEdit} ariaLabel={editing ? "Сохранить" : "Редактировать"}>
          {editing ? "✓" : "✎"}
        </Btn>
        <Btn danger onClick={() => onDelete(vlan.id)} ariaLabel={`Удалить VLAN ${vlan.id}`}>✕</Btn>
      </div>
    </div>
  );
};
