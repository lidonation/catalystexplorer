import { useTranslation } from 'react-i18next';

interface MilestoneTrackButtonProps {
    onTrack: boolean;
}

const MilestoneTrackButton: React.FC<MilestoneTrackButtonProps> = ({
    onTrack,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center space-y-2">
            {onTrack ? (
                <>
                    <button className="bg-success-light text-success border-success rounded-lg border px-1 py-1 text-xs">
                        {t('On Track')}
                    </button>
                </>
            ) : (
                <>
                    <button className="text-error rounded-lg border border-gray-400 bg-gray-300 px-2 py-1 text-xs">
                        {t('Off Track')}
                    </button>
                </>
            )}
        </div>
    );
};

export default MilestoneTrackButton;
