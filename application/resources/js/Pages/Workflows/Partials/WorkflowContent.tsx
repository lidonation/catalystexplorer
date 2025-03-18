import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = { children: ReactNode };

export default function Content({ children }: Props) {
    const { t } = useTranslation();

    return <div className="h-[600px] overflow-y-auto p-6">{children}</div>;
}
