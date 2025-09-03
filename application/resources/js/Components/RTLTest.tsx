import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function RTLTest() {
    const { t, currentLocale } = useLaravelReactI18n();
    const isRTL = currentLocale() === 'ar';

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-3xl font-bold text-primary">
                {t('Test RTL Support')} - Current Locale: {currentLocale()}
            </h1>
            
            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">{t('Text Alignment Test')}</h2>
                <p className="text-left mb-2">This text should align to the right in Arabic (text-left class)</p>
                <p className="text-right mb-2">This text should align to the left in Arabic (text-right class)</p>
                <p className="text-center">This text should remain centered</p>
            </div>

            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">{t('Margin Test')}</h2>
                <div className="ml-4 p-2 bg-primary-light">ml-4: Should have right margin in Arabic</div>
                <div className="mr-4 p-2 bg-primary-light mt-2">mr-4: Should have left margin in Arabic</div>
            </div>

            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">{t('Padding Test')}</h2>
                <div className="pl-4 bg-primary-light border-l-4 border-primary">pl-4 + border-l-4: Should have right padding and right border in Arabic</div>
                <div className="pr-4 bg-primary-light border-r-4 border-primary mt-2">pr-4 + border-r-4: Should have left padding and left border in Arabic</div>
            </div>

            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">{t('Flexbox Test')}</h2>
                <div className="flex justify-between items-center">
                    <span>Start</span>
                    <span>Middle</span>
                    <span>End</span>
                </div>
            </div>

            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">{t('Sample Arabic Text')}</h2>
                <div className="space-y-2">
                    <p>{t('activeFund')}</p>
                    <p>{t('authMessage')}</p>
                    <p>{t('bookmark')}</p>
                    <p>{t('copyright')}</p>
                </div>
            </div>

            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">{t('Form Elements Test')}</h2>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder={t('Search query')}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <textarea 
                        placeholder={t('Enter your message')}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                    />
                    <button className="bg-primary text-white px-4 py-2 rounded">
                        {t('submit')}
                    </button>
                </div>
            </div>

            <div className="bg-background-lighter p-4 rounded-lg">
                <h2 className="text-xl mb-4">Direction Debug Info</h2>
                <ul className="space-y-1 text-sm">
                    <li>HTML dir attribute: {document.documentElement.dir}</li>
                    <li>HTML lang attribute: {document.documentElement.lang}</li>
                    <li>Current locale from i18n: {currentLocale()}</li>
                    <li>Is RTL: {isRTL.toString()}</li>
                </ul>
            </div>
        </div>
    );
}
