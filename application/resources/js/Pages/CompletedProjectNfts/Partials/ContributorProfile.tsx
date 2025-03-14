import Title from "@/Components/atoms/Title";
import Paragraph from "@/Components/atoms/Paragraph";
import { useTranslation } from "react-i18next";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import XIcon from "@/Components/svgs/XIcon";
import LinkedInIcon from "@/Components/svgs/LinkedInIcons";
import DiscordIcon from "@/Components/svgs/DiscordIcon";
import Image from "@/Components/Image";
import { useEffect, useState } from "react";

interface ContributorProfileProps {
  ideascaleProfiles?: IdeascaleProfileData[];
  author: IdeascaleProfileData;
}

const ContributorProfile = ({ ideascaleProfiles, author }: ContributorProfileProps) => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<IdeascaleProfileData[]>([]);
  
  useEffect(() => {
    if (!ideascaleProfiles) {
      setProfiles([]);
      return;
    }
    
    if (!Array.isArray(ideascaleProfiles) && typeof ideascaleProfiles === 'object') {
      setProfiles(Object.values(ideascaleProfiles));
    } else if (Array.isArray(ideascaleProfiles)) {
      setProfiles(ideascaleProfiles);
    }
  }, [ideascaleProfiles]);
  
  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-background rounded-lg p-6">
        <div className="text-center py-8">
          <Title level="3" className="font-semibold mb-2">{t('noContributors')}</Title>
          <Paragraph className="text-dark">{t('noContributorsAvailable')}</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4 border-b border-dark pb-4">
          <div className="flex gap-4">
            <Image
              src={author.hero_img_url}
              alt={author.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <Title level="2" className="text-content font-semibold">{author.name}</Title>
              <Paragraph className="text-dark">{author.title}</Paragraph>
              
              {/* Social links */}
              <div className="flex gap-2 mt-2">
                {author.twitter && (
                  <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                      <XIcon/>
                  </a>
                )}
                
                {author.discord && (
                  <a href={`https://discord.com/users/${author.discord}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                      <DiscordIcon/>
                  </a>
                )}
                
                {author.linkedin && (
                  <a href={`https://linkedin.com/in/${author.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                      <LinkedInIcon/>
                  </a>
                )}
              </div>
            </div>
          </div>
          <span className="bg-success-light border-2 text-success px-3 py-1 rounded-full text-sm">
            {t('minting')}
          </span>
        </div>

        <div className="space-y-4 text-content">
          <Paragraph>{typeof author.bio === 'string' ? author.bio : ''}</Paragraph>
        </div>
      </div>

      {profiles.length > 0 && (
        <div>
          <Title level="3" className="text-content font-semibold mb-4">{t('otherContributors')}</Title>
          <div className="border-t border-dark pt-5">
            <div className="flex flex-wrap gap-8">
              {profiles.map((profile, index) => (
                <div key={profile.hash || index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Image
                      src={profile.hero_img_url}
                      alt={profile.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-success"
                    />
                  </div>
                  <span className="font-medium block">{profile.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorProfile;
