import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: "#0B1222",
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        stock: '#3B82F6',
        gold: '#FFC107',
        oil: '#6B7280',
        crypto: '#8B5CF6',
        profit: "#10B981",
        loss: "#EF4444",
        neutral: "#8E9196",
        dark: "#1A1F2C",
        panel: "#111827",
        "panel-light": "#1E293B",
        accent: "#FF5722",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        chart: {
          blue: "#60A5FA",
          orange: "#F97316",
          green: "#22C55E",
          red: "#EF4444",
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'price-up': {
          '0%': { color: 'white' },
          '50%': { color: 'hsl(142, 71%, 45%)' },
          '100%': { color: 'white' }
        },
        'price-down': {
          '0%': { color: 'white' },
          '50%': { color: 'hsl(0, 84%, 60%)' },
          '100%': { color: 'white' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'price-up': 'price-up 1s ease-out',
        'price-down': 'price-down 1s ease-out',
        'fade-in': 'fade-in 0.5s ease-out'
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0) 100%)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
