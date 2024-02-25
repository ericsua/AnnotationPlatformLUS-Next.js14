/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        rotate: "rotate 2s linear infinite",
        dash: "dash 1.5s ease-in-out infinite",
        typing: "typing 2s steps(20) infinite alternate, blink .7s infinite"
      },
      keyframes: {
        rotate: {
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        dash: {
          '0%': {
            strokeDasharray: '1, 150',
            strokeDashoffset: '0',
          },
          '50%': {
            strokeDasharray: '90, 150',
            strokeDashoffset: '-35'
          },
          '100%': {
            strokeDasharray: '90, 150',
            strokeDashoffset: '-124'
          }
        },
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%"
          }  
        },
        blink: {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "black"
          }  
        }
      }
    },
  },
  plugins: [],
}

