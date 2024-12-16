import UserAvatar from '@/Components/UserAvatar';
import { useTranslation } from 'react-i18next';

interface PeopleProps {
    profilePhotoUrl: any;
    name: string | undefined;
    ownProposals: number;
    coProposals: number;
}

const PeopleCard: React.FC<PeopleProps> = ({
    profilePhotoUrl,
    name,
    ownProposals,
    coProposals,
}) => {
    const { t } = useTranslation();
    return (
        <div className="w-full space-y-4 rounded-md bg-background p-4 shadow-sm">
            <div className='w-full'>
            <div>
                <UserAvatar imageUrl={profilePhotoUrl} size='size-12'/>
            </div>
            <p className="text-2 font-bold mt-2">{name}</p>
            </div>
            <div className="border-t-2 border-border-secondary">
                <div className="flex w-full justify-between pt-2 pb-4">
                    <p className="text-4 text-content opacity-70">{t('people.ownProposals')}</p>
                    <p className="text-3 font-semibold">{ownProposals}</p>
                </div>
                <div className="flex w-full justify-between">
                    <p className="text-4 text-content opacity-70">{t('people.coProposals')}</p>
                    <p className="text-3 font-semibold">{coProposals}</p>
                </div>
            </div>
        </div>
    );
};

export default PeopleCard;
