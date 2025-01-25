import '../scss/app.scss';
import './bootstrap';
import './utils/i18n';
import "../../node_modules/plyr/dist/plyr.css"
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppLayout from './Layouts/AppLayout';

const appName = import.meta.env.VITE_APP_NAME || 'CatalystExplorer';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        );
    //setting up the default layout for all pages except the 404 page
        page.then((module: any) => {
            if (name !== 'Error/404') {
                module.default.layout =
                    module.default.layout ||
                    ((module: any) => <AppLayout children={module} />);
            }
        });
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
}).then();
