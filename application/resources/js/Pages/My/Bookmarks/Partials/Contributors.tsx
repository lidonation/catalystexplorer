import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Plus, RefreshCw, X } from 'lucide-react';
import UserData = App.DataTransferObjects.UserData;

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

interface ContributorsProps {
    owner?: UserData | null;
    contributors?: UserData[];
    pendingInvitations?: PendingInvitation[];
    bookmarkCollectionId?: string;
}

const Contributors = ({ owner, contributors = [], pendingInvitations = [], bookmarkCollectionId }: ContributorsProps) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;

    const getUserAvatar = (user: UserData) => {
        if (user && user.media && user.media.length > 0) {
            return user.media[0].original_url;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name ?? '')}&background=2563eb&color=ffffff`;
    };

    const renderUserCircle = (user: UserData, isOwner: boolean = false) => (
        <div key={user.id} className="flex flex-col items-start justify-start space-y-2">
            <div className="relative inline-flex justify-start">
                <img
                    src={getUserAvatar(user)}
                    alt={user.name ?? ''}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
                {isOwner && (
                    <div className="absolute -bottom-1 -right-3 bg-yellow-500 text-white text-xs rounded-full px-1 py-0.5 font-semibold">
                        {t('Owner')}
                    </div>
                )}
            </div>
            <div className="text-center">
                <Paragraph size='xs' className="text-xs font-medium truncate w-18" title={user.name ?? ''}>
                    {user.name}
                </Paragraph>
            </div>
        </div>
    );

    const renderPendingInvitation = (invitation: PendingInvitation) => {
        // Create a dummy avatar URL for pending invitations
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.user_name)}&background=f59e0b&color=ffffff`;
        
        return (
            <div key={invitation.user_id} className="flex flex-col items-start justify-start space-y-2 relative group">
                <div className="relative inline-flex justify-start">
                    <img
                        src={avatarUrl}
                        alt={invitation.user_name}
                        className="w-10 h-10 rounded-full border-2 border-yellow-300 opacity-70"
                    />
                    <div className="absolute -bottom-1 -right-3 bg-orange-500 text-white text-xs rounded-full px-1 py-0.5 font-semibold">
                        Pending
                    </div>
                </div>
                <div className="text-center">
                    <Paragraph size='xs' className="text-xs font-medium truncate w-18 text-gray-500" title={invitation.user_name}>
                        {invitation.user_name}
                    </Paragraph>
                    <Paragraph size='xs' className="text-xs text-orange-600">
                        Invited
                    </Paragraph>
                </div>
            </div>
        );
    };

    if (!owner && (!contributors || contributors.length === 0) && (!pendingInvitations || pendingInvitations.length === 0)) {
        return null;
    }

    return (
        <div className="space-y-4 p-3 bg-background-lighter">
            <ValueLabel className="text-content">
                {t('Contributors')}
            </ValueLabel>

            <div className="flex flex-wrap gap-1 items-start mt-1.5">
                {owner && renderUserCircle(owner, true)}

                {contributors.map((contributor) =>
                    contributor && renderUserCircle(contributor, false)
                )}

                {/* Render pending invitations */}
                {pendingInvitations?.map((invitation: PendingInvitation) =>
                    renderPendingInvitation(invitation)
                )}

                {bookmarkCollectionId && (
                    <div className="flex flex-col items-center justify-start space-y-2">
                        <PrimaryLink
                            href={localizedRoute('workflows.bookmarks.index', {
                                step: 4,
                                bookmarkCollection: bookmarkCollectionId,
                            })}
                            className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center bg-transparent hover:bg-blue-50"
                            title={t('addContributors')}
                        >
                            <Plus className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                        </PrimaryLink>
                        <div className="text-center">
                            <Paragraph size='xs' className="text-xs font-medium">
                                {t('Add')}
                            </Paragraph>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contributors;
