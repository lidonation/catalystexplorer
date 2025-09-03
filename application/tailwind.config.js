import forms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    safelist: ['size-2', 'size-3', 'text-2xs'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/scss/*.scss',
        './node_modules/@inertiaui/modal-react/src/**/*.{js,jsx}',
    ],

    theme: {
        extend: {
            animation: {
                waveform: 'waveform 1s ease-in-out infinite',
            },
            keyframes: {
                waveform: {
                    '0%, 100%': { height: '20%' },
                    '50%': { height: '60%' },
                },
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                '4xl': '2.5rem',
            },
            boxShadow: {
                'cx-box-shadow': '0px 1px 4px 0px rgba(16,24,40,0.10)',
            },
            colors: {
                // background: {
                //     default: 'var(--cx-background)',
                //     'default-darker': 'var(--cx-background-darker)',
                //     secondary: 'var(--bg-secondary-color)',
                //     tertiary: 'var(--cx-background-light)',
                //     accent: 'var(--bg-accent-color)',
                //     'error-primary': 'var(--bg-error-primary-color)',
                //     'error-secondary': 'var(--bg-error-secondary-color)',
                // },
                // content: {
                //     primary: 'var(--cx-primary)',
                //     secondary: 'var(--cx-secondary)',
                //     tertiary: 'var(--cx-light)',
                //     accent: 'var(--cd-accent)',
                //     success: 'var(--content-success-color)',
                //     'error-primary': 'var(--content-error-primary-color)',
                //     'error-secondary' : 'var(--content-error-secondary-color)'
                // },
                content: 'var(--cx-content)',
                'pink': 'var(--cx-content-pink)',
                'yellow': 'var(--cx-content-yellow)',
                'content-highlight-intro': 'var(--cx-content-highlight)',
                'content-light': 'var(--cx-content-light)',
                'content-dark': 'var(--cx-content-dark)',
                light: 'var(--cx-content)',
                'light-blue': 'var(--cx-light-blue)',
                'light-persist': 'var(--bg-light-persist)',
                'light-gray-persist': 'var(--cx-content-light-gray-persist)',
                'gray-persist': 'var(--cx-content-gray-persist)',
                'black-persist': 'var(--cx-content-black-persist)',
                dark: 'var(--cx-dark)',
                primary: 'var(--cx-primary)',
                slate: '--cx-slate',
                'primary-dark': 'var(--cx-primary-dark)',
                secondary: 'var(--cx-secondary)',
                highlight: 'var(--cx-light)',
                accent: 'var(--cx-accent)',
                'accent-blue': 'var(--bg-accent-color)',
                'dark-persist': 'var(--content-primary-color)',
                'accent-secondary': 'var(--cx-accent-secondary)',
                error: 'var(--bg-error-primary-color)',
                'error-light': 'var(--content-error-light-border)',
                success: 'var(--success-gradient-color-2)',
                'success-light': 'var(--content-success-light)',
                warning: 'var(--bg-warning-primary-color)',
                hover: 'var(--content-hover-color)',
                'gray-light': 'var(--cx-slate-light)',
                background: 'var(--cx-background)',
                'background-light': 'var(--cx-background-light)',
                'background-lighter': 'var(--cx-background-lighter)',
                'background-darker': 'var(--cx-background-darker)',
                'bg-dark': 'var(--cx-background-gradient-1-dark)',
                'background-home-gradient-color-1':
                    'var(--cx-intro-gradient-1)',
                'background-home-gradient-color-2':
                    'var(--cx-intro-gradient-2)',
                'background-button-gradient-color-1':
                    'var(--cx-background-gradient-1-light)',
                'background-button-gradient-color-2':
                    'var(--cx-background-gradient-2-light)',
                'background-dashboard-menu':
                    'var(--cx-background-dashboard-menu)',
                'active-dashboard-menu':
                    'var(--cx-active-dashboard-menu)',
                // border: 'var(--cx-border-color)',
                'border-chip': 'var(--cx-border-chip-color)',
                'border-secondary': 'var(--cx-border-secondary-color)',
                'eye-logo': 'var(--cx-blue-eye-color)',
                'primary-light': 'var(--cx-primary-light)',
                'primary-mid': 'var(--cx-primary-mid)',
                'danger-light': 'var(--cx-danger-light)',
                'danger-strong': 'var(--cx-danger-strong)',
                'danger-mid': 'var(--cx-danger-mid)',
                'purple-light': 'var(--cx-purple-light)',
                'content-darker': 'var(--cx-content-darker)',

                border: {
                    primary: 'var(--cx-primary)',
                    secondary: 'var(--cx-border-secondary-color)',
                    dark: 'var(--cx-dark)',
                    'dark-on-dark': 'var(--cx-border-color-dark)',
                },

                tooltip: 'var(--cx-tooltip-background)',
            },
            fontSize: {
                'cx-display-xs': [
                    'var(--cx-display-xs)',
                    {
                        fontWeight: 'var(--cx-display-weight)',
                    },
                ],
                'cx-display-sm': [
                    'var(--cx-display-sm)',
                    {
                        fontWeight: 'var(--cx-display-weight)',
                    },
                ],
                'cx-display-md': [
                    'var(--cx-display-md)',
                    {
                        fontWeight: 'var(--cx-display-weight)',
                    },
                ],
                'cx-display-lg': [
                    'var(--cx-display-lg)',
                    {
                        fontWeight: 'var(--cx-display-weight)',
                    },
                ],
                'cx-display-xl': [
                    'var(--cx-display-xl)',
                    {
                        fontWeight: 'var(--cx-display-weight)',
                    },
                ],
                'cx-display-2xl': [
                    'var(--cx-display-2xl)',
                    {
                        fontWeight: 'var(--cx-display-weight)',
                    },
                ],
                md: [
                    '1rem',
                    {
                        lineHeight: '1.5rem',
                    },
                ],
            },
        },
    },

    plugins: [forms],
};
