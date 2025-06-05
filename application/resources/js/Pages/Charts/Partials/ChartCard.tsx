import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { Share2Icon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ChartCardProps {
    children: React.ReactNode;
    title?: string;
}
export default function ChartCard({ children, title }: ChartCardProps) {
    const { t } = useTranslation();
    return (
        <Card className="w-full overflow-x-auto">
            <div className="mb-4 flex items-center justify-between">
                <Title level="4" className="font-semibold">
                    {title}
                </Title>
                <div className="text-primary flex items-center gap-2">
                    <Paragraph>{t('charts.share')}</Paragraph>
                    <Share2Icon />
                </div>
            </div>

            {children}
        </Card>
    );
}
