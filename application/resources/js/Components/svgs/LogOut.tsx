import { useTranslation } from 'react-i18next';

type LogOutIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function LogOutIcon({
    className,
    width = 24,
    height = 24,
}: LogOutIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title> {t('icons.title.logOut')}</title>
            <path
                d="M13.3333 14.6667L17.5 10.5M17.5 10.5L13.3333 6.33333M17.5 10.5H7.5M7.5 3H6.5C5.09987 3 4.3998 3 3.86502 3.27248C3.39462 3.51217 3.01217 3.89462 2.77248 4.36502C2.5 4.8998 2.5 5.59987 2.5 7V14C2.5 15.4001 2.5 16.1002 2.77248 16.635C3.01217 17.1054 3.39462 17.4878 3.86502 17.7275C4.3998 18 5.09987 18 6.5 18H7.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}