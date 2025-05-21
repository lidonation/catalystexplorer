
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Selector from '@/Components/atoms/Selector';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Step2Props {
  isDisabled?: boolean;
  selectedChartType: string;
  setSelectedChartType: (value: string) => void;
}

export default function Step2({ 
  isDisabled = false, 
  selectedChartType,
  setSelectedChartType
}: Step2Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Paragraph>
          Select Chart Type <span>{`(Select all that apply)`}</span>
        </Paragraph>
        <Selector
          isMultiselect={false}
          options={[
            {
              value: 'trendChart',
              label: t('proposals.charts.trendChart'),
            },
          ]}
          setSelectedItems={(value) => {
            setSelectedChartType(value);
          }}
          selectedItems={selectedChartType}
          disabled={isDisabled}
          placeholder='Select'
          context='Chart Type'
        />
      </div>
            <div>
                <PrimaryButton className="w-full" disabled={isDisabled}>Next</PrimaryButton>
            </div>
        </div>
    );
}
