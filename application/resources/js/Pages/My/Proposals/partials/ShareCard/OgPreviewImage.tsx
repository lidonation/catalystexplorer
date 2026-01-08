import { useLaravelReactI18n } from "laravel-react-i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import Paragraph from "@/Components/atoms/Paragraph";
import { generateLocalizedRoute } from "@/utils/localizedRoute";

interface OgPreviewImageProps {
    proposal: App.DataTransferObjects.ProposalData;
    config: App.ShareCard.ConfiguratorState;
    voteChoice?: App.ShareCard.VoteChoice;
    onFirstLoadComplete?: () => void;
}

export default function OgPreviewImage({
    proposal,
    config,
    voteChoice,
    onFirstLoadComplete
}: OgPreviewImageProps) {
    const { t } = useLaravelReactI18n();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const requestIdRef = useRef<number>(0);
    const hasNotifiedFirstLoad = useRef<boolean>(false);

    const generatePreview = useCallback(() => {
       
        const currentRequestId = ++requestIdRef.current;

        setIsLoading(true);
        setError(null);

        router.post(
            generateLocalizedRoute('proposals.og-image', { slug: proposal.slug }),
            {
                visibleElements: config.visibleElements,
                selectedThemeId: config.selectedThemeId,
                customColor: config.customColor,
                customMessage: config.customMessage,
                callToActionText: config.callToActionText,
                logoUrl: config.logoUrl,
                voteChoice: voteChoice,
                preview: true,
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
    }, [proposal.slug, config, voteChoice, t]);

    // Debounced effect to regenerate preview on config changes
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            generatePreview();
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [config, voteChoice, proposal.slug, generatePreview]);

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
                        <Paragraph className="text-sm text-gray-persist">
                            {t('shareCard.generatingPreview') || 'Generating preview...'}
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
