import Button from '@/Components/atoms/Button';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Claimed from '@/Components/svgs/ClaimedIcon';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface ClaimedButtonProps {
    modelType?: string;
    itemId?: string;
    claimedBy?: number;
    className?: string;
    onClaimSuccess?: () => void;
}

const ClaimedButton: React.FC<ClaimedButtonProps> = ({
    modelType = 'ideascale-profiles',
    itemId = '0',
    claimedBy,
    className = '',
    onClaimSuccess,
}) => {
    const { t } = useLaravelReactI18n();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localClaimedBy, setLocalClaimedBy] = useState(claimedBy);
    const [buttonState, setButtonState] = useState<
        'unclaimed' | 'claiming' | 'claimed'
    >(claimedBy ? 'claimed' : 'unclaimed');

    const { auth } = usePage().props as any;
    const isAuthenticated = auth && auth.user;

    useEffect(() => {
        if (claimedBy !== undefined) {
            setLocalClaimedBy(claimedBy);
            setButtonState(claimedBy ? 'claimed' : 'unclaimed');
        }
    }, [claimedBy]);

    const handleClaim = async () => {
        if (!isAuthenticated) {
            toast(t('claim.login_required'));
            return;
        }

        if (isLoading || buttonState === 'claimed' || !itemId) return;

        setIsLoading(true);
        setButtonState('claiming');
        setError(null);

        try {
            console.log(`Claiming profile with ID: ${itemId}`);

            setTimeout(() => {
                setLocalClaimedBy(auth?.user?.id || 1);
                setButtonState('claimed');
                setIsLoading(false);
                onClaimSuccess?.();
            }, 1000);
        } catch (error) {
            console.error('Claim error:', error);
            setError(t('claim.network_error'));
            setButtonState('unclaimed');
            setIsLoading(false);
        }
    };

    return (
        <div className={`claim-button-container inline-flex ${className}`}>
            {buttonState === 'claimed' ? (
                <Button
                    className="claimed-button flex items-center"
                    ariaLabel={t('claim.already_claimed')}
                    disabled={true}
                >
                    <Claimed />
                    <div className="ml-2"></div>
                </Button>
            ) : (
                <div
                    className={`claim-button flex items-center ${isLoading ? 'opacity-75' : ''}`}
                >
                    <PrimaryLink
                        href={useLocalizedRoute(
                            'workflows.claimIdeascaleProfile.index',
                            { step: 2, profile: itemId },
                        )}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center ${isLoading ? 'cursor-not-allowed opacity-70' : ''} ${className} `}
                        aria-label={t('claim.claim_profile')}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <span className="animate-pulse">
                                    {t('claim.claiming')}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm">
                                {t('ideascaleProfiles.claim')}
                            </div>
                        )}
                    </PrimaryLink>
                </div>
            )}

            {error && (
                <div className="text-danger-strong mt-2 text-sm" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ClaimedButton;
