interface AnnouncementCardChipProps {
    label: string;
}

const AnnouncementCardChip = ({ label }: AnnouncementCardChipProps) => {
    return (
        <div
            className={`rounded-xl border border-border-chip px-2 text-center text-4 capitalize text-primary`}
        >
            {label}
        </div>
    );
};

export default AnnouncementCardChip;
