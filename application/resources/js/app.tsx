// import '../../node_modules/plyr/dist/plyr.css';
import { createInertiaApp } from '@inertiajs/react';
import { ModalStackProvider, initFromPageProps } from '@inertiaui/modal-react';
import { LaravelReactI18nProvider } from 'laravel-react-i18n';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import '../scss/app.scss';
import './bootstrap';
import { RouteContext } from './useHooks/useRoute';
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
    // @ts-ignore
    setup({ el, App, props }) {
        initFromPageProps(props);
        const { locale } = props.initialPage.props as any;

        return hydrateRoot(
            el,
            <RouteContext.Provider value={(window as any).route}>
                <LaravelReactI18nProvider
                    locale={locale}
                    fallbackLocale="en"
                    files={import.meta.glob('../../lang/*.json', { eager: true })}
                >
                    <ModalStackProvider>
                        <StrictMode>
                            <App {...props} />
                        </StrictMode>
                    </ModalStackProvider>
                </LaravelReactI18nProvider>
            </RouteContext.Provider>,
        );
    },
    progress: {
        color: '#2596be',
    },
}).then();
