import ListBulletIcon from '@/Components/svgs/ListBulletIcon';
import VerticalColumnIcon from '@/Components/svgs/VerticalColumnIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';

interface CardLayoutSwitcherProps {
    isHorizontal: boolean;
    quickPitchView: boolean;
    setIsHorizontal: (value: boolean) => void;
    setGlobalQuickPitchView: (value: boolean) => void;
}

export default function CardLayoutSwitcher({
    isHorizontal,
    quickPitchView,
    setIsHorizontal,
    setGlobalQuickPitchView,
}: CardLayoutSwitcherProps) {
    const { filters, setFilters } = useFilterContext();

    const setQuickpitch = (value: boolean) => {
        setGlobalQuickPitchView(value);
        setFilters({
            param: ProposalParamsEnum.QUICK_PITCHES,
            value: value ? '1' : '',
            label: undefined,
        });
    };

    const setHorizontal = (value: boolean) => {
        setIsHorizontal(value);
        // setQuickpitch(false);
    };

    return (
        <div className="relative">
            <div className="z- bg-background flex overflow-hidden rounded-lg border-[2px] border-gray-300 shadow-md">
                <button
                    onClick={() => setHorizontal(false)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        !isHorizontal
                            ? 'bg-background-lighter text-primary cursor-default'
                            : 'hover:bg-background-lighter text-gray-500'
                    } border-r-[2px] border-gray-300`}
                >
                    <VerticalColumnIcon />
                </button>

                <button
                    onClick={() => setHorizontal(true)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        isHorizontal
                            ? 'bg-background-lighter text-primary cursor-default'
                            : 'hover:bg-background-lighter text-gray-500'
                    } border-r-[2px] border-gray-300`}
                >
                    <ListBulletIcon />
                </button>

                <button
                    onClick={() => setQuickpitch(!quickPitchView)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        quickPitchView
                            ? 'bg-background-lighter text-primary cursor-default'
                            : 'hover:bg-background-lighter text-gray-500'
                    }`}
                >
                    <VideoCameraIcon />
                </button>
            </div>
        </div>
    );
}
