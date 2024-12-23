import {
    SearchResultCounts,
    SearchResultData,
    TabConfig,
} from '@/types/search';
import { TabGroup } from '@headlessui/react';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DynamicSearchResults, {
    EmptyState,
} from './Partials/DynamicSearchResults';
import ResultTabs from './Partials/ResultTabs';
import SearchResultsLoading from './Partials/SearchResultsLoading';

interface SearchResultsProps extends SearchResultData {
    counts: SearchResultCounts;
}

export const TAB_CONFIG: TabConfig[] = [];

const HEADER_HEIGHT = 120;

const SearchResults = ({ counts, ...results }: SearchResultsProps) => {
    const search = window.location.search;
    const { t } = useTranslation();
    const params = new URLSearchParams(search);
    const query = params.get('q');
    const filters = params.get('f');
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

    const filteredFilters = filters
        ? filters
              .split(',')
              .filter(
                  (filter) => counts[filter as keyof SearchResultCounts] > 0,
              )
        : Object.keys(t('searchResults.tabs', { returnObjects: true })).filter(
              (filter) => counts[filter as keyof SearchResultCounts] > 0,
          );

    useEffect(() => {
        TAB_CONFIG.length = 0;
        filteredFilters.forEach((filter) => {
            TAB_CONFIG.push({
                name: filter as keyof SearchResultData,
                label:
                    t(`searchResults.tabs.${filter}`).charAt(0).toUpperCase() +
                    t(`searchResults.tabs.${filter}`).slice(1),
            });
        });
    }, [filteredFilters]);

    useEffect(() => {
        const handleScroll = () => {
            if (isScrolling) return;

            const scrollPosition = window.scrollY + HEADER_HEIGHT;

            const activeSection = sectionRefs.current.findIndex((section) => {
                if (!section) return false;

                const rect = section.getBoundingClientRect();
                const sectionTop = window.scrollY + rect.top;
                const sectionBottom = sectionTop + rect.height;

                return (
                    scrollPosition >= sectionTop &&
                    scrollPosition < sectionBottom
                );
            });

            if (activeSection !== -1 && activeSection !== activeTab) {
                setActiveTab(activeSection);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isScrolling, activeTab]);

    const handleTabChange = (index: number) => {
        setIsScrolling(true);
        setActiveTab(index);

        const section = sectionRefs.current[index];
        if (section) {
            const sectionTop = section.getBoundingClientRect().top;
            const scrollPosition =
                window.pageYOffset + sectionTop - HEADER_HEIGHT;

            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth',
            });
        }

        setTimeout(() => {
            setIsScrolling(false);
        }, 1000);
    };

    if (TAB_CONFIG.length === 0) {
        return (
            <div className="container py-8">
                <EmptyState query={query as string} translation={t} />
            </div>
        );
    }
    
    return (
        <>
            <Head title="Search Results" />
            <div className="min-h-screen">
                <div className="sticky top-0 z-50 backdrop-blur-md">
                    <div className="container px-4 py-4">
                        <div className="mb-4 flex w-full flex-col">
                            <h1 className="title-3">
                                {t('searchResults.results.title', { query })}
                            </h1>
                        </div>
                        <TabGroup
                            selectedIndex={activeTab}
                            onChange={handleTabChange}
                        >
                            <ResultTabs
                                counts={counts}
                                tabConfig={TAB_CONFIG}
                            />
                        </TabGroup>
                    </div>
                </div>

                <div className="container flex flex-col gap-16 py-8">
                    {TAB_CONFIG.map((tab, index) => (
                        <section
                            key={tab.name}
                            ref={(el: any) => (sectionRefs.current[index] = el)}
                            className="min-h-screen scroll-mt-[120px]"
                            id={`section-${tab.name}`}
                        >
                            <WhenVisible
                                data={tab.name}
                                fallback={
                                    <SearchResultsLoading
                                        type={tab.name}
                                        count={5}
                                    />
                                }
                            >
                                <div className="flex flex-col gap-2">
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
