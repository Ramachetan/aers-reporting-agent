/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        background: '#F8FAFC', // Very light gray-blue, professional and clean
        surface: '#ffffff',
        primary: {
          DEFAULT: '#1E40AF', // Deep medical blue - professional and trustworthy
          dark: '#1E3A8A',    // Darker blue for hover states
          light: '#DBEAFE',   // Light blue for backgrounds
        },
        secondary: {
          DEFAULT: '#059669', // Medical green - associated with health and wellness
          light: '#ECFDF5',   // Very light green for subtle backgrounds
          dark: '#047857',    // Darker green for emphasis
        },
        accent: {
          DEFAULT: '#DC2626', // Medical red for warnings/alerts
          light: '#FEF2F2',   // Light red for error backgrounds
        },
        text: {
          DEFAULT: '#0F172A', // Deeper slate for better readability
          muted: '#475569',   // Slightly darker muted text for better contrast
          light: '#64748B',   // Lighter text for less important info
        },
        border: {
          DEFAULT: '#E2E8F0', // Light gray border
          medium: '#CBD5E1',  // Medium gray border
          strong: '#94A3B8',  // Stronger border for emphasis
        },
        success: {
          DEFAULT: '#059669', // Green for success states
          light: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#D97706', // Amber for warnings
          light: '#FFFBEB',
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-in-out both',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}