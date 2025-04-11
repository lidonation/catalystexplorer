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
                <div className="flex w-[calc(100%-4rem)] my-8 mx-auto md:w-3/4 h-3/4 items-center justify-center bg-background rounded-lg p-8">
                    <div className="flex flex-col w-full h-full md:w-3/4 items-center justify-center rounded md:shadow-sm p-8">
                        <Title level="4" className="text-center mx-4 font-bold">
                            {t('workflows.voting.success.title')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph size="sm" className="text-center mt-4 text-gray-persist">
                            {t('workflows.voting.success.message')}
                        </Paragraph>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Success;
