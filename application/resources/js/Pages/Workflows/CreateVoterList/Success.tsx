import React from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import {VerificationBadge} from "@/Components/svgs/VerificationBadge";

const Success: React.FC = () => {
    const { t } = useTranslation();

    return (
        <WorkflowLayout>
            <Content>
        

                <div className="bg-background mx-auto flex min-h-[600px] w-full flex-col items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded p-8 md:w-3/4">
                        <Title level="4" className="mx-4 text-center font-bold">
                            {t('workflows.voterList.success.title')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center"
                        >
                            {t('workflows.voterList.success.message')}
                        </Paragraph>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Success;
