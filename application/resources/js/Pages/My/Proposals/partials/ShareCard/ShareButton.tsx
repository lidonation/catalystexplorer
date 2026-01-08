import Paragraph from "@/Components/atoms/Paragraph";
import PrimaryButton from "@/Components/atoms/PrimaryButton";
import { ReactNode } from "react";

interface ShareButtonProps {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    bgColor: string;
}

export default function ShareButton({
    icon,
    label,
    onClick,
    bgColor,
}: ShareButtonProps) {
    return (
        <PrimaryButton
            type="button"
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-6 py-2.5 text-[13px] font-medium text-white transition-all hover:brightness-110 ${bgColor}`}
            aria-label={`Share on ${label}`}
        >
            {icon}
            <Paragraph>{label}</Paragraph>
        </PrimaryButton>
    );
}
