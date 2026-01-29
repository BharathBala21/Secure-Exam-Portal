/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1",
                "primary-dark": "#4f46e5",
                secondary: "#ec4899",
                "dark-bg": "#0f172a",
                "dark-surface": "#1e293b",
                "dark-border": "#334155",
            }
        },
    },
    plugins: [],
}
