/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './public/index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                heady: {
                    50: '#eef5ff',
                    100: '#d9e8ff',
                    200: '#bcd7ff',
                    300: '#8ebfff',
                    400: '#599dff',
                    500: '#3b82f6',
                    600: '#1d62eb',
                    700: '#154dd8',
                    800: '#1740af',
                    900: '#193989',
                    950: '#0a1628',
                },
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
                },
            },
        },
    },
    plugins: [],
}
