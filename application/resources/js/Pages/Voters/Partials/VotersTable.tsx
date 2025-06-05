import Paginator from '@/Components/Paginator';
import ToolTipHover from '@/Components/ToolTipHover';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import VoterData = App.DataTransferObjects.VoterData;
import { VoterEnums } from '@/enums/voter-search-enums';

interface VotersTableProps {
    voters?: PaginatedData<VoterData[]>;
    customTitle?: string;
}

const TableHeader: React.FC<{ label: string; isLastColumn?: boolean }> = ({ label, isLastColumn }) => (
    <th className={`border-gray-persist/20 text-gray-persist ${isLastColumn ? 'border-dark-light' : 'bg-background-lighter border-r'} border-b px-4 py-3 text-left font-medium`}>
        {label}
    </th>
);

const TableCell: React.FC<{
    children: React.ReactNode;
    className?: string;
    isLastColumn?: boolean;
}> = ({ children, className = '', isLastColumn }) => (
    <td className={`border-gray-persist/20 text-content ${isLastColumn ? '' : 'border-r'} border-b px-4 py-4 ${className}`}>
        {children}
    </td>
);

const VotersTable: React.FC<VotersTableProps> = ({
    voters,
    customTitle,
}) => {
    const { t } = useTranslation();
    const { setFilters } = useFilterContext();
    const [hoveredCell, setHoveredCell] = useState<{
        rowIndex: number;
        col: string;
    } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const formatVotingPower = (value: any): string => {
        if (value === undefined || value === null) return '₳ 0';

        try {
            const numValue = Number(value);
            if (Number.isNaN(numValue)) return '₳ 0';

            const adaValue = numValue / 1000000;
            const formattedValue = Math.floor(adaValue).toLocaleString();

            return `₳ ${formattedValue}`;
        } catch (e) {
            console.error('Error formatting voting power:', e);
            return '₳ 0';
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopiedField(field);
                setTimeout(() => setCopiedField(null), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleMouseEnter = (rowIndex: number, col: string) => {
        setHoveredCell({ rowIndex, col });
    };

    const handleMouseLeave = () => {
        setHoveredCell(null);
    };

    const truncateText = (text: string, maxLength: number = 10) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;

        const startChars = Math.ceil(maxLength / 2);
        const endChars = Math.floor(maxLength / 2);
        return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`;
    };

    const getStatusBadge = (voter: VoterData) => {
        if (voter.votes_count && voter.votes_count > 0) {
            return (
                <span className="bg-success-light text-success px-2 py-1 rounded-full text-xs font-medium">
                    {t('voter.active')}
                </span>
            );
        }
        return (
            <span className="bg-error-light text-error px-2 py-1 rounded-full text-xs font-medium">
                {t('voter.inactive')}
            </span>
        );
    };

    const shouldShowNoRecords = () => {
        return (
            (!voters?.data || voters.data.length === 0)
        );
    };

    const renderCellWithLink = (voter: VoterData, value: string | null, col: string, index: number) => {
        if (!value) {
            return <span className="text-gray-persist">{t('voter.notAvailable')}</span>;
        }

        const isHovered =
            hoveredCell &&
            hoveredCell.rowIndex === index &&
            hoveredCell.col === col;

        return (
            <div className="relative flex w-full items-center justify-between">
                <Link
                    href={useLocalizedRoute('jormungandr.wallets.show', {
                        stakeKey: voter?.stake_pub ?? '',
                        catId: voter?.cat_id ?? '',
                    })}
                    className="hover:text-primary flex-1 cursor-pointer truncate"
                    onMouseEnter={() => handleMouseEnter(index, col)}
                    onMouseLeave={handleMouseLeave}
                >
                    {truncateText(value)}
                </Link>

                {isHovered && value.length > 10 && (
                    <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full transform">
                        <ToolTipHover props={value} />
                    </div>
                )}

                <Button
                    className="text-gray-persist hover:text-primary flex-shrink-0 focus:outline-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        copyToClipboard(value, `${index}-${col}`);
                    }}
                >
                    <CopyIcon width={16} height={16} />
                </Button>

                {copiedField === `${index}-${col}` && (
                    <span className="bg-content-success-light text-content-success-darker absolute -top-10 right-0 z-10 rounded px-2 py-1 text-xs">
                        {t('copied')}
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            {shouldShowNoRecords() && (
                <div className="bg-background mb-10 flex w-full flex-col items-center justify-center rounded-lg px-4 py-8">
                    <RecordsNotFound />
                    <Paragraph className="text-dark mt-4 text-center">
                        {t('voter.noVotersFound')}
                    </Paragraph>
                </div>
            )}

            {(!shouldShowNoRecords()) && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-max min-w-full">
                        <thead className="bg-background-lighter whitespace-nowrap">
                            <tr>
                                <TableHeader label={t('voter.table.voterId')} />
                                <TableHeader label={t('voter.table.stakeAddress')} />
                                <TableHeader label={t('voter.table.votingPower')} />
                                <TableHeader label={t('voter.table.proposalsVotedOn')} />
                                <TableHeader label={t('voter.table.latestFund')} />
                                <TableHeader label={t('voter.table.status')} isLastColumn />
                            </tr>
                        </thead>
                        <tbody className="whitespace-nowrap">
                            {
                                voters?.data &&
                                voters.data.length > 0 &&
                                voters.data.map((voter, index) => (
                                    <tr key={voter.id}>
                                        <TableCell className="w-40">
                                            {renderCellWithLink(voter, voter.cat_id ?? null, 'cat_id', index)}
                                        </TableCell>
                                        <TableCell className="w-40">
                                            {renderCellWithLink(voter, voter.stake_pub ?? null, 'stake_pub', index)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <span>{formatVotingPower(voter.voting_power)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {voter.proposals_voted_on || 0}
                                        </TableCell>
                                        <TableCell>
                                            {voter.latest_fund?.title || t('voter.notAvailable')}
                                        </TableCell>
                                        <TableCell isLastColumn>
                                            {getStatusBadge(voter)}
                                        </TableCell>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    </div>

                    {voters &&
                        voters.data &&
                        voters.data.length > 0 && (
                            <div className="mt-4 px-4 border-dark-light rounded-b-lg">
                                <Paginator
                                    pagination={voters}
                                    linkProps={{
                                        preserveScroll: false,
                                        only: ['voters', 'filters'],
                                        replace: true,
                                        onClick: (e) => {
                                            const target =
                                                e.target as HTMLAnchorElement;
                                            if (
                                                target.href &&
                                                target.href.includes(
                                                    VoterEnums.PAGE,
                                                )
                                            ) {
                                                e.preventDefault();
                                                const url = new URL(
                                                    target.href,
                                                );
                                                const pageValue =
                                                    url.searchParams.get(
                                                        VoterEnums.PAGE,
                                                    );
                                                if (pageValue) {
                                                    setFilters({
                                                        param: VoterEnums.PAGE,
                                                        value: parseInt(
                                                            pageValue,
                                                        ),
                                                        label: 'Current Page',
                                                        resetPageOnChange:
                                                            false,
                                                    });
                                                }
                                            }
                                        },
                                    }}
                                />
                            </div>
                        )}
                </>
            )}
        </>
    );
};

export default VotersTable;