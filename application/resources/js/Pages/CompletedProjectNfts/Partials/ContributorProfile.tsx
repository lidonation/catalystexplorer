import Title from "@/Components/atoms/Title";
import Paragraph from "@/Components/atoms/Paragraph";
import { useTranslation } from "react-i18next";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import XIcon from "@/Components/svgs/XIcon";
import LinkedInIcon from "@/Components/svgs/LinkedInIcons";
import DiscordIcon from "@/Components/svgs/DiscordIcon";
import Image from "@/Components/Image";

interface ContributorProfileProps {
  contributorProfiles?: IdeascaleProfileData[];
}

const ContributorProfile = ({ contributorProfiles = [] }: ContributorProfileProps) => {
  const { t } = useTranslation();
  
  // If no contributors provided or empty array, use a placeholder
  if (!contributorProfiles || contributorProfiles.length === 0) {
    return (
      <div className="bg-background rounded-lg p-6">
        <div className="text-center py-8">
          <Title level="3" className="font-semibold mb-2">{t('noContributors')}</Title>
          <Paragraph className="text-dark">{t('noContributorsAvailable')}</Paragraph>
        </div>
      </div>
    );
  }

  // Main contributor is the first one
  const mainContributor = contributorProfiles[0];
  
  // Other contributors are the rest
  const otherContributors = contributorProfiles.slice(1);

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4 border-b border-dark pb-4">
          <div className="flex gap-4">
            <Image
              src={mainContributor.hero_img_url}
              alt={mainContributor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <Title level="2" className="text-content font-semibold">{mainContributor.name}</Title>
              <Paragraph className="text-dark">{mainContributor.title}</Paragraph>
              
              {/* Social links */}
              <div className="flex gap-2 mt-2">
                {mainContributor.twitter && (
                  <a href={`https://twitter.com/${mainContributor.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                      <XIcon/>
                  </a>
                )}
                
                {mainContributor.discord && (
                  <a href={`https://discord.com/users/${mainContributor.discord}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                      <DiscordIcon/>
                  </a>
                )}
                
                {mainContributor.linkedin && (
                  <a href={`https://linkedin.com/in/${mainContributor.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
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
          <Paragraph>{typeof mainContributor.bio === 'string' ? mainContributor.bio : ''}</Paragraph>
        </div>
      </div>

      {otherContributors.length > 0 && (
        <div>
          <Title level="3" className=" text-content font-semibold mb-4">{t('otherContributors')}</Title>
          <div className="border-t border-dark pt-5">
            <div className="flex flex-wrap gap-8">
              {otherContributors.map((contributor, index) => (
                <div key={contributor.hash || index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Image
                      src={contributor.hero_img_url}
                      alt={contributor.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-success"
                    />
                  </div>
                  <span className="font-medium block">{contributor.name}</span>
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
