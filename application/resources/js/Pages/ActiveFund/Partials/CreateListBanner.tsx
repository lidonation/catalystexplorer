import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function CreateListBanner() {
    const { t } = useLaravelReactI18n();

    return (
        <div
            className="grid w-full grid-cols-1 gap-10 rounded-md p-4 px-8 py-10 lg:grid-cols-2"
            style={{
                background: 'linear-gradient(90deg, #DDF3FF 0%, #92A9F2 100%)',
            }}
        >
            <div className="text-content-darker w-full">
                <Title level="4" className="mb-4 font-bold">
                    {t('activeFund.bannerTitle')}
                </Title>
                <Paragraph>{t('activeFund.bannerSubtitle')}</Paragraph>
            </div>
            <div className="flex h-full w-full items-center justify-center">
                <div className="grid h-fit w-full grid-cols-1 gap-2 md:grid-cols-3">
                    <PrimaryLink
                        className="text-center"
                        href={useLocalizedRoute(
                            'workflows.createVoterList.index',
                            { step: 1 },
                        )}
                    >
                        {t('my.createVotingList')}
                    </PrimaryLink>
                    <PrimaryLink
                        className="text-center"
                        href={useLocalizedRoute(
                            'workflows.tinderProposal.index',
                            { step: 1 },
                        )}
                    >
                        {t('my.createTinderList')}
                    </PrimaryLink>
                    <PrimaryLink
                        className="text-center"
                        href={useLocalizedRoute('workflows.bookmarks.index', {
                            step: 1,
                        })}
                    >
                        {t('activeFund.createBookmarkList')}
                    </PrimaryLink>
                </div>
            </div>
        </div>
    );
}
