import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Error404() {
    return (
        <AppLayout>
            <Head title="404 - Page Not Found">
                <meta name="robots" content="noindex" />
            </Head>
            
            <main className="flex flex-1 flex-col items-center justify-center px-4 text-center bg-background-lighter min-h-[80vh] rounded-tl-4xl">
                <div className="space-y-6">
                    {/* 404 Text */}
                    <h1 className="text-[120px] font-bold leading-none text-gray-400 dark:text-white/50">
                        404
                    </h1>

                    {/* Telescope Illustration */}
                    <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
                        <img 
                            src="/images/404-telescope.svg" 
                            alt="404 Telescope" 
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Error Message */}
                    <div className="space-y-2">
                        <p className="text-lg text-gray-400 dark:text-white">
                            Sorry, we couldn't find what you're looking for.<br />
                            Let's find your way back!
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/proposals"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            Proposals
                        </Link>
                        <Link
                            href="/funds"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            Funds
                        </Link>
                        <Link
                            href="/knowledgebase"
                            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                        >
                            Knowledgebase
                        </Link>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}