import { t } from 'i18next';
import React, { useState } from 'react';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import GroupData = App.DataTransferObjects.GroupData;

interface SegmentedBarProps {
    group?: GroupData;
    completedProposalsColor: string;
    fundedProposalsColor: string;
    unfundedProposalsColor: string;
}

const SegmentedBar: React.FC<SegmentedBarProps> = ({
    group,
    completedProposalsColor,
    fundedProposalsColor,
    unfundedProposalsColor,
}) => {
    const completed = group?.completed_proposals_count || 0;
    const funded = group?.funded_proposals_count || 0;
    const unfunded = group?.unfunded_proposals_count || 0;

    let values = [completed, funded, unfunded];
    let colors = [
        completedProposalsColor,
        fundedProposalsColor,
        unfundedProposalsColor,
    ];

    if (completed - funded === 0 && completed !== 0 && funded !== 0) {
        values = [completed];
        colors = [completedProposalsColor];
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    const [isHovered, setIsHovered] = useState(false);

    const nonZeroValues = values.filter((value) => value > 0);
    const singleNonZeroIndex = values.findIndex((value) => value > 0);

    return (
        <div>
            <div
                className="relative flex w-full max-w-lg items-center"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {nonZeroValues.length === 1 ? (
                    // Render only one full-width bar if only one value is non-zero
                    <div
                        className={`${colors[singleNonZeroIndex]} h-2 w-full rounded-md`}
                    ></div>
                ) : (
                    values.map((value, index) => {
                        const width =
                            total === 0
                                ? '33.33%'
                                : `${(value / total) * 100}%`;
                        return (
                            <div
                                key={index}
                                className={`${colors[index]} h-2 rounded-md ${index !== 0 ? 'ml-1' : ''}`}
                                style={{ width }}
                            ></div>
                        );
                    })
                )}
            </div>
            <div className="mt-2 flex justify-between gap-2">
                <div>
                    <div
                        className={`h-2 w-2 rounded-full ${completedProposalsColor}`}
                    ></div>
                    <p className="text-gray-persist">
                        {t('groups.completed')} :{' '}
                        <strong>{group?.completed_proposals_count}</strong>
                    </p>
                </div>
                <div>
                    <div
                        className={`h-2 w-2 rounded-full ${fundedProposalsColor}`}
                    ></div>
                    <p className="text-gray-persist">
                        {t('groups.funded')} :{' '}
                        <strong>{group?.funded_proposals_count}</strong>
                    </p>
                </div>

                <div>
                    <div
                        className={`h-2 w-2 rounded-full ${unfundedProposalsColor}`}
                    ></div>
                    <p className="text-gray-persist">
                        {t('groups.unfunded')} :{' '}
                        <strong>{group?.unfunded_proposals_count}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SegmentedBar;
