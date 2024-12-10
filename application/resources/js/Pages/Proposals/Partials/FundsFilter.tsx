import Checkbox from "@/Components/Checkbox";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface FundFiltersProps {
    fundTitle: string,
    totalProposals: any
}

const FundsFilter: React.FC<FundFiltersProps> = ({ fundTitle, totalProposals }) => {
    const { t } = useTranslation();
    const [active, setActive] = useState(false);

    return (
        <div className={`w-full bg-background flex rounded-md shadow-sm ${active ? 'border-2 border-primary' : ''}` }>
            <div className="m-4">
                <Checkbox checked={active} onChange={(e)=>{setActive(e.target.checked)}}/>   
            </div>
            <div className="w-full m-4 ml-2">
                <p className="font-medium mb-2">{fundTitle}</p>
                <div className="w-full flex justify-between">
                    <p className="text-gray-persist">{t("proposals.totalProposals")}</p>
                    <p className="font-bold">{totalProposals.toLocaleString('en-US')}</p>
                </div>
            </div>
        </div>
    )
}

export default FundsFilter;

