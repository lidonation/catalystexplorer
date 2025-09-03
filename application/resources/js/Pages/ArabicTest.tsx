import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function ArabicTest() {
    const { t, currentLocale } = useLaravelReactI18n();
    
    return (
        <>
            <Head title={`${t('Test Arabic')} - ${currentLocale()}`} />
            <div className="min-h-screen bg-background-lighter p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-primary">
                        اختبار اللغة العربية - Arabic Language Test
                    </h1>
                    
                    <div className="grid gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-semibold mb-4 text-primary">
                                {t('activeFund')}
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {t('authMessage')}
                            </p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-semibold mb-4 text-primary">
                                معلومات الاتجاه - Direction Info
                            </h2>
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Current Locale:</strong> {currentLocale()}</li>
                                <li><strong>HTML Dir:</strong> {typeof document !== 'undefined' ? document.documentElement.dir : 'server-side'}</li>
                                <li><strong>HTML Lang:</strong> {typeof document !== 'undefined' ? document.documentElement.lang : 'server-side'}</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-semibold mb-4 text-primary">
                                أمثلة التنسيق - Layout Examples  
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                    <span>بداية</span>
                                    <span>وسط</span>
                                    <span>نهاية</span>
                                </div>
                                <div className="text-right bg-blue-50 p-4 rounded">
                                    هذا النص يجب أن يظهر من اليمين إلى اليسار
                                </div>
                                <div className="text-left bg-green-50 p-4 rounded">
                                    This English text should appear left-to-right even in RTL mode
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-semibold mb-4 text-primary">
                                نموذج اختبار - Form Test
                            </h2>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('name')}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        placeholder={t('name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('email')}
                                    </label>
                                    <input 
                                        type="email" 
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        placeholder={t('emailAddress')}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    إرسال - Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
