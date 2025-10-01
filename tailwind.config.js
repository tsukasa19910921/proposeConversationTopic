/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // メインカラー
        'app-teal': '#28C7FA',
        'app-violet': '#9B5DE5',
        // アクセントカラー
        'app-yellow': '#FEE440',
        'app-pink': '#F15BB5',
        'app-light-blue': '#00BBF9',
      },
      fontFamily: {
        'sans': ['var(--font-noto-sans-jp)', 'var(--font-poppins)', 'system-ui'],
        'poppins': ['var(--font-poppins)', 'system-ui'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #28C7FA 0%, #9B5DE5 100%)',
        'gradient-pop': 'linear-gradient(135deg, #F15BB5 0%, #FEE440 100%)',
        'gradient-cool': 'linear-gradient(135deg, #00BBF9 0%, #28C7FA 100%)',
        'gradient-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      boxShadow: {
        'neon-teal': '0 0 20px rgba(40, 199, 250, 0.5)',
        'neon-violet': '0 0 20px rgba(155, 93, 229, 0.5)',
        'neon-pink': '0 0 20px rgba(241, 91, 181, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(40, 199, 250, 0.5), 0 0 40px rgba(40, 199, 250, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(40, 199, 250, 0.8), 0 0 60px rgba(40, 199, 250, 0.5)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropFilter: {
        'glass': 'blur(20px) saturate(180%)',
      },
    },
  },
  plugins: [],
};