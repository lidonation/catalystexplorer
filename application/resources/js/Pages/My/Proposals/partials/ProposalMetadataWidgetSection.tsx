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
      <Paragraph className="md:min-w-[10rem] min-w-[5rem] text-content/60">{label}</Paragraph>
      <Paragraph className="font-semibold" size="sm">{value}</Paragraph>
    </div>
  );
}