import Paragraph from "@/Components/atoms/Paragraph";
import ProposalStatus from "@/Pages/Proposals/Partials/ProposalStatus";
import { useLaravelReactI18n } from "laravel-react-i18n";
import React from "react";

interface ProposalMetadataWidgetSectionProps {
    label: string;
    value: React.ReactNode | string | null;
}
export default function ProposalMetadataWidgetSection({
  label,
  value,
}: ProposalMetadataWidgetSectionProps) {
  const {t } = useLaravelReactI18n();  
  return (
    <div className='w-full flex gap-6 border-t border-content/20 last:border-b py-4'>
      <Paragraph className="min-w-[10rem] text-content/60">{label}</Paragraph>
      <div className="font-semibold">{value}</div>
    </div>
  );
}