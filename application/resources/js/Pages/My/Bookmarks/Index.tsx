import React, { useState, useRef, useEffect } from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import BookmarkNavigation from './Partials/BookmarkNavigation';
import BookmarkToolbar from './Partials/BookmarkToolbar';
import { useTranslation } from 'react-i18next';
import BookmarksList from './Partials/BookmarksList';
import ProposalVerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import IdeaScaleProfileLoader from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileLoader';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';

interface IndexProps {
  proposals: any[];
  people: any[];
  groups: any[];
  reviews: any[];
  counts: Record<string, number>;
  filters?: any;
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
    [ParamsEnum.QUERY]: '',
    [ParamsEnum.PAGE]: 1,
    [ParamsEnum.LIMIT]: 10,
    ...filters
  };

  const hasBookmarks =
    proposals.length > 0 ||
    people.length > 0 ||
    groups.length > 0 ||
    reviews.length > 0;

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <Title className="text-2xl font-bold text-gray-600 mb-4">
        {t('noBookmarks')}
      </Title>
      <Paragraph className="text-gray-500 max-w-md">
        {t('noBookmarksYet')}
      </Paragraph>
    </div>
  );

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
              <Head title="My Bookmarks" />

              <div ref={headerRef} className="px-8 py-4">
                  <Title level="1">{t('bookmarks.myBookmarks')}</Title>
                  <Paragraph>{t('bookmark')}</Paragraph>
              </div>

              {!hasBookmarks ? (
                  renderEmptyState()
              ) : (
                  <>
                      <div className="sticky top-0 z-10 mx-auto flex w-full flex-col gap-4 px-8 py-4 pt-6 pb-4 backdrop-blur-md">
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
                              <BookmarkToolbar />
                          </div>
                      </div>

                      <main className="mt-6 flex w-full flex-col justify-center px-8 py-4">
                          <div
                              ref={(el) => (sectionsRef.current.proposals = el)}
                              className="mb-12"
                          >
                              <Title
                                  level="2"
                                  className="mb-4 text-2xl font-bold"
                              >
                                  {t('Proposals')}
                              </Title>
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
                              ref={(el) => (sectionsRef.current.people = el)}
                              className="mb-12"
                          >
                              <Title
                                  level="2"
                                  className="mb-4 text-2xl font-bold"
                              >
                                  {t('People')}
                              </Title>
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
                              ref={(el) => (sectionsRef.current.groups = el)}
                              className="mb-12"
                          >
                              <Title
                                  level="2"
                                  className="mb-4 text-2xl font-bold"
                              >
                                  {t('Groups')}
                              </Title>
                              <BookmarksList
                                  proposals={[]}
                                  people={[]}
                                  groups={groups}
                                  reviews={[]}
                                  activeType="groups"
                              />
                          </div>

                          <div
                              ref={(el) => (sectionsRef.current.reviews = el)}
                              className="mb-12"
                          >
                              <Title
                                  level="2"
                                  className="mb-4 text-2xl font-bold"
                              >
                                  {t('Reviews')}
                              </Title>
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
              )}
          </>
      </FiltersProvider>
  );
};

export default Index;
