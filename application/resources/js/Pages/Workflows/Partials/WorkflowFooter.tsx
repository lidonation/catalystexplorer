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
            <div className="flex w-full justify-between lg:px-10 lg:pb-6 pb-2 px-4 mt-4">
                {children}
            </div>
        </footer>
    );
}
