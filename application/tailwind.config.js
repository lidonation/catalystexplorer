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
                // background: {
                //     default: 'var(--cx-background)',
                //     'default-darker': 'var(--cx-background-darker)',
                //     secondary: 'var(--bg-secondary-color)',
                //     tertiary: 'var(--cx-background-highlight)',
                //     accent: 'var(--bg-accent-color)',
                //     'error-primary': 'var(--bg-error-primary-color)',
                //     'error-secondary': 'var(--bg-error-secondary-color)',
                // },
                // content: {
                //     primary: 'var(--cx-primary)',
                //     secondary: 'var(--cx-secondary)',
                //     tertiary: 'var(--cx-highlight)',
                //     accent: 'var(--cd-accent)',
                //     success: 'var(--content-success-color)',
                //     'error-primary': 'var(--content-error-primary-color)',
                //     'error-secondary' : 'var(--content-error-secondary-color)'
                // },
                content: 'var(--cx-content)',
                'content-dark': 'var(--cx-content-dark)',
                light: 'var(--cx-content)',
                dark: 'var(--cx-dark)',
                primary: 'var(--cx-primary)',
                secondary: 'var(--cx-secondary)',
                highlight: 'var(--cx-highlight)',
                accent: 'var(--cx-accent)',
                success: 'var(--content-success-color)',
                hover: 'var(--content-hover-color)',
                background: 'var(--cx-background)',
                'background-highlight': 'var(--cx-background-highlight)',
                'background-lighter': 'var(--cx-background-lighter)',
                'background-darker': 'var(--cx-background-darker)',
                border: {
                    primary: 'var(--cx-primary)',
                    secondary: 'var(--border-secondary-color)'
                }
            },
        },
    },

    plugins: [forms],
};
