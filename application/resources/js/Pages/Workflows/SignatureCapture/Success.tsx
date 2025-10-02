import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import WorkflowLayout from '../WorkflowLayout';

const Success: React.FC = () => {
    const { t } = useLaravelReactI18n();

    return (
        <WorkflowLayout title="Register Signature">
            <Content>
                <div className="flex flex-col min-h-[60vh] items-center justify-center pb-8">
                    <div className="bg-background mx-auto mt-8 flex h-full w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                        <div className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm">
                            <Title
                                level="4"
                                className="mx-4 text-center font-bold"
                            >
                                {t('workflows.signature.success.title')}
                            </Title>
                            <VerificationBadge size={80} />
                            <Paragraph
                                size="sm"
                                className="text-gray-persist mt-4 text-center"
                            >
                                {t('workflows.signature.success.message')}
                            </Paragraph>
                        </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <PrimaryLink
                            href={useLocalizedRoute('my.votes')}
                            className="text-sm lg:px-8 lg:py-3"
                        >
                            <span>{t('votes')}</span>
                        </PrimaryLink>
                        <PrimaryLink
                            href={useLocalizedRoute('my.transactions')}
                            className="text-sm lg:px-8 lg:py-3"
                        >
                            <span>{t('my.transactions')}</span>
                        </PrimaryLink>
                        <PrimaryLink
                            href={useLocalizedRoute('my.proposals.index')}
                            className="text-sm lg:px-8 lg:py-3"
                        >
                            <span>{t('workflows.linkWallet.backToMyProposals')}</span>
                        </PrimaryLink>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Success;
