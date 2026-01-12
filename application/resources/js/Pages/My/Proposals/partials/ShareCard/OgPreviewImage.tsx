import { useLaravelReactI18n } from "laravel-react-i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import Paragraph from "@/Components/atoms/Paragraph";
import { generateLocalizedRoute } from "@/utils/localizedRoute";

interface OgPreviewImageProps {
    proposal: App.DataTransferObjects.ProposalData;
    config: App.ShareCard.ConfiguratorState;
    onFirstLoadComplete?: () => void;
    initialImageUrl?: string | null;
    isConfigSettled?: boolean;
}

export default function OgPreviewImage({
    proposal,
    config,
    onFirstLoadComplete,
    initialImageUrl = null,
    isConfigSettled = false,
}: OgPreviewImageProps) {
    const { t } = useLaravelReactI18n();
    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
    const [isLoading, setIsLoading] = useState(!initialImageUrl);
    const [error, setError] = useState<string | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const requestIdRef = useRef<number>(0);
    const hasNotifiedFirstLoad = useRef<boolean>(false);
    const isInitialLoadComplete = useRef<boolean>(false);
    const previousConfigRef = useRef<App.ShareCard.ConfiguratorState | null>(null);

    const generatePreview = useCallback((configToUse: App.ShareCard.ConfiguratorState) => {

        const currentRequestId = ++requestIdRef.current;

        setIsLoading(true);
        setError(null);

        router.post(
            generateLocalizedRoute('proposals.og-image', { slug: proposal.slug }),
            {
                visibleElements: configToUse.visibleElements,
                selectedThemeId: configToUse.selectedThemeId,
                customColor: configToUse.customColor,
                customMessage: configToUse.customMessage,
                callToActionText: configToUse.callToActionText,
                logoUrl: configToUse.logoUrl,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {

                    if (currentRequestId !== requestIdRef.current) return;

                    const data = (page.props as { ogPreviewData?: { url?: string; error?: string } }).ogPreviewData;
                    if (data?.url) {
                        setImageUrl(`${data.url}?t=${Date.now()}`);
                        setIsLoading(false);
                    } else if (data?.error) {
                        setError(data.error);
                        setIsLoading(false);
                    }
                },
                onError: () => {
                    // Ignore if this is not the latest request
                    if (currentRequestId !== requestIdRef.current) return;

                    setError(t('shareCard.previewError') || 'Failed to generate preview');
                    setIsLoading(false);
                },
                onFinish: () => {
                    // Ignore if this is not the latest request
                    if (currentRequestId !== requestIdRef.current) return;

                    setIsLoading(false);
                },
            }
        );
    }, [proposal.slug, t]);

    // Debounced effect to regenerate preview on config changes
    useEffect(() => {

        if (!isConfigSettled) {
            return;
        }

        if (!isInitialLoadComplete.current) {
            isInitialLoadComplete.current = true;
            previousConfigRef.current = config;

            if (initialImageUrl) {
                setIsLoading(false);
                return;
            }

            generatePreview(config);
            return;
        }

        if (previousConfigRef.current && JSON.stringify(previousConfigRef.current) === JSON.stringify(config)) {
            return;
        }

        previousConfigRef.current = config;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            generatePreview(config);
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [config, isConfigSettled, generatePreview, initialImageUrl]);

    if (error) {
        return (
            <section
                aria-label="Twitter Open Graph preview"
                className="flex w-full h-[200px] items-center justify-center overflow-hidden rounded-xl bg-light-gray-persist p-5"
            >
                <Paragraph className="text-sm text-error">{error}</Paragraph>
            </section>
        );
    }

    return (
        <section
            aria-label="Twitter Open Graph preview"
            className="relative w-full overflow-hidden rounded-xl"
        >
            {isLoading && (
                <div className={`${imageUrl ? 'absolute inset-0 z-10' : 'p-8'} flex animate-pulse items-center justify-center rounded-xl bg-light-gray-persist/50`}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <Paragraph className="text-sm text-content">
                            {t('shareCard.generatingPreview')}
                        </Paragraph>
                    </div>
                </div>
            )}
            {imageUrl && (
                <>
                    <img
                        src={imageUrl}
                        alt={t('shareCard.previewAlt') || 'OG card preview'}
                        className={`w-full rounded-xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                        onLoad={() => {
                            setIsLoading(false)
                            if (!hasNotifiedFirstLoad.current && onFirstLoadComplete) {
                                hasNotifiedFirstLoad.current = true;
                                onFirstLoadComplete();
                            }

                        }}
                        onError={() => {
                            setError(t('shareCard.previewError') || 'Failed to load preview');
                            setIsLoading(false);
                        }
                        }
                    />
                </>
            )}
        </section>
    );
}
