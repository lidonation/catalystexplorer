import React from 'react';
import GroupCardMini from './GroupCardMini';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupListProps {
    groups: GroupData[];
}

const GroupList: React.FC<GroupListProps> = ({
    groups,
}) => {
    return (
        <>
            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups?.map((group, index) => (
                    <li key={index}>
                        <GroupCardMini group={group}/>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default GroupList;
