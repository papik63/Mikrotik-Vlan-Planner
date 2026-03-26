import { useEffect, useRef } from "react";
import { Btn } from "../ui";
import { COLORS } from "../../constants";

/**
 * @param {"demo"|"clear"} mode
 */
export const ResetModal = ({ mode, onConfirm, onCancel }) => {
  const cancelRef = useRef(null);

  useEffect(() => { cancelRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  const isDemo  = mode === "demo";
  const title   = isDemo ? "Загрузить Demo?" : "Очистить всё?";
  const desc    = isDemo
    ? "Текущий план будет заменён примером из статьи mikrotik.wiki. Несохранённые изменения будут потеряны."
    : "Все VLAN-ы, устройства и настройки портов будут удалены. Это действие нельзя отменить.";
  const confirmLabel = isDemo ? "Загрузить Demo" : "Очистить всё";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      aria-describedby="reset-modal-desc"
      style={{
        position:       "fixed",
        inset:          0,
        background:     "#00000099",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background:   COLORS.bgSurface,
        border:       `1px solid ${isDemo ? COLORS.blue + "50" : COLORS.red + "50"}`,
        borderRadius: 10,
        padding:      24,
        maxWidth:     380,
        width:        "90%",
      }}>
        <div
          id="reset-modal-title"
          style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: isDemo ? COLORS.blue : COLORS.red }}
        >
          {title}
        </div>
        <p
          id="reset-modal-desc"
          style={{ fontSize: 12, color: COLORS.textSecondary, margin: "0 0 18px" }}
        >
          {desc}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            onClick={onConfirm}
            style={{
              background:   isDemo ? COLORS.blueBg  : COLORS.redBg,
              border:       `1px solid ${isDemo ? COLORS.blue + "60" : COLORS.red + "60"}`,
              color:        isDemo ? COLORS.blue : COLORS.red,
            }}
          >
            {confirmLabel}
          </Btn>
          <Btn onClick={onCancel}>Отмена</Btn>
        </div>
      </div>
    </div>
  );
};
