import LinkIcon from './svgs/LinkIcon';
import { useTranslation } from 'react-i18next';
import IdeaScaleLogo from '../assets/images/ideascale-logo.png';

interface ProposalUserQuickViewProps {
    user: App.DataTransferObjects.IdeascaleProfileData;
}

const UserQuickView: React.FC<ProposalUserQuickViewProps> = ({ user }) => {
    const { t } = useTranslation();

    return (

        <div className="space-y-4 p-4">
            {/* Lido Profile Section */}
            <div className="flex items-start space-x-2" data-testid="user-quick-view-lido">
                <LinkIcon />
                <div>
                    <span className="block font-medium">Lido  {t('users.profile')}</span>
                    <a
                        href={`https://www.lidonation.com/en/project-catalyst/users/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary block text-sm font-bold"
                        data-testid="user-quick-view-lido-link"
                    >
                        {t('users.viewProfile')}
                    </a>
                </div>
            </div>

            <div className="border-b"></div>

            <div className="flex items-start space-x-2" data-testid="user-quick-view-ideascale">
                <img
                    src={IdeaScaleLogo}
                    alt="IdeaScale Logo"
                    className="mt-0.5 h-6 w-6 rounded-full"
                    data-testid="user-quick-view-ideascale-logo"
                />
                <div>
                    <span className="block font-medium">Ideascale {t('users.profile')}</span>
                    <a
                        href={`https://cardano.ideascale.com/c/profile/${user.ideascaleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary block text-sm font-bold"
                        data-testid="user-quick-view-ideascale-link"
                    >
                        {t('users.viewIdeascale')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default UserQuickView;


