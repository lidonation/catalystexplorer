import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Selector from '@/Components/atoms/Selector';

interface ServiceTypeFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export default function ServiceTypeFilter({ selectedType, onTypeChange }: ServiceTypeFilterProps) {
  const { t } = useLaravelReactI18n();
  const serviceTypeOptions = [
    { label: 'Offering Service', value: 'offered' },
    { label: 'Requesting Service', value: 'needed' }
  ];

  const handleTypeChange = (type: string) => {
    onTypeChange(type || null);
  };

  return (
    <div className="self-stretch p-4 bg-background rounded-xl border border-gray-100  flex flex-col justify-start items-start gap-6" data-testid="service-type-filter">
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="self-stretch flex justify-start items-center gap-3">
          <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch flex justify-between items-center">
              <div className="text-gray-600 text-sm font-medium  leading-tight">
                {t('services.service')}
              </div>
            </div>
            <div className="self-stretch h-11 flex flex-col justify-start items-start gap-2">
              <Selector
                options={serviceTypeOptions}
                selectedItems={selectedType || ''}
                setSelectedItems={handleTypeChange}
                placeholder=""
                hideCheckbox={true}
                className="w-full h-full [&_button]:border-gray-200 [&_button]:border"
                  bgColor="bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
