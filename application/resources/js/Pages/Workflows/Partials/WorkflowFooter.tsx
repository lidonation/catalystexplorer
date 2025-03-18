import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = { children: ReactNode };

export default function Footer({ children }: Props) {
    const { t } = useTranslation();
    const isLogin = window.location.pathname.endsWith('login');

    if (isLogin) {
        return;
    }

    return (
        <footer className="bg-background w-full">
            <div className="flex w-full justify-between px-10 pb-6">
                {children}
            </div>
        </footer>
    );
}
