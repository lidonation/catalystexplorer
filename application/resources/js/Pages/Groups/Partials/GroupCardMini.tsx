import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import FundingPercentages from '@/Components/FundingPercentages';
import Image from '@/Components/Image';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React, { useCallback, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import GroupSocials from './GroupSocials';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupCardMiniProps {
    group: GroupData;
}

const GroupCardMini: React.FC<GroupCardMiniProps> = ({ group }) => {
    const { t } = useLaravelReactI18n();

    return (
        group && (
            <Card className=" flex flex-col">
                <div className="flex w-full flex-col items-center gap-4">
                    <div className="flex w-full flex-col items-center gap-4 pt-2">
                        <Image
                            size="16"
                            imageUrl={group?.hero_img_url}
                            className="border-darker h-16 w-16 rounded-full border-3"
                        />
                    </div>
                    <Link
                        href={useLocalizedRoute('groups.group.proposals', {
                            group: group?.slug,
                        })}
                        className="flex w-full justify-center"
                    >
                        <Title level="5">{group?.name}</Title>
                    </Link>
                </div>
                <div className="flex w-full items-center justify-between">
                    <div>
                        <div className="text-primary bg-eye-logo mt-2 flex w-[60px] items-center justify-center rounded-md border p-1">
                            <div className="text-3 font-bold">
                                {group?.proposals_funded ?? 0}
                            </div>
                            <div>/</div>
                            <div className="text-xs">
                                {group?.proposals_count ?? 0}
                            </div>
                        </div>
                        <p className="text-gray-persist mt-2">
                            {t('groups.fundedProposals')}
                        </p>
                    </div>

                    <div>
                        <p className="text-1 font-bold">
                            {group?.reviews_count ?? 0}
                        </p>
                        <p className="text-3 text-gray-persist mt-2">
                            {t('groups.reviews')}
                        </p>
                    </div>
                </div>
            </Card>
        )
    );
};

export default GroupCardMini;
