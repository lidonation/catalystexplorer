import Checkbox from '@/Components/atoms/Checkbox';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface FundFiltersProps {
  selectedItems: string[];
  setSelectedItems: (updatedItems: string[]) => void;
}

export default function ProposalStatusFilters({
  selectedItems,
  setSelectedItems,
}: FundFiltersProps) {
  const { t } = useTranslation();
  
  // Store filters locally in state instead of context
  const [localFilters, setLocalFilters] = useState<{
    [key: string]: string[];
  }>({
    [ParamsEnum.PROJECT_STATUS]: [],
    [ParamsEnum.FUNDING_STATUS]: [],
  });

  const filterOptions = [
    {
      label: t('proposals.submittedProposals'),
      value: 'submitted',
      param: ParamsEnum.PROJECT_STATUS,
    },
    {
      label: t('proposals.approvedProposals'),
      value: 'funded',
      param: ParamsEnum.FUNDING_STATUS,
    },
    {
      label: t('proposals.completedProposals'),
      value: 'complete',
      param: ParamsEnum.PROJECT_STATUS,
    },
  ];

  // Initialize filters on mount if needed
  useEffect(() => {
    // If there are already selected items from props, use them to initialize local filters
    if (selectedItems.length > 0) {
      const projectStatusFilters: string[] = [];
      const fundingStatusFilters: string[] = [];

      selectedItems.forEach(item => {
        if (item === 'submitted' || item === 'complete') {
          projectStatusFilters.push(item);
        } else if (item === 'funded') {
          fundingStatusFilters.push(item);
        }
      });

      setLocalFilters({
        [ParamsEnum.PROJECT_STATUS]: projectStatusFilters,
        [ParamsEnum.FUNDING_STATUS]: fundingStatusFilters,
      });
    }
  }, []);

  const handleSelect = (value: string, param: string) => {
    // Update local selectedItems array
    const updatedItems = selectedItems.includes(value)
      ? selectedItems.filter(item => item !== value)
      : [...selectedItems, value];
    
    setSelectedItems(updatedItems);
    
    // Update local filters state without affecting URL
    setLocalFilters(prevFilters => {
      const paramFilters = prevFilters[param] || [];
      
      if (paramFilters.includes(value)) {
        // Remove the value from filter
        return {
          ...prevFilters,
          [param]: paramFilters.filter(item => item !== value),
        };
      } else {
        // Add the value to filter
        return {
          ...prevFilters,
          [param]: [...paramFilters, value],
        };
      }
    });
  };

  useEffect(()=>{
    console.log('filters', localFilters);
  }, [localFilters]);

  return (
    <div>
      <ul className="mt-4 grid grid-cols-2 gap-4">
        {filterOptions.map((option, index) => (
          <li key={index} className="flex items-center">
            <Checkbox
              id={option.value}
              value={option.value}
              checked={selectedItems.includes(option.value)}
              onChange={() => handleSelect(option.value, option.param)}
              className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
            />
            <label htmlFor={option.value} className="ml-2 text-sm">
              {option.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}