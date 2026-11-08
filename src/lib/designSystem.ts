/**
 * BOOKMARKD Design System Tokens & Color Configuration
 * Color Palette:
 * - Primary Brown: #6E3511
 * - Sage Green:    #91AC67
 * - Forest Green:  #597928
 * - Warm Cream:    #FCECD8
 */

export const THEME_COLORS = {
  primary: {
    DEFAULT: "#6E3511",
    hover: "#5A2B0E",
    light: "#8A461C",
    subtle: "#F6EDE4",
  },
  sage: {
    DEFAULT: "#91AC67",
    hover: "#7D9955",
    light: "#EFF4E7",
    dark: "#748F4C",
  },
  forest: {
    DEFAULT: "#597928",
    hover: "#49661F",
    dark: "#3B5219",
    light: "#E9F0DE",
  },
  cream: {
    DEFAULT: "#FCECD8",
    soft: "#FAF5ED",
    deep: "#F5E2C8",
    paper: "#FFFDF9",
  },
  neutral: {
    background: "#FAF5ED",
    surface: "#FFFFFF",
    border: "#E8DDCE",
    borderDark: "#D8C9B9",
    textPrimary: "#2C221A",
    textSecondary: "#786C60",
    textMuted: "#9C8F83",
  },
} as const;

export const TYPOGRAPHY = {
  fontSerif: "var(--font-serif), Georgia, Cambria, 'Times New Roman', serif",
  fontSans: "var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;
