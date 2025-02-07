import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MetaData = () => {
  const { t } = useTranslation();
  const [metadata] = useState({
    campaignName: 'jasontt@studio.co',
    fundedProjectNumber: '700035',
    projectTitle: 'Token 2049 Side Event: Enterprise-Focused RWA',
    yesVotes: '106M',
    noVotes: '3M',
    role: 'Author'
  });

  const [struckFields, setStruckFields] = useState<Record<string, boolean>>({});

  const handleToggleStrike = (field: string) => {
    setStruckFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="bg-background rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-6">{t('chooseMetaData')}</h4>

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-gray-500 text-sm leading-relaxed">
              {t('projectCatalyst')}
            </div>
            <div className="text-sm">{metadata.campaignName}</div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-gray-500 text-sm leading-relaxed">
              {t('fundProject')}
            </div>
            <div className="text-sm">{metadata.fundedProjectNumber}</div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-gray-500 text-sm">{t('projectTitle')}</div>
            <div className="text-sm">{metadata.projectTitle}</div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-gray-500 text-sm">{t('yesVotes')}</div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${struckFields.yesVotes ? 'line-through text-gray-400' : ''}`}>
                {metadata.yesVotes}
              </span>
              <button
                onClick={() => handleToggleStrike('yesVotes')}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-gray-500 text-sm">{t('noVotes')}</div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${struckFields.noVotes ? 'line-through text-gray-400' : ''}`}>
                {metadata.noVotes}
              </span>
              <button
                onClick={() => handleToggleStrike('noVotes')}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-gray-500 text-sm">{t('role')}</div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${struckFields.role ? 'line-through text-gray-400' : ''}`}>
                {metadata.role}
              </span>
              <button
                onClick={() => handleToggleStrike('role')}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <p className="text-xs text-gray-500 italic text-center max-w-lg">
          {t('metaDataInstruction')}
        </p>
      </div>
    </div>
  );
};

export default MetaData;
