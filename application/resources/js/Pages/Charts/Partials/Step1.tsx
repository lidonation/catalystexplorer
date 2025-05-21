
import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useTranslation } from 'react-i18next';
import ProposalStatusFilters from './ProposalStatusFilters';
import PrimaryButton from '@/Components/atoms/PrimaryButton';

interface Step1Props {
  selectedStatusFilters: string[];
  setSelectedStatusFilters: (filters: string[]) => void;
}

export default function Step1({ 
  selectedStatusFilters, 
  setSelectedStatusFilters 
}: Step1Props) {
  const { t } = useTranslation();
  
  return (
    <div>
      <Paragraph>
        Which types of proposals interest you the most?
      </Paragraph>
      <Paragraph>{`(Select all that apply)`}</Paragraph>
      <div>
        <ProposalStatusFilters
          selectedItems={selectedStatusFilters}
          setSelectedItems={setSelectedStatusFilters}
        />
      </div>
            <div className="mt-6">
                <PrimaryButton className="w-full">Next</PrimaryButton>
            </div>
        </div>
    );
}
