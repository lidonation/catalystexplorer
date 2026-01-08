import Paragraph from "@/Components/atoms/Paragraph";
import { Check } from "lucide-react";

interface VisibilityItemProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void
}

export default function VisibilityToggleItem({
    id,
    label,
    checked,
    onChange,

}: VisibilityItemProps) {
    return (
        <label
            htmlFor={id}
            className="flex cursor-pointer items-center gap-1.5"
        >
            <div className="relative">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only" />
                <div
                    className={`flex size-4 items-center justify-center rounded border transtion-colors ${checked ? 'border-primary bg-primary' : 'border-light-gray-persist bg-background'
                        }`}
                    role="checkbox"
                    aria-checked={checked}
                >
                    {checked && (
                        <Check className="size-3 text-white" />
                    )}
                </div>
            </div>
            <Paragraph className="text-sm font-medium text-gray-persist">{label}</Paragraph>
        </label>

    )
}