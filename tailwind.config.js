module.exports = {
    content: [
        './src/components/**/*.{js,jsx,ts,tsx}',
        './src/pages/**/*.{js,jsx,ts,tsx}',
        './src/templates/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {}
    },
    plugins: [require('@tailwindcss/typography')]
};
