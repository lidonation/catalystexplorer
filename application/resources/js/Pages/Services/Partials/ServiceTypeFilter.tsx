import React from 'react';
import Selector from '@/Components/atoms/Selector';

interface ServiceTypeFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export default function ServiceTypeFilter({ selectedType, onTypeChange }: ServiceTypeFilterProps) {
  const serviceTypeOptions = [
    { label: 'Offering Service', value: 'offered' },
    { label: 'Requesting Service', value: 'needed' }
  ];

  const handleTypeChange = (type: string) => {
    console.log('Service Type Filter Debug:', {
      oldType: selectedType,
      newType: type || null
    });
    onTypeChange(type || null);
  };

  return (
    <div className="self-stretch p-4 bg-background rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex flex-col justify-start items-start gap-6">
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="self-stretch flex justify-start items-center gap-3">
          <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch flex justify-between items-center">
              <div className="text-gray-600 text-sm font-medium font-['Inter'] leading-tight">
                Service Type
              </div>
              <button
                onClick={() => onTypeChange(null)}
                className="text-blue-600 text-sm font-semibold font-['Inter'] leading-tight cursor-pointer hover:text-blue-700 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="self-stretch h-11 flex flex-col justify-start items-start gap-2">
              <Selector
                options={serviceTypeOptions}
                selectedItems={selectedType || ''}
                setSelectedItems={handleTypeChange}
                placeholder="Select service type"
                hideCheckbox={true}
                className="w-full h-full"
                bgColor="bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
