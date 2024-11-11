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
                    tertiary: 'var(--bg-tertiary-color)',
                    accent: 'var(--bg-accent-color)',
                    'error-primary': 'var(--bg-error-primary-color)', 
                    'error-secondary': 'var(--bg-error-secondary-color)',
                },
                content: {
                    primary: 'var(--content-primary-color)',
                    secondary: 'var(--content-secondary-color)',
                    tertiary: 'var(--content-tertiary-color)',
                    accent: 'var(--content-accent-color)',
                    success: 'var(--content-success-color)',
                    'error-primary': 'var(--content-error-primary-color)',
                    'error-secondary' : 'var(--content-error-secondary-color)'
                },
                primary: {
                    100: '#2596BE',
                },
                border: {
                    primary: 'var(--border-primary-color)',
                    secondary: 'var(--border-secondary-color)'
                }
            },
        },
    },

    plugins: [forms],
};
