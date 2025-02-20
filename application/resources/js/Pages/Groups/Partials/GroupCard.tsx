import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from "@/Components/Card";
import Image from '@/Components/Image';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import GroupFundingPercentages from './GroupFundingPercentages';
import GroupSocials from './GroupSocials';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import UserQuickView from '@/Components/UserQuickView';
import ValueLabel from '@/Components/atoms/ValueLabel';
import KeyValue from '@/Components/atoms/KeyValue';
import { Link } from '@inertiajs/react';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupCardProps {
  group: GroupData;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { t } = useTranslation();
  const [userSelected, setUserSelected] = 
    useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

  const handleUserClick = useCallback(
    (user: App.DataTransferObjects.IdeascaleProfileData) => setUserSelected(user),
    []
  );
  
  const noAwardedFunds = !group?.amount_awarded_ada && !group?.amount_awarded_usd;
  const allAwardedFunds = !!(group?.amount_awarded_ada && group?.amount_awarded_usd);

  return (
    <Card>
      <section className="flex-grow">
        <div className="flex flex-col items-center w-full gap-4">
          <Image 
            size="30" 
            imageUrl={group?.profile_photo_url} 
          />
          <Link
            href={useLocalizedRoute('groups.group', {
              group: group?.slug,
            })}
            className="flex w-full justify-center"
          >
            <Title level="5">{group?.name}</Title>
          </Link>
        </div>

        <div className="px-2">
          {userSelected ? (
            <UserQuickView user={userSelected} />
          ) : (
            <>
              <div className="flex w-full items-center justify-between mt-4">
                <div>
                  <div className="text-primary bg-eye-logo flex w-[60px] items-center justify-center rounded-md border p-1">
                    <ValueLabel className="font-bold">
                      {group?.proposals_funded ?? 0}
                    </ValueLabel>
                    <span>/</span>
                    <ValueLabel className="text-xs">
                      {group?.proposals_count ?? 0}
                    </ValueLabel>
                  </div>
                  <Paragraph className="text-gray-persist mt-2 text-sm">
                    {t('groups.fundedProposals')}
                  </Paragraph>
                </div>

                <KeyValue
                  valueKey={t('groups.reviews')}
                  value={group?.reviews ?? 0}
                  className="text-right"
                />
              </div>

              <section className="mt-3">
                <div className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {(group?.amount_awarded_ada || noAwardedFunds) && (
                    <div>
                      <GroupFundingPercentages
                        amount={group?.amount_distributed_ada ?? 0}
                        total={group?.amount_awarded_ada ?? 0}
                        primaryBackgroundColor="bg-content-light"
                        secondaryBackgroundColor="bg-primary"
                        amount_currency="ADA"
                        isMini={true}
                        twoColumns={noAwardedFunds || allAwardedFunds}
                      />
                    </div>
                  )}
                  {(group?.amount_awarded_usd || noAwardedFunds) && (
                    <GroupFundingPercentages
                      amount={group?.amount_distributed_usd ?? 0}
                      total={group?.amount_awarded_usd ?? 0}
                      primaryBackgroundColor="bg-content-light"
                      secondaryBackgroundColor="bg-primary-dark"
                      amount_currency="USD"
                      isMini={true}
                      twoColumns={noAwardedFunds || allAwardedFunds}
                    />
                  )}
                </div>
              </section>

              {group?.bio && (
                <div className="relative mt-4">
                  <Paragraph className="text-gray-700">{group.bio}</Paragraph>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mt-auto pt-4">
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Title level="4" className="font-medium">
                {t('teams')}
              </Title>
              {group?.ideascale_profiles && group?.ideascale_profiles.length > 0 && (
                <IdeascaleProfileUsers
                  users={group?.ideascale_profiles}
                  onUserClick={handleUserClick}
                  className="bg-content-light"
                  toolTipProps={t('groups.viewMembers')}
                />
              )}
            </div>
            <GroupSocials group={group} />
          </div>
        </div>
      </section>
    </Card>
  );
};

export default GroupCard;