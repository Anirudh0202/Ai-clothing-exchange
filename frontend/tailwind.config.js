export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        brand: {
          50: '#eef2ff',
          500: '#4f46e5',
          600: '#4338ca',
        },
      },
    },
  },
  plugins: [],
}
