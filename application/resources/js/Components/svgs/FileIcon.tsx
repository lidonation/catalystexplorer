import { useTranslation } from 'react-i18next';

type FileIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function FileIcon({
    className,
    width = 32,
    height = 32,
}: FileIconProps) {
    const { t } = useTranslation();
    return (
        // <svg  fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={`${className}`}>
        //     <title> {t('icons.title.file')}</title>
        //     <path fill="var(--cx-primary, currentColor)" d="M334.627,16H48V496H472V153.373ZM440,166.627V168H320V48h1.373ZM80,464V48H288V200H440V464Z" stroke="#3FACD1" stroke-width="32" className="cx-primary" />
        // </svg>



        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title> {t('icons.title.file')}</title>
            <path d="m0 0h24v24h-24z" fill="none" opacity="0" />
            <path d="m19.74 8.33-5.44-6a1 1 0 0 0 -.74-.33h-7a2.53 2.53 0 0 0 -2.56 2.5v15a2.53 2.53 0 0 0 2.56 2.5h10.88a2.53 2.53 0 0 0 2.56-2.5v-10.5a1 1 0 0 0 -.26-.67zm-2.09.67h-3.94a.79.79 0 0 1 -.71-.85v-4.15h.11zm-.21 11h-10.88a.53.53 0 0 1 -.56-.5v-15a.53.53 0 0 1 .56-.5h4.44v4.15a2.79 2.79 0 0 0 2.71 2.85h4.29v8.5a.53.53 0 0 1 -.56.5z" fill="#3FACD1" />
        </svg>



    );
}
