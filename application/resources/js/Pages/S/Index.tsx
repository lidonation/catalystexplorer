import Title from '@/Components/atoms/Title';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import {
    SearchResultCounts,
    SearchResultData,
    TabConfig,
} from '@/types/search';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useRef, useState } from 'react';
import DynamicSearchResults from './Partials/DynamicSearchResults';
import ResultTabs from './Partials/ResultTabs';
import SearchResultsLoading from './Partials/SearchResultsLoading';

interface SearchResultsProps extends SearchResultData {
    counts: SearchResultCounts;
}

const SearchResults = ({ counts, ...results }: SearchResultsProps) => {
    const search = window.location.search;
    const { t } = useLaravelReactI18n();
    const params = new URLSearchParams(search);
    const query = params.get('q');
    const filters = params.get('f');
    const [activeTab, setActiveTab] = useState('');
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Add early validation
    if (!query) {
        return (
            <div className="w-full px-4 py-8">
                <RecordsNotFound context="search" />
            </div>
        );
    }

    // Define all possible tabs explicitly
    const allTabs = ['proposals', 'ideascaleProfiles', 'groups', 'communities', 'reviews', 'articles'];

    const filteredFilters = filters
        ? filters
              .split(',')
              .filter(
                  (filter) => counts[filter as keyof SearchResultCounts] > 0,
              )
        : allTabs.filter(
              (filter) => counts[filter as keyof SearchResultCounts] > 0,
          );

    const TAB_CONFIG: TabConfig[] = filteredFilters.map((filter) => ({
        name: filter as keyof SearchResultData,
        label:
            t(`searchResults.tabs.${filter}`).charAt(0).toUpperCase() +
            t(`searchResults.tabs.${filter}`).slice(1),
    }));

    // Debug logging
    console.log('Search Debug Info:', {
        counts,
        filteredFilters,
        TAB_CONFIG,
        query,
        filters
    });

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px 0px 0px',
            threshold: 0.1,
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const tabName = sectionId.replace('section-', '');
                    setActiveTab(tabName);
                }
            });
        }, observerOptions);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const setupObserver = () => {
            const sections = document.querySelectorAll(
                'section[id^="section-"]',
            );
            if (sections.length > 0) {
                sections.forEach((section) => {
                    observerRef.current?.observe(section);
                });
                return true;
            }
            return false;
        };

        if (TAB_CONFIG.length > 0) {
            setActiveTab(TAB_CONFIG[0].name);
        }

        if (!setupObserver()) {
            const timeout = setTimeout(() => {
                setupObserver();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [TAB_CONFIG.length]);

    // Scroll to the section when the page loads
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            history.pushState(
                '',
                document.title,
                window.location.pathname + window.location.search,
            );

            setTimeout(() => {
                const targetId = hash.replace('#', '');
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, '', hash);
                }
            }, 100);
        }
    }, []);

    if (TAB_CONFIG.length === 0) {
        return (
            <div className="w-full px-4 py-8">
                <RecordsNotFound context="search" />
            </div>
        );
    }

    return (
        <>
            <Head title="Search Results" />
            <div className="min-h-screen">
                <div className="sticky top-0 z-50 backdrop-blur-md">
                    <div className="w-full px-4 py-4">
                        <div className="mb-4 flex w-full flex-col">
                            <Title level="3">
                                {t('searchResults.results.title')}
                            </Title>
                        </div>
                        <ResultTabs
                            counts={counts}
                            tabConfig={TAB_CONFIG}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                </div>

                <div className="flex w-full flex-col gap-16 scroll-smooth px-4 py-8">
                    {TAB_CONFIG.map((tab) => (
                        <section
                            key={tab.name}
                            className="min-h-screen w-full scroll-mt-[120px]"
                            id={`section-${tab.name}`}
                        >
                            <WhenVisible
                                data={tab.name}
                                fallback={
                                    <SearchResultsLoading
                                        type={tab.name}
                                        count={
                                            counts[
                                                tab.name as keyof SearchResultCounts
                                            ] || 0
                                        }
                                    />
                                }
                            >
                                <div className="flex w-full flex-col gap-2">
                                    <DynamicSearchResults
                                        name={tab.name}
                                        data={results[tab.name] as any}
                                    />
                                </div>
                            </WhenVisible>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SearchResults;
