import Title from "@/Components/atoms/Title.tsx";
import Modal from "@/Components/layout/Modal.tsx";
import {useLaravelReactI18n} from "laravel-react-i18n";
import {Dispatch, SetStateAction} from "react";
import PrimaryLink from "@/Components/atoms/PrimaryLink.tsx";
import {useLocalizedRoute} from "@/utils/localizedRoute.ts";
import SecondaryLink from "@/Components/SecondaryLink.tsx";
import Paragraph from '@/Components/atoms/Paragraph.tsx';

export default function CreateListPicker({showPickingList, setPickingList}: {
    showPickingList: boolean,
    setPickingList: Dispatch<SetStateAction<boolean>>;
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
        >
            <div className="flex flex-col gap-8 px-6 sm:px-8 py-10 sm:py-16">
                <Title className='text-center' level="5">{t('my.createListTitle')}</Title>

                <section className="grid grid-cols-2">
                    <div className="border-border-secondary col-span-2 -mb-px border p-4">
                        <div className="flex flex-col justify-between gap-3">
                            <Paragraph className='p-3'>
                                {t('my.createVotingListBlurb')}
                            </Paragraph>
                            <PrimaryLink
                                href={useLocalizedRoute(
                                    'workflows.createVoterList.index',
                                    { step: 1 },
                                )}
                            >
                                {`+ ${t('my.createVotingList')}`}
                            </PrimaryLink>
                        </div>
                    </div>

                    <div className="border-border-secondary col-span-1 -mr-px border p-4">
                        <div className="flex h-full flex-col justify-between gap-3">
                            <Paragraph className='sm:p-2'>
                                {t('my.createTinderListBlurb')}
                            </Paragraph>
                            <div>
                                <SecondaryLink
                                    href={useLocalizedRoute(
                                        'workflows.tinderProposal.index',
                                        { step: 1 },
                                    )}
                                >
                                    {`+ ${t('my.createTinderList')}`}
                                </SecondaryLink>
                            </div>
                        </div>
                    </div>

                    <div className="border-border-secondary col-span-1 border p-4">
                        <div className="flex h-full flex-col justify-between gap-3">
                            <Paragraph className='sm:p-2'>
                                {t('my.createListBlurb')}
                            </Paragraph>
                            <div>
                                <SecondaryLink
                                    href={useLocalizedRoute(
                                        'workflows.bookmarks.index',
                                        { step: 1 },
                                    )}
                                >
                                    {`+ ${t('my.createBookmarkList')}`}
                                </SecondaryLink>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Modal>
    );
}
