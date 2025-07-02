import EditIcon from '@/Components/svgs/EditIcon';
import Paragraph from '@/Components/atoms/Paragraph';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileFieldProps {
  label: string;
  value: string | ReactNode;
  placeholder?: string;
  onEdit?: () => void;
  buttonText?: string;
}

export default function ProfileField({ 
  label, 
  value, 
  placeholder, 
  onEdit,
  buttonText
}: ProfileFieldProps) {

  const { t } = useTranslation();

  const hasValue = value !== undefined && value !== null && value !== '';
  
  return (
    <div className="border-t border-gray-300 py-3 transition-colors duration-300 ease-in-out">
      <div className="flex items-center justify-between">
        <div className="flex w-full">
          <div className="text-gray-persist w-1/4">{label}</div>
          <div className="text-content w-3/4">
            {hasValue ? value : (
              <Paragraph className="text-dark">
                {placeholder || t('users.notProvided')}
              </Paragraph>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            className={hasValue ? 'text-primary' : 'text-accent'}
            onClick={onEdit}
          >
            {hasValue ? <EditIcon className="text-primary" /> : (buttonText || t('users.add'))}
          </button>
        )}
      </div>
    </div>
  );
}