import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = { children: ReactNode };

export default function Content({ children }: Props) {
    const { t } = useTranslation();

    return (
        <div className="relative min-h-[400px] overflow-y-auto lg:h-[600px]">
            {children}
        </div>
    );
}
