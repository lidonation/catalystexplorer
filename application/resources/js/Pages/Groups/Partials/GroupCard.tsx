import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;
import Card from "@/Components/Card";

interface GroupCardProps {
  group: GroupData;
}

const CampaignCard: React.FC<GroupCardProps> = ({ group }) => {
  const { t } = useTranslation();

  const heroImageUrl = group?.hero_img_url;

  return (
    <Card>
      <div className="pt-6">
        <p className="text-content-dark opacity-80 mb-4 line-clamp-3">
          {group?.bio}
        </p>

          <div className='flex flex-col gap-2'>
              <div>
                  Total Requested (Ada + USD) <br/>
                  {group?.amount_requested_ada} + {group?.amount_requested_usd}
              </div>

              <div>
                  Completed / Funded / Unfunded
                  <br/>
                  {group?.proposals_completed} / {group?.proposals_funded} / {group?.proposals_unfunded},
              </div>

              <div>
                  Received VS Awarded Ada <br />
              {group?.amount_distributed_ada} / {group?.amount_awarded_ada}
              </div>

              <div>
                  Received VS Awarded USD <br />
              {group?.amount_distributed_usd} / {group?.amount_awarded_usd}
              </div>

          </div>

        <div className="flex gap-2">
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.proposals')}: {group?.proposals_count ?? 0}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;
