import { useTranslation } from 'react-i18next';

type CardSwitchIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function CardSwitchIcon({
    className,
    width = 28,
    height = 28,
}: CardSwitchIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width="18"
            height="20"
            viewBox="0 0 13 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            
            <path
                d="M7.875 1.17515V3.86C7.875 4.22403 7.875 4.40605 7.94993 4.54509C8.01585 4.6674 8.12102 4.76684 8.25038 4.82915C8.39745 4.9 8.58996 4.9 8.975 4.9H11.8147M12 6.19235V10.88C12 11.9721 12 12.5182 11.7752 12.9353C11.5775 13.3022 11.2619 13.6005 10.8739 13.7875C10.4327 14 9.85511 14 8.7 14H4.3C3.14489 14 2.56734 14 2.12614 13.7875C1.73806 13.6005 1.42254 13.3022 1.2248 12.9353C1 12.5182 1 11.9721 1 10.88V4.12C1 3.0279 1 2.48185 1.2248 2.06472C1.42254 1.6978 1.73806 1.39949 2.12614 1.21254C2.56734 1 3.14489 1 4.3 1H6.5081C7.01256 1 7.2648 1 7.50217 1.05388C7.71262 1.10165 7.9138 1.18044 8.09834 1.28735C8.30648 1.40794 8.48483 1.57657 8.84155 1.91383L11.0335 3.98617C11.3902 4.32343 11.5685 4.49206 11.6961 4.68884C11.8092 4.86332 11.8925 5.05353 11.943 5.2525C12 5.47692 12 5.71539 12 6.19235Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
