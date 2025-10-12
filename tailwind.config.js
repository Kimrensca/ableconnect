const config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        contrast: {
          bg: '#000',
          text: '#fff',
        },
      },
    },
  },
  plugins: [],
};

export default config;
