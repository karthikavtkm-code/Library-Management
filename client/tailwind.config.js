/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9fa',
                    100: '#dcf1f2',
                    200: '#bee3e6',
                    300: '#93ced2',
                    400: '#62adb4',
                    500: '#469199',
                    600: '#3c767f',
                    700: '#356168',
                    800: '#325056',
                    900: '#2d454a',
                    950: '#1a2e32',
                },
            },
        },
    },
    plugins: [],
}
