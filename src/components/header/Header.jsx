import { FileMenu } from "./FileMenu";
import { TABS, COLORS } from "../../constants";

export const Header = ({
  tab,
  onTabChange,
  onExportJSON,
  onImportJSON,
  onExportPDF,
  onDemoRequest,
  onClearRequest,
  importError,
  onClearImportError,
}) => (
  <div
    className="no-print"
    style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px 0", background: COLORS.bgSurface }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
      <span style={{ fontSize: 11, color: COLORS.blue, letterSpacing: 3, textTransform: "uppercase" }}>
        MikroTik
      </span>
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>VLAN Planner</h1>
      <span style={{ fontSize: 10, color: COLORS.textMuted, marginLeft: "auto" }}>
        RouterOS v7 · данные сохраняются в браузере
      </span>
      <FileMenu
        onExportJSON={onExportJSON}
        onImportJSON={onImportJSON}
        onExportPDF={onExportPDF}
        onDemo={onDemoRequest}
        onClear={onClearRequest}
        importError={importError}
        onClearImportError={onClearImportError}
      />
    </div>

    <nav aria-label="Разделы">
      <div style={{ display: "flex" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            style={{
              background:   "none",
              border:       "none",
              cursor:       "pointer",
              padding:      "6px 16px",
              fontSize:     12,
              color:        tab === t.id ? COLORS.blue : COLORS.textSecondary,
              borderBottom: tab === t.id ? `2px solid ${COLORS.blue}` : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  </div>
);
