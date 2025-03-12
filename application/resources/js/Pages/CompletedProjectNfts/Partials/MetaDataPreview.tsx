import Title from "@/Components/atoms/Title";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import UserData = App.DataTransferObjects.UserData;
import NMKRNftData = App.DataTransferObjects.NMKRNftData;
import { PaginatedData } from '../../../../types/paginated-data';
import { useTranslation } from "react-i18next";
import MintButton from "./MintButton";
import Image from "@/Components/Image";
import Paragraph from "@/Components/atoms/Paragraph";
import Button from "@/Components/atoms/Button";

interface MetaDataPreviewProps {
  ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
  artist?: UserData | null;
  nft: any & { 
    metas?: Array<{
      key: string;
      content: string;
    }>;
    minted_at?: string | null;
  };
}

const MetaDataPreview = ({ideascaleProfiles, nft, artist}: MetaDataPreviewProps) => {
  const { t } = useTranslation();
  const artistImageUrl = artist?.hero_img_url || '';

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-l-content pb-4">
        <Title level="2" className="text-content text-xl font-semibold">{t('metaTitle')}</Title>
        <div className="flex items-center gap-2">
          <MintButton ideascaleProfiles={ideascaleProfiles} nft={nft}/>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex">
          <div className="w-16 h-16 rounded-full bg-background overflow-hidden ">
            <Image src={artistImageUrl} alt={artist?.name} className="text-content w-full h-full object-cover" />
          </div>
          <div className="ml-5">
            <Title level="3" className="font-medium">
              {artist?.name}
            </Title>
            <Paragraph className="text-sm text-dark">Artist</Paragraph>
          </div>
        </div>
        <div>
        <Button className="text-content hover:text-dark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
        </div>
      </div>
    </div>
  );
};

export default MetaDataPreview;
