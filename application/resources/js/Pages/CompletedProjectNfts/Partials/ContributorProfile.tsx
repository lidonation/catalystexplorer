import IdeascaleLogo from "@/assets/images/ideascale-logo.png";
import Title from "@/Components/atoms/Title";
import { useTranslation } from "react-i18next";

const ContributorProfile = () => {
  const { t } = useTranslation();
  const mainContributor = {
    name: "Preston Odep",
    organization: "Lido Nation Foundation",
    avatar: IdeascaleLogo,
    bio: "Preston - is a creative professional with a strong passion for exploring various forms of self-expression which has fast-tracked his journey into a successful career in product design. Over the past 7 years, he has had the opportunity to collaborate with a variety of top-tier companies, from startups and growing businesses to industry-leading unicorns, crafting solutions for complex challenges alongside exceptional teams.",
    interests: "Outside design, he is a major football fan, believing that Manchester United is the best team ever and Messi being the G.O.A.T.",
    status: "You're Minting"
  };

  const otherContributors = [
    {
      name: "Phuffy King",
      avatar: IdeascaleLogo,
      isVerified: true
    }
  ];

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
          <div className="flex gap-4">
            <img
              src={mainContributor.avatar}
              alt={mainContributor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <Title level="2" className="font-semibold">{mainContributor.name}</Title>
              <p className="text-gray-500">{mainContributor.organization}</p>
              <div className="flex gap-2 mt-2">
                <a href="#" className="hover:opacity-80">
                  <div className="bg-black text-white rounded p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </a>
                <a href="#" className="hover:opacity-80">
                  <div className="bg-blue-600 text-white rounded p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm">
            {mainContributor.status}
          </span>
        </div>

        <div className="space-y-4 text-content">
          <p>{mainContributor.bio}</p>
          <p>{mainContributor.interests}</p>
        </div>
      </div>

      <div>
        <Title level="3" className="font-semibold mb-4">{t('otherContributors')}</Title>
        <div className="space-y-4 border-t border-gray-200 pb-4">
          {otherContributors.map((contributor, index) => (
            <div key={index} className="flex items-center gap-3 pt-5">
              <img
                src={contributor.avatar}
                alt={contributor.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-green-500"
              />
              <div className="flex items-center">
                <span className="font-medium">{contributor.name}</span>
                {contributor.isVerified && (
                  <svg 
                    className="w-4 h-4 ml-1 text-green-500" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributorProfile;
