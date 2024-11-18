import '../scss/app.scss';
import './bootstrap';
import './utils/i18n';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from './Layouts/AppLayout';
import { LaravelReactI18nProvider } from 'laravel-react-i18n';

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
        const root = createRoot(el);

        root.render(
            <LaravelReactI18nProvider
                locale={'en'}
                fallbackLocale={'en'}
                files={import.meta.glob('/lang/*.json')}
            >
                <StrictMode>
                    <App {...props} />
                </StrictMode>
                ,
            </LaravelReactI18nProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
}).then();
