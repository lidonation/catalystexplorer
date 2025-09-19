import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SecondaryButton from '@/Components/atoms/SecondaryButton';
import TextInput from '@/Components/atoms/TextInput';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight, Plus, Search, X, RefreshCw } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import Paragraph from '@/Components/atoms/Paragraph.tsx';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import UserData = App.DataTransferObjects.UserData;

interface User {
    id: string;
    name: string;
    email?: string; // Only returned for current user's own profile
    media?: Array<{
        id: string;
        original_url: string;
        name: string;
    }>;
}

interface PendingInvitation {
    user_id: string;
    user_email: string;
    user_name: string;
    inviter_id: string;
    inviter_name: string;
    token: string;
    invited_at: string;
    status: string;
    resent_at?: string;
}

interface Step4Props {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkCollection: BookmarkCollectionData;
    owner: UserData;
    pendingInvitations?: PendingInvitation[];
}

const Step4: React.FC<Step4Props> = ({
    stepDetails,
    activeStep,
    bookmarkCollection,
    owner,
    pendingInvitations = [],
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [loadingActions, setLoadingActions] = useState<{ [key: string]: 'resend' | 'cancel' | null }>({});
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Note: Using router.post directly instead of useForm for more reliable data transmission

    const prevStep = localizedRoute('workflows.bookmarks.index', {
        step: activeStep - 1,
        bookmarkCollection: bookmarkCollection.id,
    });

    const nextStep = localizedRoute('workflows.bookmarks.index', {
        step: activeStep + 1,
        bookmarkCollection: bookmarkCollection.id,
    });

    const searchUsersUrl = localizedRoute('workflows.bookmarks.searchUsers');
    const inviteContributorUrl = localizedRoute('workflows.bookmarks.inviteContributor', {
        bookmarkCollection: bookmarkCollection.id,
    });
    const removeContributorUrl = localizedRoute('workflows.bookmarks.removeContributor', {
        bookmarkCollection: bookmarkCollection.id,
    });
    const cancelInvitationUrl = localizedRoute('workflows.bookmarks.cancelInvitation', {
        bookmarkCollection: bookmarkCollection.id,
    });
    const resendInvitationUrl = localizedRoute('workflows.bookmarks.resendInvitation', {
        bookmarkCollection: bookmarkCollection.id,
    });

    // Search for users with debouncing
    // Note: We filter out users with invalid IDs (empty, null, or "0") since they fail backend validation
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `${searchUsersUrl}?query=${encodeURIComponent(searchQuery)}`
                );
                const users = await response.json();
                setSearchResults(users.filter((user: User) =>
                    // Filter out users with invalid IDs (empty, null, or "0")
                    user.id && user.id !== '' && user.id !== '0' &&
                    user.id !== owner.id &&
                    !bookmarkCollection?.collaborators?.some((contributor: UserData) => contributor.id === user.id) &&
                    !pendingInvitations?.some((invitation: PendingInvitation) => invitation.user_id === user.id)
                ));
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, searchUsersUrl, owner.id, bookmarkCollection?.collaborators, pendingInvitations]);

    const handleInviteContributor = (userId: string) => {
        if (!userId || userId === '' || userId === '0') {
            console.error('Cannot invite user: Invalid user ID', userId);
            return;
        }

        console.log('Inviting user with ID:', userId);

        router.post(
            inviteContributorUrl,
            { user_id: userId },
            {
                onSuccess: () => {
                    console.log('Successfully invited user');
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowInviteForm(false);
                },
                onError: (errors) => {
                    console.error('Failed to invite contributor:', errors);
                },
            }
        );
    };

    const handleRemoveContributor = (userId: string) => {
        // Validate that userId is not empty, null, or "0" (invalid database ID)
        if (!userId || userId === '' || userId === '0') {
            console.error('Cannot remove user: Invalid user ID', userId);
            return;
        }

        console.log('Removing user with ID:', userId);

        // Use router.post directly to ensure data is sent correctly
        router.post(
            removeContributorUrl,
            { user_id: userId },
            {
                onSuccess: () => {
                    console.log('Successfully removed user');
                },
                onError: (errors) => {
                    console.error('Failed to remove contributor:', errors);
                },
            }
        );
    };

    const handleCancelInvitation = (userId: string) => {
        if (!userId || userId === '' || userId === '0') {
            console.error('Cannot cancel invitation: Invalid user ID', userId);
            return;
        }

        setLoadingActions(prev => ({ ...prev, [userId]: 'cancel' }));

        router.post(
            cancelInvitationUrl,
            { user_id: userId },
            {
                onSuccess: () => {
                    console.log('Successfully cancelled invitation');
                    setLoadingActions(prev => ({ ...prev, [userId]: null }));
                },
                onError: (errors) => {
                    console.error('Failed to cancel invitation:', errors);
                    setLoadingActions(prev => ({ ...prev, [userId]: null }));
                },
            }
        );
    };

    const handleResendInvitation = (userId: string) => {
        if (!userId || userId === '' || userId === '0') {
            console.error('Cannot resend invitation: Invalid user ID', userId);
            return;
        }

        setLoadingActions(prev => ({ ...prev, [userId]: 'resend' }));

        router.post(
            resendInvitationUrl,
            { user_id: userId },
            {
                onSuccess: () => {
                    console.log('Successfully resent invitation');
                    setLoadingActions(prev => ({ ...prev, [userId]: null }));
                },
                onError: (errors) => {
                    console.error('Failed to resend invitation:', errors);
                    setLoadingActions(prev => ({ ...prev, [userId]: null }));
                },
            }
        );
    };

    const getUserAvatar = (user: UserData) => {
        if (user.media && user.media.length > 0) {
            return user.media[0].original_url;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? '')}&background=2563eb&color=ffffff`;
    };

    const renderUserCircle = (user: UserData, isOwner: boolean = false, onRemove?: () => void) => (
        <div key={user.id} className="relative group">
            <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                    <img
                        src={getUserAvatar(user)}
                        alt={user.name ?? ''}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
                    />
                    {isOwner && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
                            {t('Owner')}
                        </div>
                    )}
                    {!isOwner && onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={t('removeContributor')}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="text-center">
                    <Paragraph className="text-sm font-medium truncate w-16" title={user.name ?? ''}>
                        {user.name}
                    </Paragraph>
                </div>
            </div>
        </div>
    );

    const renderPendingInvitation = (invitation: PendingInvitation) => {
        // Create a dummy avatar URL for pending invitations
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.user_name)}&background=f59e0b&color=ffffff`;
        
        return (
            <div key={invitation.user_id} className="relative group">
                <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt={invitation.user_name}
                            className="w-12 h-12 rounded-full border-2 border-yellow-300 opacity-70"
                        />
                        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold">
                            Pending
                        </div>
                        
                        {/* Action buttons on hover */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button
                                onClick={() => handleResendInvitation(invitation.user_id)}
                                disabled={loadingActions[invitation.user_id] === 'resend'}
                                className={`text-white rounded-full p-1 text-xs transition-colors ${
                                    loadingActions[invitation.user_id] === 'resend' 
                                        ? 'bg-blue-300 cursor-not-allowed' 
                                        : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                                title="Resend invitation"
                            >
                                <RefreshCw className={`w-3 h-3 ${
                                    loadingActions[invitation.user_id] === 'resend' ? 'animate-spin' : ''
                                }`} />
                            </button>
                            <button
                                onClick={() => handleCancelInvitation(invitation.user_id)}
                                disabled={loadingActions[invitation.user_id] === 'cancel'}
                                className={`text-white rounded-full p-1 text-xs transition-colors ${
                                    loadingActions[invitation.user_id] === 'cancel' 
                                        ? 'bg-red-300 cursor-not-allowed' 
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                                title="Cancel invitation"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <div className="text-center">
                        <Paragraph className="text-sm font-medium truncate w-16 text-gray-500" title={invitation.user_name}>
                            {invitation.user_name}
                        </Paragraph>
                        <Paragraph className="text-xs text-orange-600">
                            Invited
                        </Paragraph>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <WorkflowLayout
            title="Create Bookmark"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex h-full items-center justify-center px-8 py-12">
                    <div className="bg-background border-border-color mx-6 w-full max-w-4xl space-y-8 rounded-lg border p-6 shadow-sm lg:p-8">
                       

                        <div>
                            <h2 className="text-content title-2 font-semibold">
                                {t('Contributors')}
                            </h2>
                            <Paragraph className="">
                                {t('addContributorsWhoCanHelp')}
                            </Paragraph>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3 items-start">
                                {renderUserCircle(owner, true)}

                                {bookmarkCollection?.collaborators.map((contributor: UserData) =>
                                    renderUserCircle(contributor, false, () => {
                                            if (!contributor.id || contributor.id === '' || contributor.id === '0') {
                                                console.warn('Cannot remove contributor: Invalid ID', contributor.id);
                                                return;
                                            }
                                            handleRemoveContributor(contributor.id);
                                        }
                                    )
                                )}

                                {/* Render pending invitations */}
                                {pendingInvitations?.map((invitation: PendingInvitation) =>
                                    renderPendingInvitation(invitation)
                                )}

                                <div className="flex flex-col items-center space-y-2">
                                    <button
                                        onClick={() => setShowInviteForm(!showInviteForm)}
                                        className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center"
                                        title={t('inviteContributor')}
                                    >
                                        <Plus className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                                    </button>
                                    <Paragraph className="text-sm text-gray-500">
                                        {t('invite')}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>

                        {/* Invite Form */}
                        {showInviteForm && (
                            <div className="bg-background-lighter rounded-lg p-6 space-y-4">
                                <ValueLabel className="text-content">
                                    {t('searchForContributors')}
                                </ValueLabel>

                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                        <TextInput
                                            type="text"
                                            placeholder={t('searchByNameOrEmail')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-full"
                                        />
                                    </div>

                                    {/* Search Results */}
                                    {(searchResults.length > 0 || isSearching) && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    {t('searching')}
                                                </div>
                                            ) : (
                                                searchResults.map((user: UserData) => (
                                                    <div
                                                        key={user.id}
                                                        className="p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <img
                                                                src={getUserAvatar(user)}
                                                                alt={user.name ?? ''}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                            <div>
                                                                <Paragraph className="font-medium text-gray-900">
                                                                    {user.name ?? ''}
                                                                </Paragraph>
                                                            </div>
                                                        </div>
                                                        <SecondaryButton
                                                            onClick={() => user.id && handleInviteContributor(user.id)}
                                                            disabled={!user.id || user.id === '' || user.id === '0'}
                                                            className="text-sm px-3 py-1"
                                                            title={(!user.id || user.id === '' || user.id === '0') ? 'Cannot invite user with invalid ID' : undefined}
                                                        >
                                                            {t('invite')}
                                                        </SecondaryButton>
                                                    </div>
                                                ))
                                            )}

                                            {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                                                <div className="p-4 text-center text-gray-500">
                                                    {t('noUsersFound')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <SecondaryButton
                                        onClick={() => setShowInviteForm(false)}
                                        className="text-sm"
                                    >
                                        {t('Cancel')}
                                    </SecondaryButton>
                                </div>
                            </div>
                        )}

                        {/* Error handling is now done through router.post onError callback */}
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step4;
