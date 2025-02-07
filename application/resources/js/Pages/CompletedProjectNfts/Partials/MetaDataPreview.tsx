import IdeascaleLogo from "@/assets/images/ideascale-logo.png";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const MetaDataPreview = () => {
  const { t } = useTranslation();
  const [metadata] = useState({
      name: 'Preston Odep',
      role: 'Artist',
    });

  return (
    <div className="bg-background rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-l-content pb-4">
        <h2 className="text-xl font-semibold">{t('metaTitle')}</h2>
        <div className="flex items-center gap-2">
          <button className="bg-emerald-500 text-content-light px-4 py-2 rounded-md hover:bg-emerald-600">
            {t('mintNFT')}
          </button>
          <button className="text-content-light hover:text-gray-600">
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex">
          <div className="w-16 h-16 rounded-full bg-background overflow-hidden ">
            <img src={IdeascaleLogo} alt="Preston Odep" className="w-full h-full object-cover" />
          </div>
          <div className="ml-5">
            <h3 className="font-medium">{metadata.name}</h3>
            <p className="text-sm text-gray-500">{metadata.role}</p>
          </div>
        </div>
        <div>
        <button className="text-content hover:text-gray-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        </div>
      </div>
    </div>
  );
};

export default MetaDataPreview;
