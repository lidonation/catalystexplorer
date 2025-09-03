import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import Card from '@/Components/Card';
import Divider from '@/Components/Divider';
import ExpandableContent from '@/Components/ExpandableContent';
import ExpandableContentAnimation from '@/Components/ExpandableContentAnimation';
import RichContent from '@/Components/RichContent';
import CommunitiesIcon from '@/Components/svgs/CommunitiesSvg';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useRef, useState } from 'react';
import CommunityIdeascaleProfiles from './CommunityIdeascaleProfiles';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunityCardProps {
    community: CommunityData;
    embedded?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
    community,
    embedded = true,
}) => {
    const { t } = useLaravelReactI18n();
    const [isHoveredContent, setIsHoveredContent] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [contentLineCount, setContentLineCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const element = containerRef.current;
            if (element) {
                const style = getComputedStyle(element);
                const lineHeight = parseFloat(style.lineHeight) || 24; // fallback to 24px
                const height = element.scrollHeight; // Use scrollHeight instead of offsetHeight
                const calculatedLines = Math.ceil(height / lineHeight);
                console.log('Line calculation:', {
                    height,
                    lineHeight,
                    calculatedLines,
                }); // Debug log
                setContentLineCount(calculatedLines);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [community.content]);

    return (
        <Card className="border-border-dark-on-dark flex-1 justify-between overflow-hidden border">
            <div className="border-gray-persist/50 text-gray-persist/50 ml-auto w-fit items-center rounded-md border-1 py-0">
                <ListProvider>
                    <BookmarkButton
                        modelType="communities"
                        width={16}
                        height={16}
                        itemId={community?.id ?? '0'}
                    />
                </ListProvider>
            </div>
            <div className="flex h-auto w-full items-center justify-center overflow-hidden pt-8 pb-4">
                <div className="bg-background-darker border-background-lighter flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4">
                    <CommunitiesIcon className="text-dark h-8 w-8" />
                </div>
            </div>
            <div className="px-8">
                <div className="flex w-full flex-col items-center justify-center text-center">
                    <Link
                        href={useLocalizedRoute('communities.dashboard', {
                            slug: community.slug,
                        })}
                    >
                        <Title
                            level="4"
                            className="hover:text-primary font-semibold"
                        >
                            {community.title}
                        </Title>
                    </Link>
                    {contentLineCount > 4 ? (
                        <ExpandableContentAnimation
                            lineClamp={4}
                            contentRef={containerRef}
                            onHoverChange={setIsHoveredContent}
                        >
                            <div className="relative">
                                <ExpandableContent
                                    expanded={isHoveredContent}
                                    lineClamp={4}
                                    collapsedHeight={96}
                                >
                                    <div
                                        ref={containerRef}
                                        className={`text-content text-4 cursor-pointer pb-2 transition-all duration-200 ${
                                            isHoveredContent
                                                ? 'bg-background relative z-10 rounded-md px-2 shadow-lg'
                                                : ''
                                        }`}
                                        style={{
                                            paddingBottom: isHoveredContent
                                                ? '20px'
                                                : '2px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: isHoveredContent
                                                ? 'none'
                                                : 4,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: isHoveredContent
                                                ? 'visible'
                                                : 'hidden',
                                        }}
                                    >
                                        <RichContent
                                            content={community.content}
                                        />
                                    </div>
                                </ExpandableContent>
                            </div>
                        </ExpandableContentAnimation>
                    ) : (
                        <div
                            ref={containerRef}
                            className="text-content text-4 pb-2"
                        >
                            <RichContent content={community.content} />
                        </div>
                    )}
                </div>
            </div>
            {embedded && (
                <div>
                    <div className="px-8">
                        <div className="mt-4 flex flex-row items-center justify-between">
                            <div className="text-4 text-primary-100">
                                {t('communities.proposers').toUpperCase()}
                            </div>

                            <CommunityIdeascaleProfiles
                                ideascaleProfiles={community.ideascale_profiles}
                                total={community?.ideascale_profiles_count ?? 0}
                            />
                        </div>

                        <Divider dotted={true} />

                        <div className="flex flex-row items-center justify-between">
                            <div className="text-4 text-primary-100">
                                {t('communities.proposals').toUpperCase()}
                            </div>
                            <Value>{community.proposals_count}</Value>
                        </div>
                    </div>

                    <Divider />

                    <div className="align-center flex justify-center py-4">
                        <PrimaryLink
                            href={useLocalizedRoute('communities.dashboard', {
                                slug: community.slug,
                            })}
                        >
                            {t('explore')}
                        </PrimaryLink>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CommunityCard;
