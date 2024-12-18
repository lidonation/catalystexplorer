import React from 'react';
import IdeascaleProfileCard from './IdeascaleProfileCard';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesListProps {
    ideascaleProfiles: IdeascaleProfileData[];
}

const IdeascaleProfilesList: React.FC<IdeascaleProfilesListProps> = ({
    ideascaleProfiles,
}) => {
    return (
        <>
            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {ideascaleProfiles.map((ideascaleProfile, index) => (
                    <li key={index}>
                        <IdeascaleProfileCard
                            ideascaleProfile={ideascaleProfile}
                        />
                    </li>
                ))}
            </ul>
        </>
    );
};

export default IdeascaleProfilesList;
