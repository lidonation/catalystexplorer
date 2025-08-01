import Button from '@/Components/atoms/Button';
import Title from '@/Components/atoms/Title';
import PercentageProgressBar from '@/Components/PercentageProgressBar';
import { shortNumber } from '@/utils/shortNumber';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import MilestoneApprovalButtons from './MilestoneApprovalButtons';
import MilestoneDateProgressBar from './MilestoneDateProgressBar';
import MilestoneTrackButton from './MilestoneTrackButton';
import MilestonesData = App.DataTransferObjects.MilestoneData;

interface MilestoneAccordionProps {
    milestones: MilestonesData[];
    totalCost: number;
    currency: string;
    onTrack: boolean;
}

const MilestoneAccordion: React.FC<MilestoneAccordionProps> = ({
    milestones,
    totalCost,
    currency,
    onTrack,
}) => {
    const { t } = useLaravelReactI18n();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const currencySymbol: string = currency == 'usd' ? '$' : '₳';
    const toggleAccordion = (index: number) => {
        setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    const activeMilestones = milestones
        ? milestones
              .filter((item) => item.current)
              .sort((a, b) => a.milestone - b.milestone)
        : [];

    function formatDate(dateString: string): string {
        const date = new Date(dateString.replace(' ', 'T'));
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };
        return date.toLocaleString('en-US', options);
    }

    function addMonthsAndFormat(dateStr: string, monthsToAdd: number): string {
        const date = new Date(dateStr.replace(' ', 'T')); // ensure it's ISO-compatible
        date.setMonth(date.getMonth() + monthsToAdd);

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function calculatePercentage(value: number, total: number): string {
        const percentage = (value / total) * 100;

        return percentage.toFixed(2);
    }

    return (
        <div className="w-full space-y-4">
            {activeMilestones.map((milestone, index) => (
                <div
                    key={index}
                    className="border-background-lighter w-full border-t pt-4"
                >
                    <div className="flex w-full items-center justify-between">
                        <div className="flex w-full flex-col gap-4">
                            <Title level="4" className="font-medium">
                                {`${t('Milestone')} ${milestone.milestone} : ${currencySymbol}${milestone.cost.toLocaleString()}`}
                            </Title>
                            <MilestoneDateProgressBar
                                startDate={milestone.created_at}
                                months={milestone.month}
                            />
                        </div>
                        <Button
                            onClick={() => toggleAccordion(index)}
                            className={`flex size-8 items-center justify-center text-lg transition-transform`}
                        >
                            {openIndex === index ? (
                                <ChevronUp />
                            ) : (
                                <ChevronDown />
                            )}
                        </Button>
                    </div>

                    {openIndex === index && (
                        <div className="px-0.5 py-4">
                            <div className="overflow-x-auto">
                                <table className="border-background-lighter w-full table-auto border">
                                    <tbody>
                                        <tr>
                                            <th className="border-background-lighter border-r px-4 py-2 text-left">
                                                {t('Milestone Title')}
                                            </th>
                                            <td className="border-background-lighter border-r px-4 py-2 text-left">
                                                {milestone.title}
                                            </td>
                                            <td className="px-4 py-2">
                                                <MilestoneApprovalButtons
                                                    poas={milestone.poas}
                                                />
                                            </td>
                                        </tr>

                                        <tr className="border-background-lighter border-t">
                                            <th className="border-background-lighter border-r px-4 py-2 text-left">
                                                {t('Submitted at')}
                                            </th>
                                            <td className="border-background-lighter border-r px-4 py-2 text-left">
                                                {formatDate(
                                                    milestone.created_at,
                                                )}
                                            </td>
                                            <td className="px-4 py-2"></td>
                                        </tr>

                                        <tr className="border-background-lighter border-t">
                                            <th className="border-background-lighter border-r px-4 py-2 text-left">
                                                {t('Milestone Details')}
                                            </th>
                                            <td className="border-background-lighter border-r px-4 py-2 text-left">
                                                <div
                                                    className="prose"
                                                    dangerouslySetInnerHTML={{
                                                        __html: milestone.outputs,
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-2"></td>
                                        </tr>

                                        <tr className="border-background-lighter border-t">
                                            <th className="border-background-lighter border-r px-4 py-2 text-left">
                                                {t('Acceptance Criteria')}
                                            </th>
                                            <td className="border-background-lighter border-r px-4 py-2 text-left">
                                                <div
                                                    className="prose"
                                                    dangerouslySetInnerHTML={{
                                                        __html: milestone.evidence,
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <MilestoneApprovalButtons
                                                    poas={milestone.poas}
                                                />
                                            </td>
                                        </tr>

                                        <tr className="border-background-lighter border-t">
                                            <th className="border-background-lighter border-r px-4 py-2 text-left">
                                                {t('Delivery Month')}
                                            </th>
                                            <td className="border-background-lighter border-r px-4 py-2 text-left">
                                                {addMonthsAndFormat(
                                                    milestone.created_at,
                                                    milestone.month,
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <MilestoneTrackButton
                                                    onTrack={onTrack}
                                                />
                                            </td>
                                        </tr>

                                        <tr className="border-background-lighter border-t">
                                            <th className="border-background-lighter border-r px-4 py-2 text-left">
                                                {t('Milestone Cost')}
                                            </th>
                                            <td className="border-background-lighter flex flex-col gap-2 border px-4 py-2">
                                                <div className="flex w-full justify-between">
                                                    <div className="text-gray-persist">
                                                        {t('Cost')}
                                                    </div>
                                                    <div className="align-center flex">
                                                        <span className="text-content text-xl font-bold">
                                                            {currencySymbol}
                                                            {shortNumber(
                                                                milestone.cost,
                                                            )}
                                                        </span>

                                                        <span className="text-gray-persist ml-2 text-lg">
                                                            / {currencySymbol}
                                                            {shortNumber(
                                                                totalCost,
                                                            )}
                                                        </span>
                                                        <span className="text-gray-persist ml-2 text-lg">
                                                            (
                                                            {calculatePercentage(
                                                                milestone.cost,
                                                                totalCost,
                                                            )}
                                                            %)
                                                        </span>
                                                    </div>
                                                </div>
                                                <PercentageProgressBar
                                                    value={milestone.cost}
                                                    total={totalCost}
                                                    primaryBackgroundColor={
                                                        'bg-background-lighter'
                                                    }
                                                    secondaryBackgroudColor={
                                                        'bg-primary'
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MilestoneAccordion;
