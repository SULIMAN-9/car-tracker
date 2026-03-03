/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        bg:      '#1C1C1E',
        bg2:     '#2C2C2E',
        bg3:     '#3A3A3C',
        sidebar: '#161618',
        surface: '#2C2C2E',
        border:  '#38383A',
        blue:    '#0A84FF',
        'blue-d':'#0071E3',
        green:   '#30D158',
        orange:  '#FF9F0A',
        red:     '#FF453A',
        purple:  '#BF5AF2',
        teal:    '#40CBE0',
        yellow:  '#FFD60A',
        indigo:  '#5E5CE6',
        l1:      '#FFFFFF',
        l2:      '#C8C8D0',
        l3:      '#8E8E9A',
        l4:      '#545460',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right':'slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn:    { from:{opacity:0}, to:{opacity:1} },
        slideUp:   { from:{opacity:0,transform:'translateY(20px)'}, to:{opacity:1,transform:'translateY(0)'} },
        slideRight:{ from:{opacity:0,transform:'translateX(-20px)'}, to:{opacity:1,transform:'translateX(0)'} },
        scaleIn:   { from:{opacity:0,transform:'scale(0.95)'}, to:{opacity:1,transform:'scale(1)'} },
        shimmer:   { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
      },
    },
  },
  plugins: [],
}
