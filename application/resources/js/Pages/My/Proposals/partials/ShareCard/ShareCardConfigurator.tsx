import { useCallback, useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import VisibilityToggleList from "./VisibilityToggleList";
import { DEFAULT_CONFIG } from "../../constants/ogTheme";
import { useLaravelReactI18n } from "laravel-react-i18n";
import Paragraph from "@/Components/atoms/Paragraph";
// import OgPreviewCard from "./OgPreviewCard"; // Keep for reference - renders client-side preview
import OgPreviewImage from "./OgPreviewImage"; // Dynamic server-rendered preview
import Textarea from "@/Components/atoms/Textarea";
import BackgroundThemeGrid from "./BackgroundThemeGrid";
import ColorPickerInput from "./ColorPickerInput";
import Button from "@/Components/atoms/Button";
import ShareButtonsBar from "./ShareButtonBar";
import { useUserSetting } from "@/useHooks/useUserSettings";
import { userSettingEnums } from '@/enums/user-setting-enums';
import { generateLocalizedRoute } from "@/utils/localizedRoute";
import { toast } from "react-toastify";

interface ShareCardConfiguratorProps {
    proposal: App.DataTransferObjects.ProposalData;
    initialConfig?: Partial<App.ShareCard.ConfiguratorState>;
    onSave?: (config: App.ShareCard.ConfiguratorState) => Promise<void>;
    onReset?: () => void;
    proposalUrl: string;
    existingOgImageUrl?: string | null;
}


export default function ShareConfigurator(
    { proposal,
        initialConfig,
        onSave,
        onReset,
        proposalUrl,
        existingOgImageUrl, }: ShareCardConfiguratorProps
) {
    const { t } = useLaravelReactI18n();
    const [isSaving, setIsSaving] = useState(false);
    const { value: savedConfig, setValue: saveConfig, isLoading: isConfigLoading } = useUserSetting<App.ShareCard.ConfiguratorState>(
        userSettingEnums.OG_CARD_CONFIG as keyof App.DataTransferObjects.UserSettingData,
        DEFAULT_CONFIG
    );

    const [config, setConfig] = useState<App.ShareCard.ConfiguratorState>(() => ({
        ...DEFAULT_CONFIG,
        ...savedConfig,
        ...initialConfig,
    }));


    const [isConfigSettled, setIsConfigSettled] = useState(false);

    useEffect(() => {
        if (savedConfig && !initialConfig) {
            setConfig(prev => ({
                ...prev,
                ...savedConfig,
            }));
        }
       
        if (!isConfigLoading) {
            setIsConfigSettled(true);
        }
    }, [savedConfig, initialConfig, isConfigLoading]);

    const handleVisibilityToggle = useCallback(
        (element: App.ShareCard.VisibleElement, checked: boolean) => {
            setConfig((prev) => (
                {
                    ...prev,
                    visibleElements: checked
                        ? [...prev.visibleElements, element]
                        : prev.visibleElements.filter((el) => el !== element),
                }
            ));
        }, []
    )

    const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setConfig((prev) => ({
            ...prev,
            customMessage: e.target.value,
        }));
    }, []);

    const handleThemeSelect = useCallback((themeId: string) => {
        setConfig((prev) => ({
            ...prev,
            selectedThemeId: themeId,
            customColor: null
        }));
    }, []);

    const handleCustomColorChange = useCallback(
        (color: string) => {
            setConfig((prev) => ({
                ...prev,
                customColor: color,
            }));
        }, []
    )

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const handleLogoUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png,image/jpeg';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setIsUploadingLogo(true);
               
                router.post(
                     generateLocalizedRoute('proposals.og-logo-upload'),
                    { logo: file },
                    {
                        forceFormData: true,
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: (page) => {
                            const data = (page.props as { ogLogo?: { url?: string; error?: string } }).ogLogo;
                            if (data?.url) {
                                const newConfig = {
                                    ...config,
                                    logoUrl: data.url ?? null,
                                };
                                setConfig(newConfig);
                                saveConfig(newConfig);
                            }
                            setIsUploadingLogo(false);
                        },
                        onError: () => {
                            console.error('Failed to upload logo');
                            setIsUploadingLogo(false);
                        },
                        onFinish: () => {
                            setIsUploadingLogo(false);
                        },
                    }
                );
            }
        };
        input.click();
    }, [config, saveConfig]);

    const handleReset = useCallback(
        () => {
            setConfig({
                ...DEFAULT_CONFIG
            });
        }, []
    )

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await saveConfig(config);
            if (onSave) {
                await onSave(config);
            }
            toast.success(t('shareCard.changesSaved') );
        } finally {
            setIsSaving(false);
        }
    }, [config, saveConfig, onSave, t]);
    


    return (
        <div className="flex flex-col gap-5 rounded-xl bg-background p-5 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] ">
            <div className="flex items-center justify-between pb-4 border-b border-light-gray-persist/20">
                <Paragraph size="lg" className="font-bold text-content" >{t('shareCard.title')}</Paragraph>
                <Paragraph size="sm" className="text-light-gray-persist">{t('shareCard.sharePreview')}</Paragraph>
            </div>

            <OgPreviewImage
                proposal={proposal}
                config={config}
                initialImageUrl={existingOgImageUrl}
                isConfigSettled={isConfigSettled}
            />

            <VisibilityToggleList
                visibleElements={config.visibleElements}
                onToggle={handleVisibilityToggle} />

            <div className="h-px w-full bg-light-gray-persist/20" />

            {/* Call to action */}
            <div className="flex flex-col gap-2.5">
                <Paragraph className="text-sm font-bold text-content">
                    {t('shareCard.customMessage')}
                </Paragraph>
                <Textarea
                    value={config.customMessage}
                    onChange={handleMessageChange}
                    className="h-20 resize-none rounded-xl border-light-gray-persist"
                    placeholder={t('shareCard.messagePlaceholder')}
                />
            </div>

            <BackgroundThemeGrid
                selectedThemeId={config.selectedThemeId}
                onSelect={handleThemeSelect} />

            {/* Custom Color */}
            <ColorPickerInput
                value={config.customColor || '#2596BE'}
                onChange={handleCustomColorChange}
            />

            {/*Logo Upload*/}
            <div className="flex flex-col gap-2.5">
                <Paragraph className="text-sm font-bold text-content">
                    {t('shareCard.logo')}
                </Paragraph>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleLogoUpload}
                        disabled={isUploadingLogo}
                        className="rounded-md px-6 py-2.5 text-[13px] font-medium text-primary font-bold bg-light-gray-persist/[0.1] disabled:opacity-50"
                    >
                        {isUploadingLogo ? t('shareCard.uploading') || 'Uploading...' : t('shareCard.uploadLogo')}
                    </Button>
                    <Paragraph size="xs" className="text-content">
                        {t('shareCard.logoSizeInfo')}
                    </Paragraph>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5">
                <Button
                    onClick={handleReset}
                    className="flex-1 rounded-lg text-[13px] font-bold text-primary bg-light-gray-persist/[0.1]"
                >
                    {t('shareCard.resetToDefault')}
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 rounded-lg text-[13px] font-bold bg-primary text-white p-2.75"
                >
                    {t('shareCard.saveChanges')}
                </Button>
            </div>

            <div className="h-px w-full bg-light-gray-persist/20" />

            {/* Share Buttons */}
            <ShareButtonsBar
                proposalUrl={proposalUrl}
                proposalTitle={proposal.title || ''}
                customMessage={config.customMessage}
            />
        </div>
    )
}