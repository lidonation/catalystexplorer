import Title from "@/Components/atoms/Title.tsx";
import Modal from "@/Components/layout/Modal.tsx";
import {useTranslation} from "react-i18next";
import {Dispatch, SetStateAction} from "react";
import PrimaryLink from "@/Components/atoms/PrimaryLink.tsx";
import {useLocalizedRoute} from "@/utils/localizedRoute.ts";
import SecondaryLink from "@/Components/SecondaryLink.tsx";

export default function CreateListPicker({showPickingList, setPickingList}: {
    showPickingList: boolean,
    setPickingList: Dispatch<SetStateAction<boolean>>;
}) {
    const {t} = useTranslation();

    return (
        <Modal
            title={t('bookmarks.editList')}
            isOpen={!!showPickingList}
            logo={false}
            centered
            contentClasses='max-w-xl'
            onClose={() => setPickingList(false)}>
            <div className="flex flex-col gap-4 p-4 text-center">
                <Title level="5">{t('my.createListTitle')}</Title>

                <section className='grid grid-cols-2'>
                    <div className='col-span-2 border border-border-secondary p-4 -mb-px'>
                        <div className="flex flex-col justify-between gap-3">
                            <p>
                                {t('my.createVotingListBlurb')}
                            </p>
                            <PrimaryLink
                                href={useLocalizedRoute(
                                    'workflows.voting.index',
                                    {step: 1},
                                )}
                            >
                                {`+ ${t('my.createVotingList')}`}
                            </PrimaryLink>
                        </div>
                    </div>

                    <div className='col-span-1 border  border-border-secondary p-4 -mr-px'>
                        <div className="flex flex-col h-full justify-between gap-3">
                            <p>
                                {t('my.createTinderListBlurb')}
                            </p>
                            <div>
                                <SecondaryLink
                                    href={useLocalizedRoute(
                                        'workflows.bookmarks.index',
                                        {step: 1},
                                    )}
                                >
                                    {`+ ${t('my.createTinderList')}`}
                                </SecondaryLink>
                            </div>
                        </div>
                    </div>

                    <div className='col-span-1 border border-border-secondary p-4'>
                        <div className="flex flex-col h-full justify-between gap-3">
                            <p>
                                {t('my.createListBlurb')}
                            </p>
                            <div>
                                <SecondaryLink
                                    href={useLocalizedRoute(
                                        'workflows.bookmarks.index',
                                        {step: 1},
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
