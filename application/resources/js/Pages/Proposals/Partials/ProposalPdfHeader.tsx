import React from 'react';
import { ChevronDown, ChevronDownCircle, ChevronLeft, Download, Image } from 'lucide-react';
import Paragraph from '../../../Components/atoms/Paragraph';
import DropdownMenu from '../../Bookmarks/Partials/DropdownMenu';
import ShareIcon from '../../../Components/svgs/ShareIcon';
import CompareIcon from '@/Components/svgs/CompareIcon';
import ConfirmationModal from '@/Components/ConfirmationModal';
import ModalNavLink from '@/Components/ModalNavLink';
import { IndexedDBService } from '@/Services/IndexDbService';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalData = App.DataTransferObjects.ProposalData;
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import PdfIcon from '@/Components/svgs/PdfIcon';

interface ProposalPdfHeaderProps {
  itemCount: number;
  proposals: ProposalData[];
  bookmarkCollection: BookmarkCollectionData;
  selectedColumns?: string[];
}

const ProposalPdfHeader: React.FC<ProposalPdfHeaderProps> = ({ 
  itemCount, 
  proposals,
  bookmarkCollection,
  selectedColumns
}) => {
  const { t } = useLaravelReactI18n();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  const existingComparisons = useLiveQuery(
    async () => await IndexedDBService.getAll('proposal_comparisons'),
    []
  );
  const hasExistingComparisons = (existingComparisons?.length ?? 0) > 0;

  useEffect(() => {
    if (shouldOpenModal) {
      setTimeout(() => {
        const modalLink = document.querySelector('[data-testid="compare-all-button"]') as HTMLElement;
        if (modalLink) {
          modalLink.click();
          setShouldOpenModal(false);
        }
      }, 10);
    }
  }, [shouldOpenModal]);

  const handleCompareAllClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!proposals || proposals.length === 0) {
      return;
    }

    if (hasExistingComparisons) {
      setShowConfirmModal(true);
    } else {
      await handleConfirmCompare();
      setShouldOpenModal(true);
    }
  };

  const handleConfirmCompare = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
    
      await IndexedDBService.clear('proposal_comparisons');
      
      // Add all proposals to comparison list
      const addPromises = proposals.map((proposal, index) => {
        const proposalData = {
          ...proposal,
          hash: proposal.id ?? '',
          order: proposals.length - index, // Reverse order to match the expected sorting
        } as ProposalData;
        
        return IndexedDBService.create('proposal_comparisons', proposalData);
      });
      
      await Promise.all(addPromises);
      
    } catch (error) {
      console.error('Failed to add proposals to comparison:', error);
      
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleModalConfirm = async () => {
    await handleConfirmCompare();
    setShouldOpenModal(true);
  };

  const foldSize = 73;
  const mobileFoldOffset = 4; // Reduce fold offset on mobile for more space

  return (
    <div 
      className="relative w-full bg-primary rounded-t-lg"
      style={{
        clipPath: `polygon(${foldSize}px 0, 100% 0, 100% 100%, 0 100%, 0 ${foldSize}px)`,
        height: `${foldSize}px`
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${foldSize}px`,
          height: `${foldSize}px`,
          zIndex: 3,
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="73" 
          height="73" 
          viewBox="0 0 73 73" 
          fill="none"
          style={{ width: '100%', height: '100%' }}
        >
          <g filter="url(#filter0_i_18554_7228)">
            <path d="M73 0C64.3602 8.63984 61.8905 19.7862 62.4507 36.2137C62.4507 55.9424 51.2617 63.8783 32.1653 63.8783C11.7598 63.1237 6.55747 66.1657 0 73L73 0Z" fill="url(#paint0_linear_18554_7228)"/>
          </g>
          <defs>
            <filter id="filter0_i_18554_7228" x="-3.5" y="0" width="76.5" height="76.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dx="-3.5" dy="3.5"/>
              <feGaussianBlur stdDeviation="2.5"/>
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"/>
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow_18554_7228"/>
            </filter>
            <linearGradient id="paint0_linear_18554_7228" x1="58.1296" y1="53.9866" x2="36.5" y2="29.853" gradientUnits="userSpaceOnUse">
              <stop offset="0.0701142" stopColor="#E6E6E6"/>
              <stop offset="0.699285" stopColor="#BEBEBE"/>
              <stop offset="1" stopColor="#ECECEC"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main content area for the buttons */}
      <div 
        className="relative flex items-center justify-end w-full pl-0 pr-2 sm:pr-4 md:pr-6 gap-0.5 sm:gap-1 md:gap-4 overflow-hidden" 
        style={{ 
          zIndex: 5,
          paddingLeft: `${foldSize + 2}px`, // Minimal padding to just avoid the fold
          height: `${foldSize}px`,
          marginLeft: 0
        }}
      >
        {/* Compare Button */}
        {shouldOpenModal ? (
          <ModalNavLink
            href="#proposal-comparison"
            className="flex items-center justify-center px-1 sm:px-2 md:px-5 h-[36px] sm:h-[40px] md:h-[50px] py-1 sm:py-2 md:py-3 bg-background rounded-md sm:rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 min-w-0 flex-shrink text-primary"
            dataTestid="compare-all-button"
          >
           <CompareIcon width={20} />
            <Paragraph size="sm" className="ml-1 sm:ml-2 font-semibold text-primary text-xs sm:text-sm whitespace-nowrap hidden md:block">
              {t('proposalPdfHeader.compareAllItems', { count: itemCount })}
            </Paragraph>
            <Paragraph size="sm" className="ml-0.5 sm:ml-1 font-semibold text-primary text-xs hidden sm:block md:hidden">
              {t('proposalPdfHeader.compare')}
            </Paragraph>
          </ModalNavLink>
        ) : (
          <div 
            onClick={handleCompareAllClick}
            className={`inline-block cursor-pointer ${isLoading || !proposals || proposals.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
          >
            <div className="flex items-center justify-center px-1 sm:px-2 md:px-5 h-[36px] sm:h-[40px] md:h-[50px] py-1 sm:py-2 md:py-3 bg-background rounded-md sm:rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 min-w-0 flex-shrink text-primary">
             <CompareIcon width={20} />
              <Paragraph size="sm" className="ml-1 sm:ml-2 font-semibold text-primary text-xs sm:text-sm whitespace-nowrap hidden md:block">
                {isLoading ? t('proposalPdfHeader.adding') : t('proposalPdfHeader.compareAllItems', { count: itemCount })}
              </Paragraph>
              <Paragraph size="sm" className="ml-0.5 sm:ml-1 font-semibold text-primary text-xs hidden sm:block md:hidden">
                {isLoading ? t('proposalPdfHeader.add') : t('proposalPdfHeader.compare')}
              </Paragraph>
            </div>
          </div>
        )}

        {/* Download Button Group */}
        <DropdownMenu
          items={[
            {
              label: t('proposalPdfHeader.downloadPdf'),
              onClick: () => {
                // Construct the URL with selected columns if available
                let url = `/lists/${bookmarkCollection.id}/proposals/download-pdf`;
                
                // Add selected columns as query parameter if available
                if (selectedColumns && selectedColumns.length > 0) {
                  // Filter out 'viewProposal' column as it's not needed for PDF
                  const pdfColumns = selectedColumns.filter(col => col !== 'viewProposal');
                  if (pdfColumns.length > 0) {
                    const columnsParam = encodeURIComponent(JSON.stringify(pdfColumns));
                    url += `?columns=${columnsParam}`;
                  }
                }
                
                window.open(url, '_blank');
              },
              icon: <PdfIcon className="w-5 h-5" />,
              iconPosition: 'left',
              isDefault: true,
            },
            {
              label: t('proposalPdfHeader.shareOnX'),
              onClick: () => {
                // Handle share on X
              },
              icon: <ShareIcon className="w-5 h-5" />,
              iconPosition: 'left',
              disabled: false,
              disabledTooltip: t('proposalPdfHeader.comingSoon')
            },
            {
              label: t('proposalPdfHeader.downloadImage'),
              onClick: () => {
                // Handle image download
              },
              icon: <Image className="w-5 h-5" />,
              iconPosition: 'left',
              disabled: true,
              disabledTooltip: t('proposalPdfHeader.comingSoon')
            }
          ]}
          className="relative"
          dropdownClassName="bg-background border border-gray-200 rounded-lg shadow-lg overflow-visible"
          matchButtonWidth={true}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleModalConfirm}
        title={t('proposalPdfHeader.replaceComparisonListTitle')}
        confirmText={t('proposalPdfHeader.continue')}
        cancelText={t('proposalPdfHeader.cancel')}
        variant="warning"
        isLoading={isLoading}
      >
        <Paragraph className="text-sm text-gray-persist">
          {hasExistingComparisons
            ? t('proposalPdfHeader.replaceComparisonListMessage', { 
                count: existingComparisons?.length ?? 0, 
                newCount: itemCount 
              })
            : t('proposalPdfHeader.addComparisonListMessage', { count: itemCount })}
        </Paragraph>
      </ConfirmationModal>
    </div>
  );
};

export default ProposalPdfHeader;
