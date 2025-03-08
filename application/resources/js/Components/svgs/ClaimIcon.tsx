import { useTranslation } from 'react-i18next';
import Button from '../atoms/Button';
import PrimaryButton from "@/Components/atoms/PrimaryButton";

type ClaimProps = {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
  width?: number;
  height?: number;
};

export default function Claim({
  onClick,
  isLoading = false,
  className = '',
  width = 107,
  height = 30,
}: ClaimProps) {
  const { t } = useTranslation();

  return (
    <PrimaryButton
      onClick={onClick}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 active:opacity-80'}
        ${className}
      `}
      aria-label={t('claim.claim_profile')}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <span className="animate-pulse">{t('claim.claiming', 'Claiming...')}</span>
        </div>
      ) : (
          <div>
              {t('ideascaleProfiles.claim')}
          </div>
      )}
    </PrimaryButton>
  );
}
