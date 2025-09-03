import Selector from '@/Components/atoms/Selector';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ServiceTypeFilterProps {
    selectedType: string | null;
    onTypeChange: (type: string | null) => void;
}

export default function ServiceTypeFilter({
    selectedType,
    onTypeChange,
}: ServiceTypeFilterProps) {
    const { t } = useLaravelReactI18n();
    const serviceTypeOptions = [
        { label: 'Offering Service', value: 'offered' },
        { label: 'Requesting Service', value: 'needed' },
    ];

    const handleTypeChange = (type: string) => {
        onTypeChange(type || null);
    };

    return (
        <div
            className="bg-background flex flex-col items-start justify-start gap-6 self-stretch rounded-xl border border-gray-100 p-4"
            data-testid="service-type-filter"
        >
            <div className="flex flex-col items-start justify-start gap-4 self-stretch">
                <div className="flex items-center justify-start gap-3 self-stretch">
                    <div className="flex flex-1 flex-col items-start justify-start gap-1.5">
                        <div className="flex items-center justify-between self-stretch">
                            <div className="text-sm leading-tight font-medium text-gray-600">
                                {t('services.service')}
                            </div>
                        </div>
                        <div className="flex h-11 flex-col items-start justify-start gap-2 self-stretch">
                            <Selector
                                options={serviceTypeOptions}
                                selectedItems={selectedType || ''}
                                setSelectedItems={handleTypeChange}
                                placeholder=""
                                hideCheckbox={true}
                                className="h-full w-full [&_button]:border [&_button]:border-gray-200"
                                bgColor="bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
