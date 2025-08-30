export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#0ea5e9',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981',
        text: '#f1f5f9',
      },
    },
  },
  safelist: [
    'bg-primary', 'bg-secondary', 'text-text', 'bg-accent', 'bg-warning', 'bg-error', 'bg-success',
    // Add more if needed
  ],
  plugins: [],
};
