interface AnnouncementCardChipProps {
    label: string;
}

const AnnouncementCardChip = ({ label }: AnnouncementCardChipProps) => {
    return (
        <div
            className={`border-border-chip text-4 text-primary rounded-xl border px-2 text-center capitalize`}
        >
            {label}
        </div>
    );
};

export default AnnouncementCardChip;
