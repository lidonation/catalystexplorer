import '../scss/app.scss';
import './utils/i18n';
import AppLayout from './Layouts/AppLayout';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server'
import { Ziggy } from './ziggy.js';

// @ts-ignore
globalThis.Ziggy = Ziggy;

const appName = import.meta.env.VITE_APP_NAME || 'CatalystExplorer';

createServer(page =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: name => {
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
        setup: ({ el, App, props }) => <App {...props} />,
    }),
);
