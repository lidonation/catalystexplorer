import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect } from 'react';
import Content from '../Partials/WorkflowContent';
import WorkflowLayout from '../WorkflowLayout';

interface SuccessProps {
    returnContext?: {
        returnTo: string;
        proposal: string;
    };
}
const Success: React.FC = ({ returnContext }: SuccessProps) => {
    const { t } = useLaravelReactI18n();

       const getReturnUrl = () => {
        if (returnContext?.returnTo === 'link-wallet' && returnContext?.proposal) {
            return useLocalizedRoute('workflows.linkWallet.index', {
                step: 1,
                proposal: returnContext.proposal,
            });
        }
    };

    return (
        <WorkflowLayout title="Register Signature">
            <Content>
                <div className="flex min-h-[60vh] flex-col items-center justify-center pb-8">
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
                    {returnContext?.returnTo === 'link-wallet' ? (
                        <PrimaryLink
                            href={getReturnUrl()}
                            className="px-6 py-3"
                        >
                            {t(
                                'workflows.signature.success.returnToLinkWallet',
                            )}
                        </PrimaryLink>
                    ) : (
                        <div className="flex flex-col gap-4">
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
                                <span>
                                    {t(
                                        'workflows.linkWallet.backToMyProposals',
                                    )}
                                </span>
                            </PrimaryLink>
                            <PrimaryLink
                                href={useLocalizedRoute('my.wallets')}
                                className="text-sm lg:px-8 lg:py-3"
                            >
                                <span>
                                    {t(
                                        'workflows.linkWallet.myWallets',
                                    )}
                                </span>
                            </PrimaryLink>
                        </div>
                    )}
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Success;
