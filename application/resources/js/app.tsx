import '../scss/app.scss';
import './bootstrap';
import './utils/i18n';
import { createInertiaApp } from '@inertiajs/react';
import { hydrateRoot } from 'react-dom/client'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from './Layouts/AppLayout';
import { Ziggy } from './ziggy.js';

// @ts-ignore
globalThis.Ziggy = Ziggy;

const appName = import.meta.env.VITE_APP_NAME || 'CatalystExplorer';
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        );
        page.then((module: any) => {
            module.default.layout =
                module.default.layout ||
                ((module: any) => <AppLayout children={module} />);
        });
        return page;
    },
    setup({ el, App, props }) {
        // const root = createRoot(el);

        hydrateRoot(
            el,
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
}).then();
