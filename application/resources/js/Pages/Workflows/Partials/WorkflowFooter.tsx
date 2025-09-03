import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function Footer({ children }: Props) {
    const { t } = useLaravelReactI18n();
    const isLogin = window.location.pathname.endsWith('login');

    if (isLogin) {
        return;
    }

    return (
        <footer className="bg-background sticky bottom-0 z-50 w-full p-4">
            <div className="flex w-full justify-between px-4 lg:px-10">
                {children}
            </div>
        </footer>
    );
}
