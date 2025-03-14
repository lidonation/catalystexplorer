import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';

interface MetaDataProps {
  nft: any & { 
    id?: number;
    policy?: string; 
    metas?: Array<{
      key: string;
      content: string;
    }>;
  }
}

const MetaData = ({ nft }: MetaDataProps) => {
  const { t } = useTranslation();
  const [struckFields, setStruckFields] = useState<Record<string, boolean>>({});
  const [metaValues, setMetaValues] = useState<Record<string, string>>({
    campaignName: '',
    projectNumber: '',
    projectTitle: '',
    yesVotes: '',
    noVotes: '',
    role: ''
  });
  
  // Route generation
  const localizedUpdateRoute = nft?.id 
    ? useLocalizedRoute('crud.nfts.update', { nft: nft.id })
    : null;

  // Format numbers with k, M, etc.
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  // Extract metadata values from NFT and determine which fields are already struck
  useEffect(() => {
    const extractMetadata = () => {
      try {
        // Find nmkr_metadata in nft.metas array
        const nmkrMetadata = nft?.metas?.find((meta: { key: string; }) => meta.key === 'nmkr_metadata');
        
        if (nmkrMetadata && nmkrMetadata.content) {
          
          // Parse metadata content safely
          let metadata;
          metadata = JSON.parse(nmkrMetadata.content);
          
          // Look for metadata in different possible locations
          let nftData: any = null;
          let policyKey = '';
          let nftKey = '';

          // Try policy keys
          if (metadata['721']) {
            const policyKeys = Object.keys(metadata['721'] || {});
            
            for (const policy of policyKeys) {
              policyKey = policy;
              const nftKeys = Object.keys(metadata['721'][policy]);
              
              if (nftKeys.length > 0) {
                nftKey = nftKeys[0];
                nftData = metadata['721'][policy][nftKeys[0]];
                break;
              }
            }
          }

          if (nftData) {
            
            const allKnownValues = {
              campaignName: nftData.projectCatalystCampaignName || '',
              projectNumber: nftData.fundedProjectNumber || '',
              projectTitle: nftData.projectTitle || '',
              yesVotes: nftData.yesVotes || '', 
              noVotes: nftData.noVotes || '',
              role: nftData.role || ''
            };
            
            // Keep the current values if they exist, otherwise use the values from metadata
            setMetaValues(prev => ({
              campaignName: allKnownValues.campaignName,
              projectNumber: allKnownValues.projectNumber,
              projectTitle: allKnownValues.projectTitle,
              yesVotes: prev.yesVotes || allKnownValues.yesVotes,
              noVotes: prev.noVotes || allKnownValues.noVotes,
              role: prev.role || allKnownValues.role
            }));
          } else {
            console.error('Could not find NFT metadata');
          }
        }
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    };
    
    if (nft && nft.metas && nft.metas.length > 0) {
      extractMetadata();
    }
  }, [nft]);

  const handleToggleStrike = (key: string) => {
    if (!localizedUpdateRoute) {
      console.error('Cannot toggle strike: NFT ID is missing');
      return;
    }
  
    const currentlyStruck = struckFields[key] || false;
    const currentValue = metaValues[key] || '';
    
    // Update local state immediately
    setStruckFields(prev => ({
      ...prev,
      [key]: !currentlyStruck
    }));
    
    // Use Inertia's router.patch with options to prevent page reload
    router.patch(
      localizedUpdateRoute, 
      {
        meta: { 
          key, 
          value: currentValue
        },
        remove: !currentlyStruck
      },
      {
        preserveScroll: true,   // Preserve scroll position
        preserveState: true,    // Preserve component state
        only: ['errors'],       // Only refresh certain data
        onSuccess: () => {
          // You can add success handling here if needed
        },
        onError: (errors) => {
          // Handle errors - possibly revert the UI change if the server request failed
          if (Object.keys(errors).length > 0) {
            setStruckFields(prev => ({
              ...prev,
              [key]: currentlyStruck  // Revert to previous state
            }));
          }
        }
      }
    );
  };

  return (
    <div className="bg-background rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-6">{t('chooseMetaDataDescription')}</h4>

      <div className="space-y-6">
        {/* Project catalyst Campaign name */}
        <div className="border-b border-dark pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-dark text-sm leading-relaxed">
              {t('projectCatalyst')}
            </div>
            <div className="text-sm">{metaValues.campaignName}</div>
          </div>
        </div>

        {/* Funded Project Number */}
        <div className="border-b border-dark pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-dark text-sm leading-relaxed">
              {t('fundProject')}
            </div>
            <div className="text-sm">{metaValues.projectNumber}</div>
          </div>
        </div>

        {/* Project Title */}
        <div className="border-b border-dark pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-dark text-sm">
              {t('projectTitle')}
            </div>
            <div className="text-sm">{metaValues.projectTitle}</div>
          </div>
        </div>

        {/* Yes Votes */}
        <div className="border-b border-dark pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-dark text-sm">
              {t('yesVotes')}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${struckFields.yesVotes ? 'line-through text-dark' : ''}`}>
                {parseInt(metaValues.yesVotes) > 0 
                  ? formatNumber(parseInt(metaValues.yesVotes)) 
                  : metaValues.yesVotes}
              </span>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleStrike('yesVotes');
                }}
                className="text-sm border-none bg-transparent p-0"
                ariaLabel={struckFields.yesVotes ? t('restoreField') : t('removeField')}
              >
                <span className={struckFields.yesVotes ? 'text-success' : 'text-error'}>
                  {struckFields.yesVotes ? '↩' : '✕'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* No Votes */}
        <div className="border-b border-dark pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-dark text-sm">
              {t('noVotes')}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${struckFields.noVotes ? 'line-through text-dark' : ''}`}>
                {parseInt(metaValues.noVotes) > 0
                  ? formatNumber(parseInt(metaValues.noVotes))
                  : metaValues.noVotes}
              </span>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleStrike('noVotes');
                }}
                className="text-sm border-none bg-transparent p-0"
                ariaLabel={struckFields.noVotes ? t('restoreField') : t('removeField')}
              >
                <span className={struckFields.noVotes ? 'text-success' : 'text-error'}>
                  {struckFields.noVotes ? '↩' : '✕'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="border-b border-dark pb-4">
          <div className="grid grid-cols-[200px_1fr] items-start">
            <div className="text-dark text-sm">
              {t('role')}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${struckFields.role ? 'line-through text-dark' : ''}`}>
                {metaValues.role}
              </span>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleStrike('role');
                }}
                className="text-sm border-none bg-transparent p-0"
                ariaLabel={struckFields.role ? t('restoreField') : t('removeField')}
              >
                <span className={struckFields.role ? 'text-success' : 'text-error'}>
                  {struckFields.role ? '↩' : '✕'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Paragraph className="text-xs text-dark italic text-center max-w-lg">
          {t('metadataStrikeInstruction')}
        </Paragraph>
      </div>
    </div>
  );
};

export default MetaData;
