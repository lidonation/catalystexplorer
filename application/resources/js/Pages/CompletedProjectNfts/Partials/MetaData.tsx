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
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  
  const localizedUpdateRoute = nft?.id
    ? useLocalizedRoute('crud.nfts.update', { nft: nft.id })
    : null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const loadStruckStates = (storageKey: string): Record<string, boolean> => {
    try {
      const savedStruck = localStorage.getItem(`${storageKey}_struck`);
      if (savedStruck) {
        const parsed = JSON.parse(savedStruck);

        return parsed;
      }
    } catch (e) {
      console.error('Error loading struck states from localStorage:', e);
    }
    return {};
  };

  const saveStruckStates = (storageKey: string, struckStates: Record<string, boolean>) => {
    try {
      localStorage.setItem(`${storageKey}_struck`, JSON.stringify(struckStates));
    } catch (e) {
      console.error('Error saving struck states to localStorage:', e);
    }
  };

  useEffect(() => {
    if (!nft?.id) {
      setIsMetadataAvailable(false);
      return;
    }
    
    const storageKey = `nft_${nft.id}`;
    
    const loadedStruckFields = loadStruckStates(storageKey);
    setStruckFields(loadedStruckFields);
    
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
        if (nft.metadata) {
          const meta = typeof nft.metadata === 'string' 
            ? safeJsonParse(nft.metadata, {}) 
            : (nft.metadata as Record<string, unknown>);
          
          const keyMappings = {
            campaignName: ['Project Catalyst Campaign Name', 'campaign_name', 'projectCatalystCampaignName'],
            projectNumber: ['Funded Project Number', 'funded_project_number', 'fundedProjectNumber'],
            projectTitle: ['Project Title', 'project_title', 'projectTitle'],
            yesVotes: ['yes votes', 'yes_votes', 'yesVotes'],
            noVotes: ['no votes', 'no_votes', 'noVotes'],
            role: ['role', 'Role']
          };
          
          extractValuesFromMapping(meta, keyMappings, values);
        }
        
        const nmkrMeta = nft.metas?.find(m => m.key === 'nmkr_metadata');
        if (nmkrMeta?.content) {
          const meta = safeJsonParse(nmkrMeta.content, {});
          
          const nftData = extractNftDataFromNmkr(meta);
          
          if (nftData) {
            const keyMappings = {
              campaignName: ['Project Catalyst Campaign Name', 'projectCatalystCampaignName'],
              projectNumber: ['Funded Project Number', 'fundedProjectNumber'],
              projectTitle: ['Project Title', 'projectTitle'],
              yesVotes: ['yes votes', 'yesVotes'],
              noVotes: ['no votes', 'noVotes'],
              role: ['role']
            };
            
            extractValuesFromMapping(nftData, keyMappings, values);
          }
        }
        
        if (nft.metas && Array.isArray(nft.metas)) {
          nft.metas.forEach(metaItem => {
            if (metaItem.content) {
              try {
                const parsed = safeJsonParse(metaItem.content, {});
                
                const keyMappings = {
                  campaignName: ['Project Catalyst Campaign Name', 'campaign_name', 'projectCatalystCampaignName'],
                  projectNumber: ['Funded Project Number', 'funded_project_number', 'fundedProjectNumber'],
                  projectTitle: ['Project Title', 'project_title', 'projectTitle'],
                  yesVotes: ['yes votes', 'yes_votes', 'yesVotes'],
                  noVotes: ['no votes', 'no_votes', 'noVotes'],
                  role: ['role', 'Role']
                };
                
                extractValuesFromMapping(parsed, keyMappings, values);
              } catch (e) {
                // Skip invalid JSON
              }
            }
          });
        }   
      } catch (e) {
        console.error('Error extracting values from metadata:', e);
      }
      
      return values;
    };
    
     const safeJsonParse = (jsonString: string, p0: {}): Record<string, any> => {
      if (!jsonString || typeof jsonString !== 'string') {
        return {};
      }
      
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn('Invalid JSON, skipping:', jsonString.substring(0, 50));
        return {};
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

    // Prevent multiple simultaneous updates
    if (isUpdating[key]) {
      return;
    }
  
    const currentlyStruck = struckFields[key] || false;
    const value = displayValues[key] || '';
    const storageKey = `nft_${nft.id}`;
    
    // Update the struck state immediately for UI responsiveness
    const newStruckFields = {
      ...struckFields,
      [key]: !currentlyStruck
    };
    
    setStruckFields(newStruckFields);
    setIsUpdating(prev => ({ ...prev, [key]: true }));
    
    saveStruckStates(storageKey, newStruckFields);
    
    router.patch(
      localizedUpdateRoute, 
      {
        meta: { 
          key, 
          value
        },
        remove: !currentlyStruck
      },
      {
        preserveScroll: true,
        preserveState: true,
        only: ['errors'],
        onSuccess: () => {
          setIsUpdating(prev => ({ ...prev, [key]: false }));
        },
        onError: (errors) => {
          console.error('Error updating metadata:', errors);
          setIsUpdating(prev => ({ ...prev, [key]: false }));
          
          if (Object.keys(errors).length > 0) {
            const revertedStruckFields = {
              ...struckFields,
              [key]: currentlyStruck
            };
            
            setStruckFields(revertedStruckFields);
            saveStruckStates(storageKey, revertedStruckFields);
          }
        },
        onFinish: () => {
          setIsUpdating(prev => ({ ...prev, [key]: false }));
        }
      }
    );
  };

  const renderEditableField = (label: string, fieldKey: string, value: string) => {
    const isNumber = fieldKey === 'yesVotes' || fieldKey === 'noVotes';
    const isFieldUpdating = isUpdating[fieldKey];
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
                disabled={isFieldUpdating}
                className={`text-sm border-none bg-transparent p-0 ${isFieldUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                ariaLabel={struckFields[fieldKey] ? t('restoreField') : t('removeField')}
              >
                <span className={struckFields[fieldKey] ? 'text-success' : 'text-error'}>
                  {isFieldUpdating ? '⟳' : (struckFields[fieldKey] ? '↩' : '✕')}
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