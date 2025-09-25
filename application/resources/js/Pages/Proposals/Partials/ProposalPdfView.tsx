import React from 'react';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import Button from '@/Components/atoms/Button';
import ProposalTableView from './ProposalTableView';
import ProposalPdfHeader from './ProposalPdfHeader';
import { PaginatedData } from '@/types/paginated-data';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ColumnKey } from '@/Components/ColumnSelector';
import ProposalData = App.DataTransferObjects.ProposalData;
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import CatalystEyeIcon from '@/Components/svgs/CatalystEyeIcon';

interface ProposalPdfViewProps {
  proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
  listTitle: string;
  isAuthor?: boolean;
  bookmarkCollection: BookmarkCollectionData;
  pageBackgroundColor?: string;
  onOpenSettings?: () => void;
  onOpenShareModal?: () => void;
}

const ProposalPdfView: React.FC<ProposalPdfViewProps> = ({
  proposals,
  isAuthor,
  listTitle,
  bookmarkCollection,
  onOpenSettings,
  onOpenShareModal
}) => {
  const { t } = useLaravelReactI18n();

  const itemCount = proposals.data?.length || 0;

  const defaultPdfColumns: string[] = ['title', 'budget', 'category', 'openSourced', 'teams', 'viewProposal'];

  const {
    value: selectedColumns,
    setValue: setSelectedColumns
  } = useUserSetting<string[]>(
    userSettingEnums.PROPOSAL_PDF_COLUMNS,
    defaultPdfColumns,
  );

  const handleColumnSelectionChange = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  const handleOpenColumnSelector = () => {
    // Scroll to the column selector and draw user's attention to it
    const columnSelectorContainer = document.querySelector('[data-testid="column-selector"]')?.parentElement;
    if (columnSelectorContainer) {
      columnSelectorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      columnSelectorContainer.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
      setTimeout(() => {
        columnSelectorContainer.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
      }, 3000);
    }
  };

  const hasNoColumns = !selectedColumns || selectedColumns.length === 0;

  const shouldShowPagination = bookmarkCollection.list_type !== 'voter';

  return (
    <div className="w-full">
      {/* Header Component */}
      <ProposalPdfHeader
        itemCount={itemCount}
        proposals={proposals.data || []}
        bookmarkCollection={bookmarkCollection}
        selectedColumns={selectedColumns || defaultPdfColumns}
        onOpenShareModal={onOpenShareModal}
      />

      {/* PDF View Content */}
      <div
        className="w-full border-2 border-primary bg-background rounded-b-lg"
        style={{
          marginTop: 0,
        }}
      >
        {/* Title and Logo Row */}
        <div className="flex items-center justify-between px-8 py-7">
          <div className="flex flex-col">
            <div className="flex items-start gap-4 mb-2">
              <Title level='3' className="font-bold text-content">
                {listTitle}
              </Title>
            </div>
            <Paragraph className="text-lg text-gray-persist">
              {t('proposalPdfHeader.votingListExport')}
            </Paragraph>
          </div>

          {/* Right Column - Catalyst Logo */}
          <div className="flex-shrink-0">
            <CatalystLogo className="h-8 sm:h-12 md:h-14 lg:h-16 w-auto" />
          </div>
        </div>

        <div className='border-b border-light-gray-persist/60 mx-8'></div>

        {/* Proposal Table */}
        <div>
          <ProposalTableView
            proposals={proposals}
            actionType="view"
            disableSorting={true}
            columns={selectedColumns || defaultPdfColumns}
            showPagination={shouldShowPagination}
            iconOnlyActions={true}
            iconActionsConfig={isAuthor ? ['rationale', 'removeBookmark', 'compare'] : ['bookmark', 'compare']}
            customStyles={{
              tableWrapper: '!border-table-header-bg !shadow-none rounded-lg',
              tableHeader: '!bg-table-header-bg',
              headerCell: '!text-table-header-text !border-r-0',
              headerText: 'text-table-header-text'
            }}
            headerAlignment="left"
            onColumnSelectorOpen={handleOpenColumnSelector}
            disableInertiaLoading={bookmarkCollection.list_type === 'voter'}
          />
        </div>

        {/* Separator line */}
        <div className='border-b border-light-gray-persist/60 mx-8'></div>

        {/* Footer Section */}
        <div className="flex  items-center justify-center px-8 py-6">
          <div className="flex flex-col items-center gap-3">
            <Paragraph className="flex text-sm text-gray-persist gap-1 items-baseline">
              {t('proposalPdfHeader.footer.generatedWith')} <Paragraph className="text-primary">{t('proposalPdfHeader.footer.catalystExplorer')}</Paragraph>.
            </Paragraph>
            <Paragraph className="flex text-sm text-gray-persist gap-1 items-baseline">
              {t('proposalPdfHeader.footer.visit')} <Paragraph className="text-primary underline">{t('proposalPdfHeader.footer.website')}</Paragraph>
            </Paragraph>
            <Paragraph className="flex text-sm text-gray-persist">
              {t('proposalPdfHeader.footer.empoweringCommunity')} · {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
            </Paragraph>
            <CatalystEyeIcon className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPdfView;
