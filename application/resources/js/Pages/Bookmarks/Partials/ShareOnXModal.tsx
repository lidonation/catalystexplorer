import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Modal from '@/Components/layout/Modal.tsx';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Switch from '@/Components/atoms/Switch';
import Title from '@/Components/atoms/Title';
import UserAvatar from '@/Components/UserAvatar';
import { Tooltip, TooltipContent, TooltipProvider } from '@/Components/atoms/Tooltip';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import CatalystEyeIcon from '@/Components/svgs/CatalystEyeIcon';
import ProposalTableView from '../../Proposals/Partials/ProposalTableView';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import UserData = App.DataTransferObjects.UserData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ShareOnXModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookmarkCollection: BookmarkCollectionData;
    user?: UserData;
    auth?: any;
    type: string;
    selectedColumns?: string[] | null;
    props: any;
    streamedProposals: ProposalData[];
    isVoterList: boolean;
}

export default function ShareOnXModal({
    isOpen,
    onClose,
    bookmarkCollection,
    user,
    auth,
    type,
    selectedColumns,
    props,
    streamedProposals,
    isVoterList
}: ShareOnXModalProps) {
    const { t } = useLaravelReactI18n();
    
    // Share modal form states
    const [shareGroupByCategories, setShareGroupByCategories] = useState<boolean>(false);
    const [shareIncludeProposals, setShareIncludeProposals] = useState<boolean>(true);
    const [shareIncludeImage, setShareIncludeImage] = useState<boolean>(true);

    // Generate username from name
    const generateUsername = (name: string) => {
        if (!name) return '@user';
        return '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
    };

    return (
        <Modal
            title={t('shareOnX')}
            isOpen={isOpen}
            onClose={onClose}
            logo={false}
            contentClasses="w-full max-w-full sm:max-w-full md:max-w-full lg:max-w-2xl h-screen max-h-screen overflow-y-auto"
        >
            <div className="">
                {/* Controls Section */}
                <div className="">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 py-3">
                            <Paragraph className="whitespace-nowrap align-middle m-0">{t('groupByCategories')}</Paragraph>
                            <Switch
                                checked={shareGroupByCategories}
                                onCheckedChange={setShareGroupByCategories}
                                size="sm"
                                className="align-middle"
                            />
                        </div>

                        <div className="flex items-center gap-2 py-3">
                            <Paragraph className="text-content font-medium whitespace-nowrap">{t('includeProposals')}</Paragraph>
                            <Switch
                                checked={shareIncludeProposals}
                                onCheckedChange={setShareIncludeProposals}
                                size="sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-3">
                        <Paragraph className="text-content font-medium whitespace-nowrap">{t('includeImage')}</Paragraph>
                        <Switch
                            checked={shareIncludeImage}
                            onCheckedChange={setShareIncludeImage}
                            size="sm"
                        />
                    </div>
                </div>

                {/* Share Preview Card */}
                <div className="border border-light-gray-persist p-4 rounded-lg">
                    <div className="flex items-center gap-4 py-4 rounded-lg">
                        <TooltipProvider>
                            <Tooltip>
                                <UserAvatar
                                    data-testid="user-avatar"
                                    size="size-8"
                                    imageUrl={
                                        user?.hero_img_url
                                            ? user?.hero_img_url
                                            : undefined
                                    }
                                    name={user?.name ?? 'Anonymous'}
                                />

                                <TooltipContent side="bottom">
                                    <Paragraph size="sm">
                                        {auth?.user?.name || 'User'}
                                    </Paragraph>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div>
                            <div className="font-semibold text-content">
                                {auth?.user?.name || 'User Name'}
                            </div>
                            <div className="text-gray-persist text-sm">
                                {generateUsername(auth?.user?.name || 'user')}
                            </div>
                        </div>
                    </div>

                    {/* Preview Text */}
                    <div className="rounded-lg">
                        <Paragraph className="text-content">
                            {t('shareXMessage')
                                .replace('{title}', bookmarkCollection.title || '')
                                .split('{url}').map((part, index, array) => 
                                    index < array.length - 1 ? (
                                        <span key={index}>
                                            {part}
                                            <a href={generateLocalizedRoute('lists.view', { bookmarkCollection: bookmarkCollection.id, type: type })} className="!text-primary underline">
                                                {generateLocalizedRoute('lists.view', { bookmarkCollection: bookmarkCollection.id, type: type })}
                                            </a>
                                        </span>
                                    ) : part
                                )}
                        </Paragraph>
                    </div>

                    {shareIncludeImage && (
                        <div className="w-full bg-background rounded-b-lg" style={{ marginTop: 0 }}>
                            
                            <div className="flex items-center justify-between py-7">
                                <div className="flex flex-col">
                                    <div className="flex items-start gap-4 mb-2">
                                        <Title level='3' className="font-bold text-content">
                                            {bookmarkCollection.title}
                                        </Title>
                                    </div>
                                    <Paragraph className="text-lg text-gray-persist">
                                        {t('votingListExport')}
                                    </Paragraph>
                                </div>

                                <div className="flex-shrink-0">
                                    <CatalystLogo className="h-8 sm:h-12 md:h-14 lg:h-16 w-auto" />
                                </div>
                            </div>

                            <div className='border-b border-light-gray-persist/60'></div>

                            {shareIncludeProposals && type === 'proposals' && (
                                <div>
                                    <ProposalTableView
                                        proposals={isVoterList ? { ...props.proposals, data: streamedProposals } : props.proposals}
                                        actionType="view"
                                        disableSorting={true}
                                        columns={['title', 'budget', 'category', 'openSourced', 'teams', 'viewProposal']}
                                        showPagination={false}
                                        iconOnlyActions={true}
                                        iconActionsConfig={['bookmark', 'compare']}
                                        customStyles={{
                                            tableWrapper: '!border-table-header-bg !shadow-none rounded-lg',
                                            tableHeader: '!bg-table-header-bg',
                                            headerCell: '!text-table-header-text !border-r-0',
                                            headerText: 'text-table-header-text'
                                        }}
                                        headerAlignment="left"
                                        disableInertiaLoading={bookmarkCollection.list_type === 'voter'}
                                        containerClassName="!max-w-none !mx-0 !px-0"
                                    />
                                </div>
                            )}

                            {/* Separator line */}
                            <div className='border-b border-light-gray-persist/60'></div>

                            {/* Footer Section */}
                            <div className="flex items-center justify-center py-6">
                                <div className="flex flex-col items-center gap-3">
                                    <Paragraph className="flex text-sm text-gray-persist gap-1 items-baseline">
                                        {t('proposalPdfHeader.footer.generatedWith')} <Paragraph className="text-primary">{t('proposalPdfHeader.footer.catalystExplorer')}</Paragraph>.
                                    </Paragraph>
                                    <Paragraph className="flex text-sm text-gray-persist gap-1 items-baseline">
                                        {t('proposalPdfHeader.footer.visit')} <Paragraph className="text-primary underline">{t('proposalPdfHeader.footer.website')}</Paragraph>
                                    </Paragraph>
                                    <Paragraph className="flex text-sm text-gray-persist">
                                        {t('proposalPdfHeader.footer.empoweringCommunity')} · {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                                    </Paragraph>
                                    <CatalystEyeIcon className="text-primary" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 pt-4">
                       
                        {(shareIncludeImage && shareIncludeProposals) && (
                            <div className="border border-light-gray-persist rounded-lg p-3">
                                <Paragraph size="sm" className="text-gray-persist m-0">
                                    {t('shareNoteImageAttachment')}
                                </Paragraph>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-4">
                            {(shareIncludeImage && shareIncludeProposals) && (
                                <PrimaryButton
                                    className='rounded-xl p-4 hover:bg-primary/[0.6] transition-shadow duration-200'
                                    onClick={() => {
                                        let downloadUrl = generateLocalizedRoute('lists.downloadPng', {
                                            bookmarkCollection: bookmarkCollection.id,
                                            type: type
                                        });
                                        
                                        const params = new URLSearchParams();
                                        
                                        const userSelectedColumns = selectedColumns;
                                        if (userSelectedColumns && userSelectedColumns.length > 0) {
                                            const pngColumns = userSelectedColumns.filter(col => col !== 'viewProposal');
                                            if (pngColumns.length > 0) {
                                                params.set('columns', JSON.stringify(pngColumns));
                                            }
                                        }
                                        
                                        downloadUrl += `?${params.toString()}`;
                                        window.open(downloadUrl, '_blank');
                                    }}
                                >
                                    <Paragraph className="flex items-center gap-2 m-0 px-4">
                                        {t('downloadImage')}
                                    </Paragraph>
                                </PrimaryButton>
                            )}
                            <PrimaryButton
                                className='rounded-xl p-4 hover:bg-primary/[0.6] transition-shadow duration-200'
                                onClick={() => {
                                    const routePath = generateLocalizedRoute('lists.view', { 
                                        bookmarkCollection: bookmarkCollection.id, 
                                        type: type 
                                    });
                                    
                                    const listUrl = routePath.startsWith('http') ? routePath : window.location.origin + routePath;
                                    
                                    const tweetText = t('shareXMessage')
                                        .replace('{title}', bookmarkCollection.title || '')
                                        .replace('{url}', listUrl);
                                
                                    const twitterIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                            
                                    window.open(twitterIntentUrl, '_blank', 'width=600,height=400');
                                }}
                            >
                                <Paragraph className="flex items-center gap-2 m-0 px-4">
                                    {t('postOnX')}
                                </Paragraph>
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
