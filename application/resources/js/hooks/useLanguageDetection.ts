import { useCallback, useMemo } from 'react';
import { franc } from 'franc';
import { SUPPORTED_LOCALES, FRANC_TO_LOCALE_MAP } from '@/constants/locales';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: 'high' | 'medium' | 'low' | 'none';
    isSupported: boolean;
}

interface LanguageValidation {
    isValid: boolean;
    conflictingFields: string[];
    detectedLanguages: Record<string, string>;
    message?: string;
}

export const useLanguageDetection = () => {
    const { t } = useLaravelReactI18n();
    
    const detectLanguage = useCallback((text: string, minLength = 50): LanguageDetectionResult => {
        if (!text || text.trim().length < minLength) {
            return {
                detectedLanguage: 'en',
                confidence: 'none',
                isSupported: true
            };
        }

        try {
            // Clean the text for better detection
            const cleanText = text
                .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
                .replace(/[^\w\s\u00C0-\u017F\u0400-\u04FF\u4E00-\u9FFF\uAC00-\uD7AF]/g, ' ') // Keep only letters and basic punctuation
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            if (cleanText.length < minLength) {
                return {
                    detectedLanguage: 'en',
                    confidence: 'none',
                    isSupported: true
                };
            }

            const detected = franc(cleanText);
            const mappedLanguage = (FRANC_TO_LOCALE_MAP as Record<string, string>)[detected] || 'en';
            const isSupported = SUPPORTED_LOCALES.includes(mappedLanguage as any);
            
            // Determine confidence based on text length and detection result
            let confidence: 'high' | 'medium' | 'low' | 'none' = 'low';
            
            if (cleanText.length > 300 && detected !== 'und') {
                confidence = 'high';
            } else if (cleanText.length > 150 && detected !== 'und') {
                confidence = 'medium';
            } else if (detected !== 'und') {
                confidence = 'low';
            } else {
                confidence = 'none';
            }

            return {
                detectedLanguage: mappedLanguage,
                confidence,
                isSupported
            };
        } catch (error) {
            console.warn('Language detection failed:', error);
            return {
                detectedLanguage: 'en',
                confidence: 'none',
                isSupported: true
            };
        }
    }, []);

    const validateLanguageConsistency = useCallback((
        fields: Record<string, string>,
        selectedLocale: string
    ): LanguageValidation => {
        const detectedLanguages: Record<string, string> = {};
        const fieldLanguages: string[] = [];
        
        // Detect language for each field with sufficient content
        Object.entries(fields).forEach(([fieldName, text]) => {
            if (text && text.trim().length >= 50) {
                const detection = detectLanguage(text);
                if (detection.confidence !== 'none') {
                    detectedLanguages[fieldName] = detection.detectedLanguage;
                    fieldLanguages.push(detection.detectedLanguage);
                }
            }
        });

        // If no fields have enough content for detection, consider it valid
        if (fieldLanguages.length === 0) {
            return {
                isValid: true,
                conflictingFields: [],
                detectedLanguages: {}
            };
        }

        // Check for consistency between fields
        const uniqueLanguages = [...new Set(fieldLanguages)];
        const dominantLanguage = fieldLanguages.reduce((a, b, i, arr) => 
            arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );

        // Find conflicting fields (different from dominant language)
        const conflictingFields = Object.entries(detectedLanguages)
            .filter(([, lang]) => lang !== dominantLanguage)
            .map(([field]) => field);

        // Check if selected locale matches detected language
        const localeConflict = dominantLanguage !== selectedLocale;

        const hasConflicts = conflictingFields.length > 0 || localeConflict;

        let message = '';
        if (hasConflicts) {
            if (conflictingFields.length > 0) {
                message = t('languageDetection.multipleLanguagesError');
            } else if (localeConflict) {
                message = t('languageDetection.languageMismatchError', {
                    detectedLanguage: dominantLanguage.toUpperCase(),
                    selectedLanguage: selectedLocale.toUpperCase()
                });
            }
        }

        return {
            isValid: !hasConflicts,
            conflictingFields,
            detectedLanguages,
            message
        };
    }, [detectLanguage, t]);

    const getSuggestedLanguage = useCallback((
        fields: Record<string, string>
    ): string | null => {
        const detections = Object.values(fields)
            .filter(text => text && text.trim().length >= 50)
            .map(text => detectLanguage(text))
            .filter(detection => detection.confidence !== 'none' && detection.confidence !== 'low');

        if (detections.length === 0) return null;

        // Return the most confident detection, or the most common one
        const languages = detections.map(d => d.detectedLanguage);
        const languageFreq = languages.reduce((acc, lang) => {
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Return the most frequent language, or if tied, the one with highest confidence
        return Object.keys(languageFreq).reduce((a, b) => 
            languageFreq[a] >= languageFreq[b] ? a : b
        );
    }, [detectLanguage]);

    return useMemo(() => ({
        detectLanguage,
        validateLanguageConsistency,
        getSuggestedLanguage,
        supportedLocales: SUPPORTED_LOCALES
    }), [detectLanguage, validateLanguageConsistency, getSuggestedLanguage]);
};
