import React from 'react';
import LinkTypeIcon from '@/Components/svgs/LinkTypeIcon';
import { ArrowUpRight } from '@/Components/svgs/ArrowUpRight';
import { currency } from '@/utils/currency';

interface LinkCardProps {
    link: App.DataTransferObjects.LinkData;
    className?: string;
}

const SingleLinkCard: React.FC<LinkCardProps> = ({ link, className = '' }) => {
    const displayTitle = link.title || link.label || getDomainFromUrl(link.link);
    const displayUrl = link.link;
    const isValid = link.valid && link.status === 'published';

    const relatedModel = link.getRelatedModel?.() || (link.proposal || link.service);
    const modelType = link.getModelTypeLabel?.() || getModelTypeFromClass(link.modelType || '');

    const handleClick = () => {
        if (isValid) {
            window.open(displayUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleModelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (link.proposal) {
            window.open(link.proposal.link, '_blank', 'noopener,noreferrer');
        } else if (link.service) {
            window.open(link.service.link, '_blank', 'noopener,noreferrer');
        }
    };

    const cardClasses = `
        bg-background 
        shadow-cx-box-shadow 
        flex 
        flex-col
        gap-4 
        rounded-lg 
        p-4 
        transition-all 
        duration-200
        hover:shadow-lg
        ${className}
    `;

    return (
        <div className={cardClasses.trim()}>
            {/* Link Section */}
            <div 
                className={`flex items-center gap-3 ${isValid ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2' : 'opacity-60'}`}
                onClick={handleClick}
                role={isValid ? "button" : "presentation"}
                tabIndex={isValid ? 0 : -1}
                onKeyDown={(e) => {
                    if (isValid && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                aria-label={isValid ? `Visit ${displayTitle}` : `${displayTitle} (unavailable)`}
            >
                {/* Link Icon */}
                <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${getIconBackgroundColor(link.type)}`}>
                        <LinkTypeIcon 
                            type={link.type} 
                            size={20}
                            className={getIconColor(link.type)}
                        />
                    </div>
                </div>

                {/* Link Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-content font-medium text-sm truncate">
                                {displayTitle}
                            </h3>
                            <p className="text-gray-persist text-xs mt-1 truncate">
                                {displayUrl}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Status indicator */}
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(isValid)}`}>
                                {isValid ? 'Active' : 'Inactive'}
                            </div>
                            
                            {/* External link icon */}
                            {isValid && (
                                <div className="text-gray-persist">
                                    <ArrowUpRight />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Section */}
            {relatedModel && (
                <div 
                    className="border-t border-gray-200 dark:border-gray-700 pt-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2"
                    onClick={handleModelClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleModelClick(e);
                        }
                    }}
                    aria-label={`View ${modelType}: ${getModelTitle(relatedModel)}`}
                >
                    {/* Model Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModelTypeBadgeClasses(modelType)}`}>
                            {modelType}
                        </span>
                        <ArrowUpRight size={14} className="text-gray-persist" />
                    </div>

                    {/* Model Content */}
                    {link.proposal && (
                        <div>
                            <h4 className="text-content font-medium text-sm mb-2 line-clamp-2">
                                {link.proposal.title}
                            </h4>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-persist">
                                {link.proposal.amountRequested && (
                                    <div>
                                        <span className="font-medium">Budget:</span>{' '}
                                        {currency(link.proposal.amountRequested, 2, link.proposal.currency || 'ADA')}
                                    </div>
                                )}
                                {link.proposal.fund?.title && (
                                    <div>
                                        <span className="font-medium">Fund:</span>{' '}
                                        {link.proposal.fund.title}
                                    </div>
                                )}
                                {link.proposal.campaign?.title && (
                                    <div>
                                        <span className="font-medium">Campaign:</span>{' '}
                                        {link.proposal.campaign.title}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {link.service && (
                        <div>
                            <h4 className="text-content font-medium text-sm mb-2 line-clamp-2">
                                {link.service.title}
                            </h4>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-persist">
                                {(link.service.user?.name || link.service.name) && (
                                    <div>
                                        <span className="font-medium">Author:</span>{' '}
                                        {link.service.user?.name || link.service.name}
                                    </div>
                                )}
                                {link.service.type && (
                                    <div>
                                        <span className="font-medium">Type:</span>{' '}
                                        {link.service.type}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper functions
function getDomainFromUrl(url: string): string {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

function getModelTypeFromClass(modelClass: string): string {
    if (modelClass.includes('Proposal')) return 'Proposal';
    if (modelClass.includes('Service')) return 'Service';
    return 'Unknown';
}

function getModelTitle(model: any): string {
    return model?.title || 'Untitled';
}

function getIconBackgroundColor(type: string): string {
    switch (type) {
        case 'youtube':
            return 'bg-red-50 dark:bg-red-900/20';
        case 'twitter':
            return 'bg-blue-50 dark:bg-blue-900/20';
        case 'linkedin':
            return 'bg-blue-50 dark:bg-blue-900/20';
        case 'facebook':
            return 'bg-blue-50 dark:bg-blue-900/20';
        case 'instagram':
            return 'bg-pink-50 dark:bg-pink-900/20';
        case 'repository':
        case 'github':
            return 'bg-gray-50 dark:bg-gray-900/20';
        case 'telegram':
            return 'bg-blue-50 dark:bg-blue-900/20';
        case 'discord':
            return 'bg-purple-50 dark:bg-purple-900/20';
        case 'documentation':
            return 'bg-green-50 dark:bg-green-900/20';
        case 'ideascale':
            return 'bg-orange-50 dark:bg-orange-900/20';
        case 'catalyst':
            return 'bg-purple-50 dark:bg-purple-900/20';
        default:
            return 'bg-gray-50 dark:bg-gray-900/20';
    }
}

function getIconColor(type: string): string {
    switch (type) {
        case 'youtube':
            return 'text-red-600 dark:text-red-400';
        case 'twitter':
            return 'text-blue-600 dark:text-blue-400';
        case 'linkedin':
            return 'text-blue-700 dark:text-blue-400';
        case 'facebook':
            return 'text-blue-600 dark:text-blue-400';
        case 'instagram':
            return 'text-pink-600 dark:text-pink-400';
        case 'repository':
        case 'github':
            return 'text-gray-700 dark:text-gray-300';
        case 'telegram':
            return 'text-blue-500 dark:text-blue-400';
        case 'discord':
            return 'text-purple-600 dark:text-purple-400';
        case 'documentation':
            return 'text-green-600 dark:text-green-400';
        case 'ideascale':
            return 'text-orange-600 dark:text-orange-400';
        case 'catalyst':
            return 'text-purple-600 dark:text-purple-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

function getStatusBadgeClasses(isValid: boolean): string {
    return isValid
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
}

function getModelTypeBadgeClasses(modelType: string): string {
    switch (modelType.toLowerCase()) {
        case 'proposal':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        case 'service':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        default:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
}

export default SingleLinkCard;