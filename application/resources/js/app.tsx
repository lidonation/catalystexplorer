import '../scss/app.scss';
import './bootstrap';
import './utils/i18n';
import "../../node_modules/plyr/dist/plyr.css"
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-ignore
import { ModalStackProvider, initFromPageProps } from '@inertiaui/modal-react'
import AppLayout from './Layouts/AppLayout';

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

        initFromPageProps(props);

        root.render(
            <ModalStackProvider>
                <StrictMode>
                    <App {...props} />
                </StrictMode>
            </ModalStackProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
}).then();
