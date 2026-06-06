/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        outline: "#707979",
        "surface-tint": "#2a676c",
        "secondary-container": "#fcb73e",
        "surface-variant": "#e0e3e5",
        "on-primary-fixed-variant": "#074f54",
        "on-primary-fixed": "#002022",
        "on-primary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#004b50",
        "primary-fixed-dim": "#96d1d6",
        "surface-container-high": "#e6e8ea",
        "tertiary-container": "#004d3f",
        "on-error-container": "#93000a",
        "on-surface-variant": "#404849",
        "inverse-primary": "#96d1d6",
        "on-secondary-fixed": "#281800",
        "on-tertiary-container": "#24c6a7",
        error: "#ba1a1a",
        "tertiary-fixed": "#6bfad8",
        surface: "#f7f9fb",
        "surface-container-low": "#f2f4f6",
        "tertiary-fixed-dim": "#48ddbc",
        "outline-variant": "#bfc8c9",
        "on-error": "#ffffff",
        "on-secondary-container": "#6e4a00",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed-variant": "#005142",
        background: "#f7f9fb",
        primary: "#003336",
        secondary: "#805600",
        "on-surface": "#191c1e",
        "primary-fixed": "#b1edf2",
        "inverse-surface": "#2d3133",
        "surface-bright": "#f7f9fb",
        "inverse-on-surface": "#eff1f3",
        "surface-container-highest": "#e0e3e5",
        "surface-container": "#eceef0",
        "on-tertiary-fixed": "#002019",
        tertiary: "#00342a",
        "on-background": "#191c1e",
        "on-secondary": "#ffffff",
        "secondary-fixed": "#ffddaf",
        "surface-dim": "#d8dadc",
        "on-primary-container": "#7fbabf",
        "error-container": "#ffdad6",
        "on-secondary-fixed-variant": "#614000",
        "secondary-fixed-dim": "#ffba42"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        "stack-lg": "48px",
        "stack-sm": "12px",
        gutter: "24px",
        base: "8px",
        "container-max": "1440px",
        "stack-md": "24px"
      },
      fontFamily: {
        "headline-lg-mobile": ["Geist"],
        "label-md": ["Geist"],
        "body-lg": ["Inter"],
        "headline-md": ["Geist"],
        "headline-lg": ["Geist"],
        display: ["Geist"],
        "body-md": ["Inter"],
        caption: ["Inter"],
        headline: ["Geist"],
        body: ["Inter"],
        label: ["Geist"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "0.01em", fontWeight: "500" }],
        display: ["48px", { lineHeight: "1.1", letterSpacing: "0.02em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
