import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import NftData = App.DataTransferObjects.NftData;

interface MetaDataProps {
  nft: NftData;
  isOwner: boolean;
}

const MetaData = ({ nft, isOwner }: MetaDataProps) => {
  const { t } = useTranslation();
  const [struckFields, setStruckFields] = useState<Record<string, boolean>>({});
  const [displayValues, setDisplayValues] = useState<Record<string, string>>({
    campaignName: '',
    projectNumber: '',
    projectTitle: '',
    yesVotes: '',
    noVotes: '',
    role: ''
  });
  const [isMetadataAvailable, setIsMetadataAvailable] = useState<boolean>(true);
  
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

  useEffect(() => {
    if (!nft?.id) {
      setIsMetadataAvailable(false);
      return;
    }
    
    const storageKey = `nft_${nft.id}`;
    
    // Function to extract initial values
    const extractInitialValues = () => {
      const values: Record<string, string> = {
        campaignName: '',
        projectNumber: '',
        projectTitle: '',
        yesVotes: '',
        noVotes: '',
        role: ''
      };
      
      try {
        const savedValues = localStorage.getItem(`${storageKey}_values`);
        if (savedValues) {
          const parsed = JSON.parse(savedValues);
          Object.keys(values).forEach(key => {
            if (parsed[key]) {
              values[key] = parsed[key];
            }
          });
        }
      } catch (e) {
        console.error('Error loading values from localStorage:', e);
      }
      
      try {
        // Try main metadata first
        if (nft.metadata) {
          let meta = nft.metadata;
          if (typeof meta === 'string') {
            meta = JSON.parse(meta);
          }
          
          // Map metadata keys to our keys
          if (meta.campaign_name && !values.campaignName) 
            values.campaignName = meta.campaign_name;
            
          if (meta['Funded Project Number'] && !values.projectNumber) 
            values.projectNumber = meta['Funded Project Number'].toString();
            
          if (meta['Project Title'] && !values.projectTitle) 
            values.projectTitle = meta['Project Title'];
            
          if (meta.yes_votes && !values.yesVotes) 
            values.yesVotes = meta.yes_votes.toString();
            
          if (meta.no_votes && !values.noVotes) 
            values.noVotes = meta.no_votes.toString();
            
          if (meta.role && !values.role) 
            values.role = meta.role;
        }
        
        // Check NMKR metadata too
        const nmkrMeta = nft.metas?.find((m: { key: string; }) => m.key === 'nmkr_metadata');
        if (nmkrMeta && nmkrMeta.content) {
          const meta = JSON.parse(nmkrMeta.content);
          
          // Extract NFT data from the complex NMKR structure
          let nftData = null;
          
          if (meta['721']) {
            const policyKeys = Object.keys(meta['721']).filter(k => k !== 'version');
            for (const policy of policyKeys) {
              const assetKeys = Object.keys(meta['721'][policy]).filter(k => k !== 'version');
              if (assetKeys.length > 0) {
                nftData = meta['721'][policy][assetKeys[0]];
                break;
              }
            }
          }
          
          if (nftData) {
            // Map NMKR keys to our keys
            if (nftData.projectCatalystCampaignName && !values.campaignName)
              values.campaignName = nftData.projectCatalystCampaignName;
              
            if (nftData.fundedProjectNumber && !values.projectNumber)
              values.projectNumber = nftData.fundedProjectNumber.toString();
              
            if (nftData.projectTitle && !values.projectTitle)
              values.projectTitle = nftData.projectTitle;
              
            if (nftData.yesVotes && !values.yesVotes)
              values.yesVotes = nftData.yesVotes.toString();
              
            if (nftData.noVotes && !values.noVotes)
              values.noVotes = nftData.noVotes.toString();
              
            if (nftData.role && !values.role)
              values.role = nftData.role;
          }
        }
      } catch (e) {
        console.error('Error extracting values from metadata:', e);
      }
      
      return values;
    };
    
    // Get struck states
    try {
      const savedStruck = localStorage.getItem(`${storageKey}_struck`);
      if (savedStruck) {
        setStruckFields(JSON.parse(savedStruck));
      }
    } catch (e) {
      console.error('Error loading struck states from localStorage:', e);
    }
    
    // Extract and set values
    const values = extractInitialValues();
    setDisplayValues(values);
    
    // Save these values to localStorage as backup
    try {
      localStorage.setItem(`${storageKey}_values`, JSON.stringify(values));
    } catch (e) {
      console.error('Error saving values to localStorage:', e);
    }
    
    // Check if we have enough data to show
    const hasData = Object.values(values).some(v => !!v);
    setIsMetadataAvailable(hasData);
    
  }, [nft?.id, nft?.metadata, nft?.metas]);

  const handleToggleStrike = (key: string) => {
    if (!localizedUpdateRoute || !nft?.id) {
      console.error('Cannot toggle strike: NFT ID is missing');
      return;
    }
  
    const currentlyStruck = struckFields[key] || false;
    const value = displayValues[key] || '';
    
    // Update the struck state
    const newStruckFields = {
      ...struckFields,
      [key]: !currentlyStruck
    };
    
    setStruckFields(newStruckFields);
    
    // Save to localStorage
    try {
      localStorage.setItem(`nft_${nft.id}_struck`, JSON.stringify(newStruckFields));
    } catch (e) {
      console.error('Error saving struck states to localStorage:', e);
    }
    
    // Update the backend metadata
    router.patch(
      localizedUpdateRoute, 
      {
        meta: { 
          key, 
          value
        },
        remove: !currentlyStruck  // If it's not currently struck, we're striking it now
      },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['errors'],
        onError: (errors) => {
          if (Object.keys(errors).length > 0) {
            // Revert if there's an error
            setStruckFields({
              ...struckFields,
              [key]: currentlyStruck
            });
            
            try {
              localStorage.setItem(`nft_${nft.id}_struck`, JSON.stringify({
                ...struckFields, 
                [key]: currentlyStruck
              }));
            } catch (e) {
              console.error('Error saving struck states to localStorage:', e);
            }
          }
        }
      }
    );
  };

  const renderEditableField = (label: string, fieldKey: string, value: string) => {
    const isNumber = fieldKey === 'yesVotes' || fieldKey === 'noVotes';
    let displayValue = value || '-';
    
    if (isNumber && value && parseInt(value) > 0) {
      displayValue = formatNumber(parseInt(value));
    }
    
    return (
      <div className="border-b border-dark pb-4">
        <div className="grid grid-cols-[200px_1fr] items-start">
          <div className="text-dark text-sm">
            {label}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${struckFields[fieldKey] ? 'line-through text-dark' : ''}`}>
              {displayValue}
            </span>
            {isOwner && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleStrike(fieldKey);
                }}
                className="text-sm border-none bg-transparent p-0"
                ariaLabel={struckFields[fieldKey] ? t('restoreField') : t('removeField')}
              >
                <span className={struckFields[fieldKey] ? 'text-success' : 'text-error'}>
                  {struckFields[fieldKey] ? '↩' : '✕'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReadOnlyField = (label: string, value: string) => {
    return (
      <div className="border-b border-dark pb-4">
        <div className="grid grid-cols-[200px_1fr] items-start">
          <div className="text-dark text-sm leading-relaxed">
            {label}
          </div>
          <div className="text-sm">{value || '-'}</div>
        </div>
      </div>
    );
  };
  
  const renderUnavailableMessage = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-4">
          <span className="inline-block px-4 rounded-lg text-dark">
            {t('completedProjectNfts.Unavailable')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-6">{t('chooseMetaDataDescription')}</h4>

      {isMetadataAvailable ? (
        <div className="space-y-6">
          {renderReadOnlyField(t('projectCatalyst'), displayValues.campaignName)}
          {renderReadOnlyField(t('fundProject'), displayValues.projectNumber)}
          {renderReadOnlyField(t('projectTitle'), displayValues.projectTitle)}
          {renderEditableField(t('yesVotes'), 'yesVotes', displayValues.yesVotes)}
          {renderEditableField(t('noVotes'), 'noVotes', displayValues.noVotes)}
          {renderEditableField(t('role'), 'role', displayValues.role)}
        </div>
      ) : (
        renderUnavailableMessage()
      )}

      {isOwner && isMetadataAvailable && (
        <div className="flex justify-center mt-8">
          <Paragraph className="text-xs text-dark italic text-center max-w-lg">
            {t('metadataStrikeInstruction')}
          </Paragraph>
        </div>
      )}
    </div>
  );
};

export default MetaData;
