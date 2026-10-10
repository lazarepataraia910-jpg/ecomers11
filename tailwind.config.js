/** Design tokens live here so every screen reuses them. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#335CFF', hover: '#2547D0', soft: '#EBF0FF' },
        n: { 50: '#F5F7FA', 100: '#F3F5F8', 200: '#E0E4EA', 300: '#CACFD8', 400: '#99A0AE', 500: '#717784', 600: '#525866', 700: '#2B303B', 800: '#232530', 950: '#0E121B' },
        danger: '#FB3748',
        success: '#21C16B',
      },
      boxShadow: { card: '0 8px 24px rgba(240,240,240,.6)', focus: '0 0 0 2px #fff, 0 0 0 4px #CACFD8' },
      borderRadius: { lg: '8px', xl: '12px' },
    },
  },
}
