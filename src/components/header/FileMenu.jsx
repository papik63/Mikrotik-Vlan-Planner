import { useRef, useState, useCallback } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { UI_FONT, COLORS } from "../../constants";

const MENU_ITEMS = [
  { icon: "💾", label: "Сохранить план",  sub: "Скачать как .json",    key: "export"                           },
  { icon: "📂", label: "Загрузить план",  sub: "Открыть .json файл",   key: "import"                           },
  { icon: "🖨️", label: "Экспорт в PDF",  sub: "Через диалог печати",  key: "pdf"                              },
  { icon: "🎓", label: "Demo",            sub: "Пример из mikrotik.wiki", key: "demo",  divider: true          },
  { icon: "🗑️", label: "Очистить всё",   sub: "Удалить все данные",    key: "clear", danger: true              },
];

export const FileMenu = ({
  onExportJSON,
  onImportJSON,
  onExportPDF,
  onDemo,
  onClear,
  importError,
  onClearImportError,
}) => {
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(null);
  const menuRef = useRef(null);
  const fileRef = useRef(null);

  useClickOutside(menuRef, useCallback(() => setOpen(false), []));

  const handleToggle = () => {
    setOpen((o) => !o);
    onClearImportError?.();
  };

  const handleAction = (key) => {
    setOpen(false);
    if (key === "export") onExportJSON();
    if (key === "import") fileRef.current?.click();
    if (key === "pdf")    onExportPDF();
    if (key === "demo")   onDemo();
    if (key === "clear")  onClear();
  };

  const handleKeyDown = (e, key) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAction(key);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImportJSON(file);
    e.target.value = "";
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          background:   open ? COLORS.bgHover : "none",
          border:       `1px solid ${COLORS.borderSubtle}`,
          borderRadius: 6,
          padding:      "5px 12px",
          color:        COLORS.textPrimary,
          cursor:       "pointer",
          fontSize:     12,
          fontFamily:   UI_FONT,
          display:      "flex",
          alignItems:   "center",
          gap:          6,
        }}
      >
        <span aria-hidden="true">☰</span>
        Файл
        <span aria-hidden="true" style={{ fontSize: 9, color: COLORS.textMuted }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Меню файла"
          style={{
            position:     "absolute",
            right:        0,
            top:          "calc(100% + 6px)",
            zIndex:       50,
            background:   COLORS.bgSurface,
            border:       `1px solid ${COLORS.borderSubtle}`,
            borderRadius: 8,
            boxShadow:    "0 8px 24px #00000088",
            minWidth:     220,
            overflow:     "hidden",
          }}
        >
          {importError && (
            <div
              role="alert"
              style={{
                padding:      "8px 14px",
                fontSize:     11,
                color:        COLORS.red,
                borderBottom: `1px solid ${COLORS.border}`,
                background:   COLORS.redBg,
              }}
            >
              ⚠ {importError}
            </div>
          )}

          {MENU_ITEMS.map((item) => (
            <div key={item.key} role="none">
              {item.divider && (
                <div aria-hidden="true" style={{ height: 1, background: COLORS.border, margin: "4px 0" }} />
              )}
              <button
                role="menuitem"
                onClick={() => handleAction(item.key)}
                onKeyDown={(e) => handleKeyDown(e, item.key)}
                onMouseEnter={() => setHovered(item.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width:      "100%",
                  background: hovered === item.key ? COLORS.bgHover : "none",
                  border:     "none",
                  padding:    "10px 14px",
                  cursor:     "pointer",
                  fontFamily: UI_FONT,
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                  textAlign:  "left",
                  transition: "background 0.1s",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 15, width: 22 }}>{item.icon}</span>
                <div>
                  <div style={{
                    fontSize:   12,
                    color:      item.danger ? COLORS.red : item.key === "demo" ? COLORS.blue : COLORS.textPrimary,
                    fontWeight: 500,
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>{item.sub}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        aria-label="Загрузить план из JSON"
        style={{ display: "none" }}
      />
    </div>
  );
};
