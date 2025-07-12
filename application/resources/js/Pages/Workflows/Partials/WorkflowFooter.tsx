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
        <footer className="bg-background sticky bottom-0 w-full p-4 z-50">
            <div className=" flex w-full justify-between px-4  lg:px-10 ">
                {children}
            </div>
        </footer>
    );
}
