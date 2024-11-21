import LinkIcon from './svgs/LinkIcon';
import { useTranslation } from 'react-i18next';
import IdeaScaleLogo from '../assets/images/ideascale-logo.png';

interface ProposalUserQuickViewProps {
    user: App.DataTransferObjects.IdeascaleProfileData;
}

const UserQuickView: React.FC<ProposalUserQuickViewProps> = ({ user }) => {
    const { t } = useTranslation();

    return (

        <div className="p-4 space-y-4">
            {/* Lido Profile Section */}
            <div className="flex items-start space-x-2">
                <LinkIcon />
                <div>
                    <span className="block text-sm font-medium">Lido Profile</span>
                    <a
                        href={`https://www.lidonation.com/en/project-catalyst/users/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary text-sm font-bold"
                    >
                        {t('userDetails.viewProfile')}
                    </a>
                </div>
            </div>

            <div className="border-b"></div>

            <div className="flex items-start space-x-2">
                <img
                    src={IdeaScaleLogo}
                    alt="IdeaScale Logo"
                    className="w-6 h-6 mt-0.5"
                />
                <div>
                    <span className="block font-medium">Ideascale Profile</span>
                    <a
                        href={`https://cardano.ideascale.com/c/profile/${user.ideascaleId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary text-sm"
                    >
                        {t('userDetails.ideascaleInfo')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default UserQuickView;


