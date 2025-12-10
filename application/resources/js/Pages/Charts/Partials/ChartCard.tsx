import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

interface ChartCardProps {
    children: React.ReactNode;
    title?: string;
}
export default function ChartCard({ children, title }: ChartCardProps) {
    const { t } = useLaravelReactI18n();

    return (
        <Card className="w-full bg-background">
            <div className="mb-4 flex items-center justify-between">
                <Title level="4" className="font-semibold">
                    {title}
                </Title>
                {/* <div className="text-primary flex items-center gap-2">
                    <Paragraph>{t('charts.share')}</Paragraph>
                    <Share2Icon />
                </div> */}
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[600px] sm:min-w-full">{children}</div>
            </div>
        </Card>
    );
}
