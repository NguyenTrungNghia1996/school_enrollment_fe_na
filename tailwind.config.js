module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0057A0",
        success: "#7AC943",
        warning: "#F59E0B",
        error: "#DC2626",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        ant: "8px",
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')]
}