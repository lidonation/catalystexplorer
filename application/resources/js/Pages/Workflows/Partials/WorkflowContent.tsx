import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function Content({ children }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <div className="mt-12 mb-12 h-full min-h-[600px] md:min-h-fit lg:mt-4">
            {children}
        </div>
    );
}
