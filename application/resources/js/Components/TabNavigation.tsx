import {Link} from '@inertiajs/react';
import type {Tab} from '@/utils/routeTabs';
import {useEffect, useRef, useCallback} from 'react';

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    centerTabs?: boolean;
    className?: string;
    tabClassName?: string;
    activeTabClassName?: string;
    wrapperClassName?: string;
}

export default function TabNavigation({
    tabs, 
    activeTab, 
    centerTabs = true,
    className = "min-w-max border-b border-gray-100",
    tabClassName = "whitespace-nowrap text-sm md:text-base px-1 md:px-2 py-1 group flex items-center gap-1 outline-hidden transition-colors hover:text-gray-700 font-bold text-gray-500",
    activeTabClassName = "-mb-px border-b-4 !text-[#2596BE] border-b-[#2596BE]",
    wrapperClassName = "mt-3 md:mt-6 text-content-lighter overflow-x-auto overflow-y-hidden pb-1 lg:overflow-x-hidden"
}: TabNavigationProps) {
    const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const navRef = useRef<HTMLElement>(null);

    const centerTabInView = useCallback((tabIndex: number) => {
        if (!centerTabs || !navRef.current || tabIndex < 0 || tabIndex >= tabs.length) return;
        
        const tabRef = tabRefs.current[tabIndex];
        if (!tabRef) return;
        
        const scrollContainer = navRef.current.closest('[class*="overflow-x-auto"]');
        if (!scrollContainer) return;
        
        const containerRect = scrollContainer.getBoundingClientRect();
        const tabRect = tabRef.getBoundingClientRect();
        
        const isTabFullyVisible = 
            tabRect.left >= containerRect.left - 5 && 
            tabRect.right <= containerRect.right + 5;
        
        if (tabIndex === tabs.length - 1) {
            if (!isTabFullyVisible && tabRect.right > containerRect.right) {
                scrollContainer.scrollTo({
                    left: scrollContainer.scrollLeft + (tabRect.right - containerRect.right) + 10,
                    behavior: 'auto'
                });
            }
            return;
        }
        
        if (isTabFullyVisible) {
            const prevTabRect = tabIndex > 0 ? tabRefs.current[tabIndex - 1]?.getBoundingClientRect() : null;
            const nextTabRect = tabIndex < tabs.length - 1 ? tabRefs.current[tabIndex + 1]?.getBoundingClientRect() : null;
            
            const hasInvisibleNeighbor = 
                (prevTabRect && prevTabRect.left < containerRect.left - 5) ||
                (nextTabRect && nextTabRect.right > containerRect.right + 5);
            
            if (!hasInvisibleNeighbor) return;
        }
        
        scrollContainer.scrollTo({
            left: scrollContainer.scrollLeft + (tabRect.left - containerRect.left) - 
                 (containerRect.width / 2) + (tabRect.width / 2),
            behavior: 'auto'
        });
    }, [centerTabs, tabs.length]);

    useEffect(() => {
        tabRefs.current = tabRefs.current.slice(0, tabs.length);
        
        if (!centerTabs) return;
        
        const activeTabIndex = tabs.findIndex(tab => tab.name === activeTab);
        if (activeTabIndex !== -1) {
            const timer = setTimeout(() => centerTabInView(activeTabIndex), 100);
            return () => clearTimeout(timer);
        }
    }, [activeTab, tabs, centerTabs, centerTabInView]);

    return (
        <div className={wrapperClassName}>
            <nav className={className} ref={navRef}>
                <div className="flex flex-row gap-2 md:gap-4">
                    {tabs.map((tab, index) => {
                        const isActive = activeTab === tab.name;

                        return (
                            <Link
                                key={tab.routeName}
                                href={tab.href}
                                only={[...(tab.only ?? [])]}
                                ref={(el: HTMLAnchorElement | null) => tabRefs.current[index] = el}
                                preserveScroll
                                preserveState
                                className={`${tabClassName} ${isActive ? activeTabClassName : ''}`}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}