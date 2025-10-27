
// This is the configuration file for Tailwind CSS.
// It's a standard JavaScript module export.
export default {
  // This enables dark mode based on a class applied to an ancestor element (e.g., <html class="dark">).
  darkMode: ['class'],
  // This tells Tailwind where to look for class names to include in the final CSS file.
  // It scans HTML and all JS/JSX/TS/TSX files in the client/src directory.
  content: ['./client/index.html', './client/src/**/*.{js,jsx,ts,tsx}'],
  // The 'theme' section is where you define your project's color palette, spacing, typography, etc.
  theme: {
    // The 'extend' section allows you to add new values to Tailwind's default theme or override existing ones.
    extend: {
      // Customizing border radius values.
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Defining a custom color palette using CSS variables for theming.
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Custom chart colors.
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
    },
  },
  // The 'plugins' section is where you can add official or third-party Tailwind plugins.
  plugins: [require('tailwindcss-animate')], // This plugin adds utilities for CSS animations.
};
