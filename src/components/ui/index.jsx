import { COLORS, UI_FONT } from "../../constants";

// ─── Btn ──────────────────────────────────────────────────────────────────────

export const Btn = ({ onClick, children, danger, accent, green, style = {}, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    style={{
      background:   green ? COLORS.green : "none",
      border:       `1px solid ${danger ? COLORS.red + "50" : green ? "transparent" : COLORS.borderSubtle}`,
      borderRadius: 4,
      padding:      "4px 10px",
      color:        danger ? COLORS.red : accent ? COLORS.blue : green ? "#fff" : COLORS.textSecondary,
      cursor:       "pointer",
      fontSize:     11,
      fontFamily:   UI_FONT,
      lineHeight:   1.5,
      ...style,
    }}
  >
    {children}
  </button>
);

// ─── Inp ──────────────────────────────────────────────────────────────────────

export const Inp = ({ value, onChange, placeholder, style = {}, maxLength, ariaLabel, id }) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    maxLength={maxLength}
    aria-label={ariaLabel || placeholder}
    style={{
      background:   COLORS.bgBase,
      border:       `1px solid ${COLORS.borderSubtle}`,
      borderRadius: 4,
      color:        COLORS.textPrimary,
      fontFamily:   UI_FONT,
      fontSize:     11,
      padding:      "4px 7px",
      outline:      "none",
      ...style,
    }}
  />
);

// ─── Lbl ──────────────────────────────────────────────────────────────────────

export const Lbl = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, display: "block" }}
  >
    {children}
  </label>
);

// ─── Tag (port type badge) ────────────────────────────────────────────────────

const TAG_STYLES = {
  tagged:   { bg: COLORS.blueBg,  color: COLORS.blue  },
  untagged: { bg: COLORS.greenBg, color: COLORS.green },
  hybrid:   { bg: COLORS.amberBg, color: COLORS.amber },
};

export const Tag = ({ type }) => {
  const s = TAG_STYLES[type] || { bg: COLORS.bgHover, color: COLORS.textMuted };
  return (
    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color }}>
      {type}
    </span>
  );
};

// ─── DeviceTypeBadge ──────────────────────────────────────────────────────────

const DEVICE_TYPE_STYLES = {
  router: { bg: COLORS.blueBg,  color: COLORS.blue  },
  switch: { bg: COLORS.greenBg, color: COLORS.green },
  other:  { bg: COLORS.bgHover, color: COLORS.textMuted },
};

export const DeviceTypeBadge = ({ type, label }) => {
  const s = DEVICE_TYPE_STYLES[type] || DEVICE_TYPE_STYLES.other;
  return (
    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color }}>
      {label}
    </span>
  );
};

// ─── Section heading ──────────────────────────────────────────────────────────

export const Section = ({ children }) => (
  <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
    {children}
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────

export const Select = ({ value, onChange, children, style = {}, ariaLabel }) => (
  <select
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    style={{
      width:        "100%",
      background:   COLORS.bgSurface,
      border:       `1px solid ${COLORS.borderSubtle}`,
      borderRadius: 4,
      color:        COLORS.textPrimary,
      fontFamily:   UI_FONT,
      fontSize:     11,
      padding:      "3px 5px",
      ...style,
    }}
  >
    {children}
  </select>
);

// ─── InlineError ──────────────────────────────────────────────────────────────

export const InlineError = ({ message }) =>
  message ? (
    <div role="alert" style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>
      ⚠ {message}
    </div>
  ) : null;

// ─── CopyButton — with visual feedback ───────────────────────────────────────

import { useState } from "react";

export const CopyButton = ({ text, style = {} }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable or denied — silently ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Скопировано" : "Скопировать в буфер обмена"}
      style={{
        background:   copied ? COLORS.greenBg : "none",
        border:       `1px solid ${copied ? COLORS.green + "60" : COLORS.borderSubtle}`,
        borderRadius: 4,
        padding:      "4px 10px",
        color:        copied ? COLORS.green : COLORS.blue,
        cursor:       "pointer",
        fontSize:     11,
        fontFamily:   UI_FONT,
        lineHeight:   1.5,
        transition:   "all 0.2s",
        ...style,
      }}
    >
      {copied ? "✓ Скопировано" : "Копировать"}
    </button>
  );
};
