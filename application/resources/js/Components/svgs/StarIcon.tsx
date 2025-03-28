import { useTranslation } from 'react-i18next';

type StarIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

function StarIcon({ className, width = 24, height = 24 }: StarIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M6.70476 1.12081C6.87487 0.708316 7.45911 0.708316 7.62923 1.12081L9.05147 4.56943C9.1218 4.73996 9.28031 4.85791 9.46386 4.8763L13.065 5.23711C13.4933 5.28003 13.6708 5.80816 13.3554 6.10105L10.6087 8.65106C10.4798 8.77067 10.4233 8.94914 10.4597 9.12111L11.2504 12.8535C11.3416 13.2843 10.8717 13.6142 10.4975 13.3819L7.4307 11.4781C7.26919 11.3779 7.0648 11.3779 6.90329 11.4781L3.83648 13.3819C3.46232 13.6142 2.99236 13.2843 3.08363 12.8535L3.87426 9.12111C3.91069 8.94914 3.85414 8.77067 3.72531 8.65106L0.978633 6.10105C0.663152 5.80816 0.840641 5.28003 1.26898 5.23711L4.87012 4.8763C5.05367 4.85791 5.21218 4.73996 5.28251 4.56943L6.70476 1.12081Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default StarIcon;
