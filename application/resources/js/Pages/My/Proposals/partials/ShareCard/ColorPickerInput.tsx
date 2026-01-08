import Paragraph from "@/Components/atoms/Paragraph";
import { useLaravelReactI18n } from "laravel-react-i18n";

interface ColorPickerInputProps {
    value: string;
    onChange: (color: string) => void;
}

export default function ColorPickerInput({
    value,
    onChange
}: ColorPickerInputProps) {
    const { t } = useLaravelReactI18n();

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value.toUpperCase();
        if (!newValue.startsWith('#')) {
            newValue = '#' + newValue;
        }
      
        if (/^#[0-9A-F]{0,6}$/.test(newValue)) {
            onChange(newValue);
        }
    };
    return (
        <div className="flex gap-15 items-center">
            <Paragraph className="w-[140px] text-sm font-medium text-content">
                {t('shareCard.customColor')}
            </Paragraph>
            <div className={'flex flex-1 items-center gap-1.5 rounded-md border-light-gray-persist bg-gray-persist/[0.1] px-3 py-2.5'}>
                <div
                    className="relative size-[18px] overflow-hidden rounded"
                    style={{ backgroundColor: value || 'var(--cx-primary)' }}
                >
                    <input
                        type="color"
                        value={value || 'var(--cx-primary)'}
                        onChange={(e) => onChange(e.target.value.toUpperCase())}
                        className="absolute -inset-2 size-[200%] cursor-pointer opacity-0"
                        title={t('shareCard.pickColor')}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="var(--cx-primary)"
                    maxLength={7}
                    className="w-full border-0 bg-transparent p-0 text-sm text-content focus:outline-none focus:ring-0"
                />

            </div>
        </div>

    );
}