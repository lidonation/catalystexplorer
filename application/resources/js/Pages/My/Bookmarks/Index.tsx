import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import BookmarkNavigation from './Partials/BookmarkNavigation';
import BookmarkToolbar from './Partials/BookmarkToolbar';
import { useTranslation } from 'react-i18next';
import BookmarksList from './Partials/BookmarksList';

interface IndexProps {
  proposals: any[];
  people: any[];
  groups: any[];
  reviews: any[];
  counts: Record<string, number>;
}

const Index: React.FC<IndexProps> = ({ proposals, people, reviews, groups, counts }) => {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<string | null>('proposals');

  return (
      <>
          <Head title="My Bookmarks"/>

          <header>
              <div className='container'>
                  <h1 className="title-1">{t('My Bookmarks')}</h1>
              </div>
              <div className='container'>
                  {t('bookmark')}
                  <BookmarkNavigation 
                      counts={counts} 
                      activeType={activeType} 
                      onTypeChange={setActiveType}
                  />
                  <BookmarkToolbar/>
              </div>
          </header>

          <main className="container mt-6">
              {activeType && (
                  <BookmarksList 
                      proposals={proposals}
                      people={people}
                      groups={groups}
                      reviews={reviews}
                      activeType={activeType}
                  />
              )}
          </main>
      </>
  );
};

export default Index;
