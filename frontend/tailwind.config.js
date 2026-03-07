/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#10B981", // Emerald 500
                danger: "#E11D48", // Rose 600
                warning: "#F59E0B", // Amber 500
            }
        },
    },
    plugins: [],
}
