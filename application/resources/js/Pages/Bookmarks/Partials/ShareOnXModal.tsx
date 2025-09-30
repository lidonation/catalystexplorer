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
const MAX_TWEET_URL_LENGTH = 13000;

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

    const uncategorizedLabel = useMemo(() => {
        const campaignTranslation = t('uncategorizedCampaign' as any);
        if (campaignTranslation && campaignTranslation !== 'uncategorizedCampaign') {
            return campaignTranslation;
        }

        const genericTranslation = t('uncategorized' as any);
        if (genericTranslation && genericTranslation !== 'uncategorized') {
            return genericTranslation;
        }

        return 'Uncategorized';
    }, [t]);

    const getCampaignGroupName = useCallback(
        (proposal: ProposalData): string => {
            const campaignData = proposal.campaign as Record<string, any> | undefined;
            const rawGroupName =
                proposal.campaign?.title ??
                campaignData?.label ??
                campaignData?.name ??
                proposal.fund?.label ??
                null;

            if (rawGroupName && typeof rawGroupName === 'string' && rawGroupName.trim().length > 0) {
                return rawGroupName.trim();
            }

            return uncategorizedLabel;
        },
        [uncategorizedLabel],
    );

    const getColumnLabel = useCallback(
        (column: string): string => {
            if (!column) {
                return '';
            }

            const translationCandidates = Array.from(
                new Set([
                    `proposalColumns.${column}`,
                    `proposalColumns.${column.replace(/\./g, '')}`,
                    `proposalColumns.${column.replace(/\./g, '_')}`,
                    `proposalColumns.${column
                        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                        .toLowerCase()}`,
                ]),
            );

            for (const key of translationCandidates) {
                const translated = t(key as any);
                if (translated && translated !== key) {
                    return translated;
                }
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
        [t],
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
                case 'my_vote': {
                    const rawVote = (proposal as any)?.vote ?? (proposal as any)?.bookmark_vote ?? (proposal as any)?.my_vote;

                    if (rawVote === undefined || rawVote === null) {
                        return null;
                    }

                    const voteValue = typeof rawVote === 'string' ? parseInt(rawVote, 10) : rawVote;

                    switch (voteValue) {
                        case 1:
                            return t('Yes');
                        case 0:
                            return t('Abstain');
                        case -1:
                            return t('No');
                        default:
                            return null;
                    }
                }
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

            const columnsToUse = shareGroupByCategories
                ? tweetColumns.filter((column) => column !== 'category' && column !== 'campaign.title')
                : tweetColumns;

            columnsToUse.forEach((column) => {
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
        [tweetColumns, formatColumnValue, getColumnLabel, shareGroupByCategories],
    );

    type TweetEntry = {
        type: 'group' | 'proposal';
        value: string;
        groupName?: string;
    };

    const rawTweetEntries = useMemo(() => {
        if (!shareIncludeProposals || type !== 'proposals') {
            return [] as TweetEntry[];
        }

        const proposalsWithEntries: { proposal: ProposalData; entry: TweetEntry }[] = [];

        proposalsForTweet.forEach((proposal) => {
            const line = formatProposalLine(proposal);
            if (!line) {
                return;
            }

            proposalsWithEntries.push({
                proposal,
                entry: {
                    type: 'proposal',
                    value: `- ${line}`,
                },
            });
        });

        if (!shareGroupByCategories) {
            return proposalsWithEntries.map(({ entry }) => entry);
        }

        const groupedEntries: TweetEntry[] = [];
        const groupedMap = new Map<string, TweetEntry[]>();

        proposalsWithEntries.forEach(({ proposal, entry }) => {
            const groupName = getCampaignGroupName(proposal);
            const entryWithGroup: TweetEntry = { ...entry, groupName };

            if (!groupedMap.has(groupName)) {
                groupedMap.set(groupName, []);
            }

            groupedMap.get(groupName)!.push(entryWithGroup);
        });

        groupedMap.forEach((entries, groupName) => {
            if (!entries.length) {
                return;
            }

            groupedEntries.push({ type: 'group', value: groupName, groupName });
            groupedEntries.push(...entries);
        });

        return groupedEntries;
    }, [shareIncludeProposals, type, proposalsForTweet, formatProposalLine, shareGroupByCategories, getCampaignGroupName]);

    const baseTweetText = useMemo(
        () =>
            t('shareXMessage')
                .replace('{title}', bookmarkCollection.title || '')
                .replace('{url}', listUrl),
        [t, bookmarkCollection.title, listUrl],
    );

    const seeMoreTweetText = useMemo(
        () => t('tweetSeeMore'),
        [t],
    );

    const { limitedEntries, truncated: tweetLinesTruncated } = useMemo(() => {
        if (!rawTweetEntries.length) {
            return { limitedEntries: [] as TweetEntry[], truncated: false };
        }

        let limitedEntries: TweetEntry[] = [];
        let truncated = false;

        const computeEncodedLength = (entries: TweetEntry[], includeSeeMore: boolean) => {
            let text = baseTweetText;

            if (entries.length) {
                const lines = entries.map((entry) => entry.value);
                text += `\n\n${lines.join('\n\n')}`;
            }

            if (includeSeeMore) {
                text += `\n\n${seeMoreTweetText}`;
            }

            return encodeURIComponent(text).length;
        };

        rawTweetEntries.forEach((entry, index) => {
            const candidateEntries = [...limitedEntries, entry];
            const remaining = rawTweetEntries.length - (index + 1);
            const includeSeeMore = remaining > 0;
            const encodedLength = computeEncodedLength(candidateEntries, includeSeeMore);

            if (encodedLength <= MAX_TWEET_URL_LENGTH) {
                limitedEntries = candidateEntries;
            } else {
                truncated = true;
            }
        });

        if (!truncated && limitedEntries.length < rawTweetEntries.length) {
            truncated = true;
        }

        if (truncated) {
            while (limitedEntries.length && computeEncodedLength(limitedEntries, true) > MAX_TWEET_URL_LENGTH) {
                limitedEntries = limitedEntries.slice(0, -1);
            }

            if (computeEncodedLength(limitedEntries, true) > MAX_TWEET_URL_LENGTH) {
                return { limitedEntries, truncated: false };
            }
        }

        if (shareGroupByCategories && limitedEntries.length) {
            const filteredEntries: TweetEntry[] = [];
            let pendingHeading: TweetEntry | null = null;

            limitedEntries.forEach((entry) => {
                if (entry.type === 'group') {
                    pendingHeading = entry;
                    return;
                }

                if (pendingHeading) {
                    filteredEntries.push(pendingHeading);
                    pendingHeading = null;
                }

                filteredEntries.push(entry);
            });

            limitedEntries = filteredEntries;
        }

        return { limitedEntries, truncated };
    }, [rawTweetEntries, baseTweetText, seeMoreTweetText, shareGroupByCategories]);

    const tweetProposalLines = useMemo(
        () => limitedEntries.map((entry) => entry.value),
        [limitedEntries],
    );

    const fullTweetText = useMemo(() => {
        let text = baseTweetText;

        if (tweetProposalLines.length) {
            text += `\n\n${tweetProposalLines.join('\n\n')}`;
        }

        if (tweetLinesTruncated) {
            text += `\n\n${seeMoreTweetText}`;
        }

        return text;
    }, [baseTweetText, tweetProposalLines, tweetLinesTruncated, seeMoreTweetText]);

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

                                    window.open(twitterIntentUrl, '_blank', 'width=1200,height=800');
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
