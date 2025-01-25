import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from 'react-i18next';

export default function Error404() {
    const { t } = useTranslation();
    
    return (
        <AppLayout>
            <Head title={t('error.404Title')}>
                <meta name="robots" content="noindex" />
            </Head>
            
            <main className="flex flex-1 flex-col items-center justify-center px-4 text-center bg-background-lighter min-h-[80vh] rounded-tl-4xl">
                <div className="space-y-6">
                    <h1 className="text-[120px] font-bold leading-none text-gray-400 dark:text-white/50">
                        404
                    </h1>

                    {/* Telescope Illustration */}
                    <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
                        <img 
                            src="/images/404-telescope.svg" 
                            alt={t('error.telescopeAlt')}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg text-gray-400 dark:text-white">
                            {t('error.notFound')}<br />
                            {t('error.findWayBack')}
                        </p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            {t('home')}
                        </Link>
                        <Link
                            href="/proposals"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            {t('proposals.proposals')}
                        </Link>
                        <Link
                            href="/funds"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            {t('funds.funds')}
                        </Link>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}