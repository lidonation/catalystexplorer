import { useCallback, useMemo, useState } from 'react';
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
import { currency } from '@/utils/currency';
import { getNestedValue } from '@/lib/proposalColumnRenderers';
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

const DEFAULT_TWEET_COLUMNS = ['title', 'budget', 'category', 'openSourced', 'teams'] as const;
const EXCLUDED_TWEET_COLUMNS = new Set([
    'viewProposal',
    'manageProposal',
    'proposalActions',
    'actions',
    'action',
]);

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

    const routePath = useMemo(
        () =>
            generateLocalizedRoute('lists.view', {
                bookmarkCollection: bookmarkCollection.id,
                type: type,
            }),
        [bookmarkCollection.id, type],
    );

    const listUrl = useMemo(() => {
        if (routePath.startsWith('http')) {
            return routePath;
        }

        return typeof window !== 'undefined'
            ? `${window.location.origin}${routePath}`
            : routePath;
    }, [routePath]);

    const selectedShareColumns = useMemo(() => {
        const rawColumns = Array.isArray(selectedColumns) && selectedColumns.length
            ? selectedColumns
            : [...DEFAULT_TWEET_COLUMNS];

        return Array.from(new Set(
            rawColumns
                .map(column => (typeof column === 'string' ? column : null))
                .filter((column): column is string => !!column && !EXCLUDED_TWEET_COLUMNS.has(column)),
        ));
    }, [selectedColumns]);

    const tweetColumns = useMemo(() => {
        const columns = [...selectedShareColumns];

        if (!columns.includes('title')) {
            columns.unshift('title');
        }

        return columns;
    }, [selectedShareColumns]);

    const proposalsData = props?.proposals;

    const columnLabelOverrides = useMemo(() => {
        const translate = (key: string, fallback: string) => {
            const translated = t(key as any);
            return translated && translated !== key ? translated : fallback;
        };

        return {
            title: translate('proposalColumns.title', 'Title'),
            proposal: translate('proposalColumns.title', 'Title'),
            budget: translate('proposalColumns.budget', 'Budget'),
            category: translate('proposalColumns.category', 'Category'),
            openSourced: translate('proposalColumns.openSourced', 'Open Source'),
            opensource: translate('proposalColumns.openSourced', 'Open Source'),
            teams: translate('proposalColumns.teams', 'Teams'),
            yesVotes: translate('proposalColumns.yesVotes', 'Yes Votes'),
            yes_votes_count: translate('proposalColumns.yesVotes', 'Yes Votes'),
            abstainVotes: translate('proposalColumns.abstainVotes', 'Abstain Votes'),
            abstain_votes_count: translate('proposalColumns.abstainVotes', 'Abstain Votes'),
            noVotes: translate('proposalColumns.noVotes', 'No Votes'),
            no_votes_count: translate('proposalColumns.noVotes', 'No Votes'),
            fund: translate('proposalColumns.fund', 'Fund'),
            'fund.label': translate('proposalColumns.fund', 'Fund'),
            status: translate('proposalColumns.status', 'Status'),
            funding_status: translate('proposalColumns.status', 'Status'),
            'campaign.title': translate('proposalColumns.campaign', 'Campaign'),
            my_vote: translate('proposalColumns.myVote', 'My Vote'),
        } as Record<string, string>;
    }, [t]);

    const getColumnLabel = useCallback(
        (column: string): string => {
            if (columnLabelOverrides[column]) {
                return columnLabelOverrides[column];
            }

            const normalized = column
                .replace(/\./g, ' ')
                .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (!normalized) {
                return column;
            }

            return normalized
                .split(' ')
                .map((word) =>
                    word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word,
                )
                .join(' ');
        },
        [columnLabelOverrides],
    );

    const proposalsForTweet = useMemo(() => {
        if (type !== 'proposals') {
            return [] as ProposalData[];
        }

        if (isVoterList) {
            if (streamedProposals && streamedProposals.length) {
                return streamedProposals;
            }
        }

        const proposalData = proposalsData?.data ?? [];

        return Array.isArray(proposalData) ? proposalData : [];
    }, [type, isVoterList, streamedProposals, proposalsData]);

    const normalizeValue = useCallback(
        (value: any): string | null => {
            if (value === null || value === undefined) {
                return null;
            }

            if (typeof value === 'string') {
                return value.trim() ? value.trim() : null;
            }

            if (typeof value === 'number') {
                return Number.isFinite(value) ? value.toLocaleString() : null;
            }

            if (typeof value === 'boolean') {
                return value ? t('Yes') : t('No');
            }

            if (Array.isArray(value)) {
                const normalizedItems = value
                    .map(item => normalizeValue(item))
                    .filter((item): item is string => !!item);

                if (!normalizedItems.length) {
                    return null;
                }

                const joined = normalizedItems.slice(0, 3).join(', ');
                return normalizedItems.length > 3
                    ? `${joined} +${normalizedItems.length - 3}`
                    : joined;
            }

            if (typeof value === 'object') {
                const priorityKeys = ['title', 'label', 'name', 'value'];
                for (const key of priorityKeys) {
                    if (value[key] !== undefined && value[key] !== null) {
                        const normalized = normalizeValue(value[key]);
                        if (normalized) {
                            return normalized;
                        }
                    }
                }

                return null;
            }

            return null;
        },
        [t],
    );

    const formatColumnValue = useCallback(
        (proposal: ProposalData, column: string): string | null => {
            switch (column) {
                case 'title':
                case 'proposal':
                    return proposal.title ?? null;
                case 'budget': {
                    const amount = proposal.amount_requested ?? null;
                    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

                    if (numericAmount === null || numericAmount === undefined || Number.isNaN(numericAmount)) {
                        return null;
                    }

                    const currencyCode = proposal.currency || 'USD';
                    const formatted = currency(Number(numericAmount), 2, currencyCode);
                    return typeof formatted === 'number' ? formatted.toString() : formatted;
                }
                case 'category':
                    return proposal.campaign?.title || proposal.fund?.label || null;
                case 'openSourced':
                case 'opensource':
                    return proposal.opensource ? t('Yes') : t('No');
                case 'teams': {
                    const teamNames = Array.isArray(proposal.users)
                        ? proposal.users
                              .map((user) => user?.name)
                              .filter((name): name is string => !!name && name.trim().length > 0)
                        : [];

                    if (teamNames.length) {
                        const display = teamNames.slice(0, 3).join(', ');
                        return teamNames.length > 3
                            ? `${display} +${teamNames.length - 3}`
                            : display;
                    }

                    const teamCount = (proposal as any)?.team_count ?? (proposal as any)?.users_count;
                    if (typeof teamCount === 'number' && teamCount > 0) {
                        return `${teamCount} team member${teamCount === 1 ? '' : 's'}`;
                    }

                    return null;
                }
                case 'yesVotes':
                case 'yes_votes_count':
                    return proposal.yes_votes_count !== undefined && proposal.yes_votes_count !== null
                        ? proposal.yes_votes_count.toLocaleString()
                        : null;
                case 'abstainVotes':
                case 'abstain_votes_count':
                    return proposal.abstain_votes_count !== undefined && proposal.abstain_votes_count !== null
                        ? proposal.abstain_votes_count.toLocaleString()
                        : null;
                case 'noVotes':
                case 'no_votes_count':
                    return proposal.no_votes_count !== undefined && proposal.no_votes_count !== null
                        ? proposal.no_votes_count.toLocaleString()
                        : null;
                case 'fund':
                case 'fund.label':
                    return proposal.fund?.label ?? null;
                case 'status':
                case 'funding_status':
                    return proposal.funding_status ?? null;
                default: {
                    const nested = getNestedValue(proposal, column);
                    if (nested !== undefined) {
                        const normalizedNested = normalizeValue(nested);
                        if (normalizedNested) {
                            return normalizedNested;
                        }
                    }

                    const direct = (proposal as Record<string, any>)[column];
                    return normalizeValue(direct);
                }
            }
        },
        [normalizeValue, t],
    );

    const formatProposalLine = useCallback(
        (proposal: ProposalData): string | null => {
            let headline: string | null = null;
            const details: string[] = [];

            tweetColumns.forEach((column) => {
                const value = formatColumnValue(proposal, column);
                if (!value) {
                    return;
                }

                if (column === 'title' || column === 'proposal') {
                    headline = value;
                    return;
                }

                const label = getColumnLabel(column);
                details.push(`${label}: ${value}`);
            });

            if (!headline) {
                headline = proposal.title ?? null;
            }

            if (!headline && !details.length) {
                return null;
            }

            if (!details.length) {
                return headline;
            }

            return headline ? `${headline} — ${details.join(' | ')}` : details.join(' | ');
        },
        [tweetColumns, formatColumnValue, getColumnLabel],
    );

    const tweetProposalLines = useMemo(() => {
        if (!shareIncludeProposals || type !== 'proposals') {
            return [] as string[];
        }

        return proposalsForTweet
            .map(proposal => formatProposalLine(proposal))
            .filter((line): line is string => !!line);
    }, [shareIncludeProposals, type, proposalsForTweet, formatProposalLine]);

    const baseTweetText = useMemo(
        () =>
            t('shareXMessage')
                .replace('{title}', bookmarkCollection.title || '')
                .replace('{url}', listUrl),
        [t, bookmarkCollection.title, listUrl],
    );

    const fullTweetText = useMemo(() => {
        if (!tweetProposalLines.length) {
            return baseTweetText;
        }

        return `${baseTweetText}\n\n${tweetProposalLines.join('\n')}`;
    }, [baseTweetText, tweetProposalLines]);

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
                        <Paragraph className="text-content whitespace-pre-wrap">
                            {fullTweetText.split(listUrl).map((part, index, array) =>
                                index < array.length - 1 ? (
                                    <span key={index}>
                                        {part}
                                        <a
                                            href={listUrl}
                                            className="!text-primary underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {listUrl}
                                        </a>
                                    </span>
                                ) : (
                                    <span key={index}>{part}</span>
                                )
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
                                        
                                        if (selectedShareColumns.length > 0) {
                                            params.set('columns', JSON.stringify(selectedShareColumns));
                                        }
                                        
                                        const paramString = params.toString();
                                        downloadUrl += paramString ? `?${paramString}` : '';
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
                                    const twitterIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(fullTweetText)}`;

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
