import forms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                '4xl': '2.5rem',
            },
            colors: {
                background: {
                    primary: 'var(--bg-primary-color)',
                    secondary: 'var(--bg-secondary-color)',
                },
                primary: 'var(--primary-color)',
                content: {
                    primary: 'var(--content-primary-color)',
                    secondary: 'var(--content-secondary-color)',
                },
            },
        },
    },

    plugins: [forms],
};
