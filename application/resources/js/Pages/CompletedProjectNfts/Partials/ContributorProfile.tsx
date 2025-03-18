import Title from "@/Components/atoms/Title";
import Paragraph from "@/Components/atoms/Paragraph";
import { useTranslation } from "react-i18next";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import XIcon from "@/Components/svgs/XIcon";
import LinkedInIcon from "@/Components/svgs/LinkedInIcons";
import DiscordIcon from "@/Components/svgs/DiscordIcon";
import Image from "@/Components/Image";

interface ContributorProfileProps {
  contributorProfiles: IdeascaleProfileData[];
  author: IdeascaleProfileData;
  isOwner: boolean;
}

const ContributorProfile = ({ contributorProfiles, author, isOwner }: ContributorProfileProps) => {
  const { t } = useTranslation();
  
  // If no contributors provided or empty array, use a placeholder
  if (!contributorProfiles || contributorProfiles.length === 0) {
    return (
      <div className="bg-background rounded-lg p-6">
        <div className="text-center py-8">
          <Title level="3" className="font-semibold mb-2">{t('unavailable')}</Title>
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
              imageUrl={author.hero_img_url}
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
          {isOwner && (
            <span className="bg-success-light border-2 text-success px-3 py-1 rounded-full text-sm">
              {t('minting')}
            </span>
          )}
        </div>

        <div className="space-y-4 text-content">
          <Paragraph>{typeof author.bio === 'string' ? author.bio : ''}</Paragraph>
        </div>
      </div>

      {contributorProfiles.length > 0 && (
        <div>
          <Title level="3" className="text-content font-semibold mb-4">{t('otherContributors')}</Title>
          <div className="border-t border-dark pt-5">
            <div className="flex flex-wrap gap-8 justify-start">
              {contributorProfiles.map((contributor, index) => {
                // Ensure a unique key by combining id and index as fallback
                const uniqueKey = contributor.hash ? `contributor-${contributor.hash}-${index}` : `contributor-index-${index}`;
                
                return (
                  <div 
                    key={uniqueKey} 
                    className="text-center flex-1 min-w-[120px] max-w-[200px]"
                  >
                    <div className="flex justify-center mb-2">
                      <Image
                        imageUrl={contributor.hero_img_url}
                        alt={contributor.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-success"
                      />
                    </div>
                    <span className="font-medium block">{contributor.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorProfile;
