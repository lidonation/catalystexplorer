import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { initFromPageProps, ModalStackProvider } from '@inertiaui/modal-react';
import { LaravelReactI18nProvider } from 'laravel-react-i18n';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { RouteContext } from './useHooks/useRoute.js';
import AppLayout from './Layouts/AppLayout.js';

const appName = import.meta.env.VITE_APP_NAME || 'CatalystExplorer';

createServer(async (page) => {
    return createInertiaApp({
        page,
        // @ts-ignore
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => {
            const page = resolvePageComponent(
                `./Pages/${name}.tsx`,
                // @ts-ignore
                import.meta.glob('./Pages/**/*.tsx', { eager: true }),
            );

            page.then((module: any) => {
                module.default.layout =
                    module.default.layout ||
                    ((module: any) => <AppLayout children={module} />);
            });
            return page;
        },
        setup({ App, props }) {
            initFromPageProps(props);

            const ssrRoute = (
                name: any,
                params: any,
                absolute: any,
                config: any,
            ) => {
                return route(name, params, absolute, {
                    ...(page.props as any).ziggy,
                    ...config,
                    location: new URL((page.props as any).ziggy?.location),
                });
            };

            const locale = (page.props as any)?.locale || 'en';

            return (
                <RouteContext.Provider value={ssrRoute as any}>
                    <LaravelReactI18nProvider
                        locale={locale}
                        fallbackLocale="en"
                        files={import.meta.glob('../lang/*.json', { eager: true })}
                    >
                        <ModalStackProvider>
                            <StrictMode>
                                <App {...props} />
                            </StrictMode>
                        </ModalStackProvider>
                    </LaravelReactI18nProvider>
                </RouteContext.Provider>
            );
        },
        progress: {
            color: '#2596be',
        },
    }).then();
});
