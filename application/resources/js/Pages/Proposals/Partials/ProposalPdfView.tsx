import React from 'react';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import Button from '@/Components/atoms/Button';
import ProposalTableView from './ProposalTableView';
import ProposalPdfHeader from './ProposalPdfHeader';
import { PaginatedData } from '@/types/paginated-data';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ColumnKey } from '@/Components/ColumnSelector';
import ProposalData = App.DataTransferObjects.ProposalData;
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import CatalystEyeIcon from '@/Components/svgs/CatalystEyeIcon';

interface ProposalPdfViewProps {
  proposals: PaginatedData<ProposalData[]> | { data: ProposalData[], total: number, isPdf: boolean };
  listTitle: string;
  isAuthor?: boolean;
  pageBackgroundColor?: string;
  onOpenSettings?: () => void;
}

const ProposalPdfView: React.FC<ProposalPdfViewProps> = ({
  proposals,
  isAuthor,
  listTitle,
  onOpenSettings
}) => {
  const { t } = useLaravelReactI18n();

  const itemCount = proposals.data?.length || 0;

  const defaultPdfColumns: ColumnKey[] = ['title', 'budget', 'category', 'openSourced', 'teams', 'viewProposal'];

  const {
    value: selectedColumns,
  } = useUserSetting<ColumnKey[]>(
    userSettingEnums.PROPOSAL_PDF_COLUMNS,
    defaultPdfColumns,
  );

  const hasNoColumns = !selectedColumns || selectedColumns.length === 0;

  // Check if viewProposal column is selected to enable icon actions
  const showIconActions = selectedColumns?.includes('viewProposal') ?? false;

  return (
    <div className="w-full">
      {/* Header Component */}
      <ProposalPdfHeader
        itemCount={itemCount}
        proposals={proposals.data || []}
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
            <Title level='3' className="font-bold text-content mb-2">
              {listTitle}
            </Title>
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

        {/* Proposal Table or Settings Button */}
        <div>
          {hasNoColumns && onOpenSettings ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <Paragraph className="text-lg text-gray-persist mb-4 text-center">
                {t('workflows.voterList.noColumnsSelected')}
              </Paragraph>
              <Button
                onClick={onOpenSettings}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                dataTestId="open-settings-button"
              >
                {t('workflows.voterList.editMetrics')}
              </Button>
            </div>
          ) : (
            <ProposalTableView
              proposals={proposals}
              actionType="view"
              disableSorting={true}
              columns={selectedColumns || defaultPdfColumns}
              showPagination={false}
              iconOnlyActions={showIconActions && isAuthor}
              iconActionsConfig={['rationale', 'removeBookmark', 'compare']}
              customStyles={{
                tableWrapper: '!border-table-header-bg !shadow-none rounded-lg',
                tableHeader: '!bg-table-header-bg',
                headerCell: '!text-table-header-text !border-r-0',
                headerText: 'text-table-header-text'
              }}
              headerAlignment="left"
              {...(!showIconActions && {
                renderActions: {
                  view: () => null
                }
              })}
            />
          )}
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
