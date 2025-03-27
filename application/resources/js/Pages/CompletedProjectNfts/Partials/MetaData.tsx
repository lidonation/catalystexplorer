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
          const meta = typeof nft.metadata === 'string' 
            ? safeJsonParse(nft.metadata, {}) 
            : (nft.metadata as Record<string, unknown>);
          
          const keyMappings: Record<string, readonly string[]> = {
            campaignName: ['Project Catalyst Campaign Name'],
            projectNumber: ['Funded Project Number'],
            projectTitle: ['Project Title'],
            yesVotes: ['yes votes'],
            noVotes: ['no votes'],
            role: ['role']
          };
          
          extractValuesFromMapping(meta, keyMappings, values);
        }
        
        const nmkrMeta = nft.metas?.find(m => m.key === 'nmkr_metadata');
        if (nmkrMeta?.content) {
          const meta = safeJsonParse(nmkrMeta.content, {});
          
          const nftData = extractNftDataFromNmkr(meta);
          
          if (nftData) {
            const keyMappings: Record<string, readonly string[]> = {
              campaignName: ['Project Catalyst Campaign Name'],
              projectNumber: ['Funded Project Number'],
              projectTitle: ['Project Title'],
              yesVotes: ['yes votes'],
              noVotes: ['no votes'],
              role: ['role']
            };
            
            extractValuesFromMapping(nftData, keyMappings, values);
          }
        }
      } catch (e) {
        console.error('Error extracting values from metadata:', e);
      }
      
      return values;
    };
    
    const safeJsonParse = (jsonString: string, fallback: Record<string, unknown> = {}): Record<string, unknown> => {
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return fallback;
      }
    };
    
    const extractValuesFromMapping = (
      source: Record<string, unknown>,
      mappings: Record<string, readonly string[]>,
      target: Record<string, string>
    ): void => {
      Object.entries(mappings).forEach(([valueKey, possibleKeys]) => {
        for (const key of possibleKeys) {
          const value = source[key];
          if (value !== undefined && value !== null && !target[valueKey]) {
            target[valueKey] = String(value);
            break;
          }
        }
      });
    };
    
    const extractNftDataFromNmkr = (meta: Record<string, unknown>): Record<string, unknown> | null => {
      if (!meta['721']) return null;
      
      const nmkrMeta = meta['721'] as Record<string, unknown>;
      const policyKeys = Object.keys(nmkrMeta).filter(k => k !== 'version');
      
      for (const policy of policyKeys) {
        const policyData = nmkrMeta[policy] as Record<string, unknown>;
        const assetKeys = Object.keys(policyData).filter(k => k !== 'version');
        
        if (assetKeys.length > 0) {
          return policyData[assetKeys[0]] as Record<string, unknown>;
        }
      }
      
      return null;
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
