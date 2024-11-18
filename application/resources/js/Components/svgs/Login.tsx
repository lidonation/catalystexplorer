import { useTranslation } from 'react-i18next';

type LoginIconProps = {
    className?: string;
    width?: number;
    height?: number;
    onClick? :React.MouseEventHandler<SVGSVGElement>;
};

export default function LoginIcon({
    className,
    width = 24,
    height = 24,
    onClick
}: LoginIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            onClick={onClick}
        >
            <title> {t('icons.title.logIn')}</title>
            <path
                d="M6.66667 14.6667L2.5 10.5M2.5 10.5L6.66667 6.33333M2.5 10.5H12.5M12.5 3H13.5C14.9001 3 15.6002 3 16.135 3.27248C16.6054 3.51217 16.9878 3.89462 17.2275 4.36502C17.5 4.8998 17.5 5.59987 17.5 7V14C17.5 15.4001 17.5 16.1002 17.2275 16.635C16.9878 17.1054 16.6054 17.4878 16.135 17.7275C15.6002 18 14.9001 18 13.5 18H12.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
