import { useState } from "react";
import { Section } from "../ui";
import { VlanRow } from "../vlan/VlanRow";
import { VlanForm } from "../vlan/VlanForm";
import { VLAN_SUGGESTIONS, COLORS, DEFAULT_VLAN_COLOR } from "../../constants";

const safeColor = (c) => /^#[0-9a-fA-F]{6}$/.test(c) ? c : DEFAULT_VLAN_COLOR;

export const VlansTab = ({ vlans, onAdd, onUpdate, onDelete, onAddSuggestion }) => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (form) => {
    const err = onAdd(form);
    if (!err) setShowForm(false);
    return err;
  };

  return (
    <div>
      <p style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 0 }}>
        Определи VLAN-ы для своей сети.
      </p>

      {/* Quick-add suggestions */}
      <div style={{ marginBottom: 16 }}>
        <Section>Быстрое добавление</Section>
        <div role="list" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {VLAN_SUGGESTIONS.map((s) => {
            const added = !!vlans.find((v) => v.id === s.id);
            return (
              <button
                key={s.id}
                role="listitem"
                onClick={() => onAddSuggestion(s)}
                disabled={added}
                aria-label={`${added ? "Добавлен" : "Добавить"} VLAN ${s.id} — ${s.name}`}
                aria-pressed={added}
                style={{
                  background:   added ? COLORS.bgHover  : COLORS.bgSurface,
                  border:       `1px solid ${added ? COLORS.border : safeColor(s.color) + "55"}`,
                  borderRadius: 6,
                  padding:      "5px 10px",
                  cursor:       added ? "default" : "pointer",
                  color:        added ? COLORS.textMuted : COLORS.textPrimary,
                  fontSize:     11,
                  display:      "flex",
                  alignItems:   "center",
                  gap:          5,
                }}
              >
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: added ? COLORS.textMuted : safeColor(s.color) }} />
                VLAN{s.id} · {s.name}
                {added && <span aria-hidden="true" style={{ color: COLORS.green }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* VLAN list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
        {vlans.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 12, padding: 16, textAlign: "center", border: `1px dashed ${COLORS.border}`, borderRadius: 8 }}>
            Нет VLAN-ов — добавь из списка выше или создай вручную
          </div>
        )}
        {vlans.map((v) => (
          <VlanRow key={v.id} vlan={v} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>

      {showForm ? (
        <VlanForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background:   "none",
            border:       `1px dashed ${COLORS.borderSubtle}`,
            borderRadius: 8,
            padding:      "8px 18px",
            color:        COLORS.blue,
            cursor:       "pointer",
            fontSize:     12,
            width:        "100%",
          }}
        >
          + Создать VLAN вручную
        </button>
      )}
    </div>
  );
};
