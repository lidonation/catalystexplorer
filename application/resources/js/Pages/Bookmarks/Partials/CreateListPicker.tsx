import SecondaryLink from '@/Components/SecondaryLink.tsx';
import Paragraph from '@/Components/atoms/Paragraph.tsx';
import PrimaryLink from '@/Components/atoms/PrimaryLink.tsx';
import Title from '@/Components/atoms/Title.tsx';
import Modal from '@/Components/layout/Modal.tsx';
import { useLocalizedRoute } from '@/utils/localizedRoute.ts';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Dispatch, SetStateAction } from 'react';

export default function CreateListPicker({
    showPickingList,
    setPickingList,
    context,
    campaign,
}: {
    showPickingList: boolean;
    setPickingList: Dispatch<SetStateAction<boolean>>;
    context?: 'bookmarks' | 'funds';
    campaign?: string | null;
}) {
    const { t } = useLaravelReactI18n();

    return (
        <Modal
            title={t('bookmarks.editList')}
            isOpen={!!showPickingList}
            logo={false}
            centered
            contentClasses="max-w-2xl"
            onClose={() => setPickingList(false)}
            data-testid="create-list-picker"
        >
            <div className="flex flex-col gap-8 px-6 py-10 sm:px-8 sm:py-16">
                <Title
                    className="text-center"
                    level="5"
                    data-testid="list-title"
                >
                    {t('my.createListTitle')}
                </Title>

                <section className="grid grid-cols-2">
                    <div className="border-border-secondary col-span-2 -mb-px border p-4">
                        <div className="flex flex-col justify-between gap-3">
                            <Paragraph className="p-3">
                                {t('my.createVotingListBlurb')}
                            </Paragraph>
                            <PrimaryLink
                                href={useLocalizedRoute(
                                    'workflows.createVoterList.index',
                                    { step: 1 },
                                )}
                                data-testid="create-voting-list-button"
                                aria-label="Create voting list"
                            >
                                {`+ ${t('my.createVotingList')}`}
                            </PrimaryLink>
                        </div>
                    </div>

                    <div
                        className={`border-border-secondary -mr-px border p-4 ${context === 'funds' ? 'col-span-full w-full' : 'col-span-1'}`}
                    >
                        <div className="flex h-full flex-col justify-between gap-3">
                            <Paragraph className="sm:p-2">
                                {t('my.createTinderListBlurb')}
                            </Paragraph>
                            <div
                                className={`${context === 'funds' ? 'flex items-center justify-center' : ''}`}
                            >
                                <SecondaryLink
                                    href={
                                        context === 'funds'
                                            ? `${useLocalizedRoute(
                                                  'workflows.tinderProposal.index',
                                                  { step: 1 },
                                              )}?campaign=${campaign ?? ''}`
                                            : useLocalizedRoute(
                                                  'workflows.tinderProposal.index',
                                                  { step: 1 },
                                              )
                                    }
                                    data-testid="create-tinder-list-button"
                                    aria-label="Create tinder list"
                                >
                                    {`+ ${t('my.createTinderList')}`}
                                </SecondaryLink>
                            </div>
                        </div>
                    </div>

                    {context !== 'funds' && (
                        <div className="border-border-secondary col-span-1 border p-4">
                            <div className="flex h-full flex-col justify-between gap-3">
                                <Paragraph className="sm:p-2">
                                    {t('my.createListBlurb')}
                                </Paragraph>
                                <div>
                                    <SecondaryLink
                                        href={useLocalizedRoute(
                                            'workflows.bookmarks.index',
                                            { step: 1 },
                                        )}
                                        data-testid="create-bookmark-list-button"
                                        aria-label="Create bookmark list"
                                    >
                                        {`+ ${t('my.createBookmarkList')}`}
                                    </SecondaryLink>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
}
