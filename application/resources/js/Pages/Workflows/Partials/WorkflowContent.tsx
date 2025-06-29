import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = { children: ReactNode };

export default function Content({ children }: Props) {
    const { t } = useTranslation();

    return (
        <div className="mt-12 mb-12 min-h-[600px] md:min-h-[800px] lg:mt-4 ">
            {children}
        </div>
    );
}
