import React, { useState, useRef, useEffect } from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import BookmarkNavigation from './Partials/BookmarkNavigation';
import BookmarkToolbar from './Partials/BookmarkToolbar';
import { useTranslation } from 'react-i18next';
import BookmarksList from './Partials/BookmarksList';
import ProposalVerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import IdeaScaleProfileLoader from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileLoader';

interface IndexProps {
  proposals: any[];
  people: any[];
  groups: any[];
  reviews: any[];
  counts: Record<string, number>;
  filters?: any; // Add this to match the props passed from the backend
}

const Index: React.FC<IndexProps> = ({ 
  proposals, 
  people, 
  reviews, 
  groups, 
  counts, 
  filters = URLSearchParams
}) => {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<string | null>('proposals');
  const headerRef = useRef<HTMLDivElement>(null);

  const sectionsRef = useRef<Record<string, HTMLDivElement | null>>({
    proposals: null,
    people: null,
    groups: null,
    reviews: null
  });

  const sectionTypes = {
    proposals: 'proposals',
    people: 'people',
    groups: 'groups',
    reviews: 'reviews'
  };  

  const defaultFilters = {
    [ProposalParamsEnum.QUERY]: '',
    [ProposalParamsEnum.PAGE]: 1,
    [ProposalParamsEnum.LIMIT]: 10,
    ...filters
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      const currentSection = Object.entries(sectionsRef.current).find(([, ref]) => {
        if (!ref) return false;
        const { top, bottom } = ref.getBoundingClientRect();
        const sectionTop = top + window.scrollY;
        const sectionBottom = bottom + window.scrollY;
        return scrollPosition >= sectionTop && scrollPosition <= sectionBottom;
      });

      if (currentSection) {
        const [sectionKey] = currentSection;
        const type = sectionTypes[sectionKey as keyof typeof sectionTypes];
        setActiveType(type);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (type: string) => {
    const sectionKey = Object.keys(sectionTypes).find(key => sectionTypes[key as keyof typeof sectionTypes] === type);
    if (sectionKey && sectionsRef.current[sectionKey]) {
      sectionsRef.current[sectionKey]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <FiltersProvider defaultFilters={defaultFilters}>
    <>
      <Head title="My Bookmarks"/>

      <div ref={headerRef} className="container">
        <h1 className="title-1">{t('My Bookmarks')}</h1>
      </div>

      <div className="container sticky top-0 z-10 mx-auto flex w-full flex-col gap-4 pb-4 pt-6 backdrop-blur-md">
        <div className="items-center gap-2">
          <BookmarkNavigation 
              counts={counts} 
              activeType={activeType} 
              onTypeChange={scrollToSection}
              proposals={proposals}
              people={people}
              groups={groups}
              reviews={reviews}
          />
          <BookmarkToolbar/>
        </div>
      </div>

      <main className="container mt-6">
        <div 
          ref={(el) => sectionsRef.current.proposals = el} 
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">{t('Proposals')}</h2>
          <WhenVisible
            fallback={<ProposalVerticalCardLoading />}
            data="proposals"
          >
            <BookmarksList 
              proposals={proposals}
              people={[]}
              groups={[]}
              reviews={[]}
              activeType="proposals"
            />
          </WhenVisible>
        </div>

        <div 
          ref={(el) => sectionsRef.current.people = el} 
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">{t('People')}</h2>
          <WhenVisible
            fallback={<IdeaScaleProfileLoader />}
            data="people"
          >
            <BookmarksList 
              proposals={[]}
              people={people}
              groups={[]}
              reviews={[]}
              activeType="people"
            />
          </WhenVisible>
        </div>

        <div 
          ref={(el) => sectionsRef.current.groups = el} 
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">{t('Groups')}</h2>
          <BookmarksList 
            proposals={[]}
            people={[]}
            groups={groups}
            reviews={[]}
            activeType="groups"
          />
        </div>

        <div 
          ref={(el) => sectionsRef.current.reviews = el} 
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">{t('Reviews')}</h2>
          <BookmarksList 
            proposals={[]}
            people={[]}
            groups={[]}
            reviews={reviews}
            activeType="reviews"
          />
        </div>
      </main>
    </>
    </FiltersProvider>
  );
};

export default Index;
