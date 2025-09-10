import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import PrimaryButton from '@/Components/atoms/PrimaryButton.tsx';

interface QuickPitchWidgetProps {
    proposal: {
        id: string;
        quickpitch?: string;
        quickpitch_length?: number;
    };
}

export default function QuickPitchWidget({ proposal }: QuickPitchWidgetProps) {
    const { t } = useLaravelReactI18n();
    const [url, setUrl] = useState(proposal.quickpitch || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const updateRoute = useLocalizedRoute('my.proposals.quickpitch.update', {
        proposal: proposal.id,
    });

    const validateUrl = (url: string): string | null => {
        if (!url.trim()) return t('widgets.quickPitch.errors.required');

        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/;

        if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
            return t('widgets.quickPitch.errors.invalidUrl');
        }

        return null;
    };

    const normalizeYouTubeUrl = (url: string): string => {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);

        if (match && match[1]) {
            return `https://youtu.be/${match[1]}`;
        }

        return url; // Return original URL if not YouTube or if it doesn't match
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateUrl(url);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const normalizedUrl = normalizeYouTubeUrl(url.trim());

        try {
            router.patch(updateRoute, {
                quickpitch: normalizedUrl,
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSuccess(true);
                    setUrl(normalizedUrl);
                    setTimeout(() => setSuccess(false), 3000);
                },
                onError: (errors: any) => {
                    setError(errors.quickpitch || t('widgets.quickPitch.errors.updateFailed'));
                }
            });
        } catch (err) {
            setError(t('widgets.quickPitch.errors.updateFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return '';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {t('widgets.quickPitch.title')}
                </h3>
                {proposal.quickpitch_length && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatDuration(proposal.quickpitch_length)}
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
                {t('widgets.quickPitch.description')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="quickpitch-url" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('widgets.quickPitch.urlLabel')}
                    </label>
                    <div className="mt-1">
                        <input
                            type="url"
                            id="quickpitch-url"
                            name="quickpitch"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtu.be/dQw4w9WgXcQ"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={isLoading}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        {t('widgets.quickPitch.supportedFormats')}
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800">
                                    {t('widgets.quickPitch.success')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <PrimaryButton
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('widgets.quickPitch.updating')}
                            </>
                        ) : (
                            t('widgets.quickPitch.update')
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
