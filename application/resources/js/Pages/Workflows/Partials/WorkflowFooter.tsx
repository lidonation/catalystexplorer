import Title from "@/Components/atoms/Title";
import TickIcon from "@/Components/svgs/TickIcon";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type Props = { children: ReactNode }

export default function Footer({ children }: Props) {

     const { t } = useTranslation();
     const isLogin = window.location.pathname.endsWith('login');

     if (isLogin) {
        return;
     }

    return (
        <footer className="bg-background-lighter w-full">
            <div className="flex w-full justify-between px-8 pb-8">
                {/* <PrimaryButton className="px-8 py-3 text-sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryButton>
                <PrimaryButton className="px-8 py-3 text-sm">
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton> */}
            </div>
        </footer>
    );
}