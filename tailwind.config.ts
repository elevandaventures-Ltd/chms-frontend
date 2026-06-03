import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v3 configuration — Day 2
 *
 * Design tokens are mapped from the CSS custom properties in globals.css
 * so both systems use the same values.  The CSS variables remain the source
 * of truth; Tailwind classes reference them via `var(--*)`.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/context/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Fonts ──────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-body)',    'Inter',           'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Playfair Display','Georgia',   'serif'],
        body:    ['var(--font-body)',    'Inter',           'system-ui', 'sans-serif'],
      },

      // ── Typography scale ───────────────────────────────────────────
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.625rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':['3rem',     { lineHeight: '1' }],
        '6xl':['3.75rem',  { lineHeight: '1' }],
      },

      // ── Colours — mapped from CSS variables ────────────────────────
      colors: {
        background:    'var(--bg)',
        'background-accent': 'var(--bg-accent)',
        panel:         'var(--panel)',
        'panel-strong':'var(--panel-strong)',
        border:        'var(--panel-border)',
        'border-strong':'var(--panel-border-strong)',
        foreground:    'var(--text)',
        muted:         'var(--muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft:    'var(--accent-soft)',
          strong:  'var(--accent-strong)',
        },
        // shadcn/ui semantic aliases
        primary: {
          DEFAULT:    'var(--accent)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT:    'rgba(255,255,255,0.9)',
          foreground: 'var(--text)',
        },
        destructive: {
          DEFAULT:    '#b91c1c',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT:    'var(--panel)',
          foreground: 'var(--text)',
        },
        popover: {
          DEFAULT:    'var(--panel-strong)',
          foreground: 'var(--text)',
        },
        input:  'var(--panel-border)',
        ring:   'var(--accent)',
      },

      // ── Border radius ──────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm:   '8px',
        DEFAULT: '14px',
        md:   '16px',
        lg:   '18px',
        xl:   '22px',
        '2xl':'28px',
        '3xl':'32px',
        full: '9999px',
      },

      // ── Box shadow ─────────────────────────────────────────────────
      boxShadow: {
        panel:  '0 24px 80px rgba(44, 30, 20, 0.12)',
        strong: '0 18px 40px rgba(31, 23, 17, 0.14)',
        sm:     '0 2px 8px rgba(35, 29, 24, 0.08)',
        accent: '0 12px 28px rgba(178, 81, 49, 0.18)',
      },

      // ── Spacing extras ─────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      // ── Backdrop blur ──────────────────────────────────────────────
      backdropBlur: {
        panel: '14px',
      },

      // ── Animation ──────────────────────────────────────────────────
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      animation: {
        spin:            'spin 0.9s linear infinite',
        'fade-in':       'fade-in 180ms ease',
        'slide-in-right':'slide-in-right 240ms ease',
      },
    },
  },
  plugins: [],
};

export default config;
