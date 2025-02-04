import ArrowCurvedIcon from '@/Components/svgs/ArrowCurved';
import CardSwitchIcon from '@/Components/svgs/CardSwitchIcon';
import ListBulletIcon from '@/Components/svgs/ListBulletIcon';
import MiniCardSwitchIcon from '@/Components/svgs/MiniCardSwitchIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';

interface CardLayoutSwitcherProps {
    isHorizontal: boolean;
    quickPitchView: boolean;
    isMini: boolean;
    setIsHorizontal: (value: boolean) => void;
    setIsMini: (value: boolean) => void;
    setGlobalQuickPitchView: (value: boolean) => void;
}

export default function CardLayoutSwitcher({
    isHorizontal,
    quickPitchView,
    isMini,
    setIsHorizontal,
    setIsMini,
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

    const setMini = (value: boolean) => {
        setIsMini(value);
    };

    return (
        <div className="relative">
            <div className="z- bg-background flex overflow-hidden rounded-lg border-[2px] border-gray-300 shadow-md">
                <button
                    onClick={() => {
                        setHorizontal(false);
                        if(isHorizontal === false){
                            setMini(!isMini);
                        }
                    }}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        !isHorizontal || isMini
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                    } border-r-[2px] border-gray-300`}
                >
                    <div className="relative flex items-center">
                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isMini
                                    ? '-translate-y-4 translate-x-1'
                                    : '-translate-x-1 -translate-y- pl-2'
                            }`}
                        >
                            <CardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    isMini ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                            <MiniCardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    isMini ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        </div>

                        <div className="relative -translate-y-2">
                            <ArrowCurvedIcon />
                        </div>

                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isMini
                                    ? '-translate-x-1 -translate-y-1 pt-1'
                                    : '-translate-x-1 translate-y-4'
                            }`}
                        >
                            <MiniCardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    !isMini ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                            <CardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    !isMini ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => {
                        setHorizontal(true)
                        setIsMini(false)
                    }}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        isHorizontal
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                    } border-r-[2px] border-gray-300`}
                >
                    <ListBulletIcon />
                </button>

                <button
                    onClick={() => setQuickpitch(!quickPitchView)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        quickPitchView
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                    }`}
                >
                    <VideoCameraIcon />
                </button>
            </div>
        </div>
    );
}
