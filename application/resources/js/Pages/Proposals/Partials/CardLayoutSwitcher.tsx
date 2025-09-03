import Button from '@/Components/atoms/Button';
import ArrowCurvedIcon from '@/Components/svgs/ArrowCurved';
import CardSwitchIcon from '@/Components/svgs/CardSwitchIcon';
import MiniCardSwitchIcon from '@/Components/svgs/MiniCardSwitchIcon';
import TableIcon from '@/Components/svgs/TableIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';

interface CardLayoutSwitcherProps {
    isHorizontal: boolean;
    quickPitchView: boolean;
    isMini: boolean;
    isTableView: boolean;
    setIsHorizontal: (value: boolean) => void;
    setIsMini: (value: boolean) => void;
    setGlobalQuickPitchView: (value: boolean) => void;
    setIsTableView: (value: boolean) => void;
}

export default function CardLayoutSwitcher({
    isHorizontal,
    quickPitchView,
    isMini,
    isTableView,
    setIsHorizontal,
    setIsMini,
    setGlobalQuickPitchView,
    setIsTableView,
}: CardLayoutSwitcherProps) {
    const { filters, setFilters } = useFilterContext();

    const setQuickpitch = (value: boolean) => {
        setGlobalQuickPitchView(value);
        setFilters({
            param: ParamsEnum.QUICK_PITCHES,
            value: value ? '1' : '',
            label: undefined,
        });
    };

    const handleTableClick = () => {
        const newValue = !isTableView;
        setIsTableView(newValue);
    };

    const handleVerticalClick = () => {
        setIsTableView(false);
        
        setIsHorizontal(false);
        
        if (!isHorizontal) {
            setIsMini(!isMini);
            setQuickpitch(false);
        }
    };

    const handleQuickPitchClick = () => {
        const newValue = !quickPitchView;
        
        setQuickpitch(newValue);
        
        if (newValue) {
            setIsMini(false);
            setIsTableView(false);
        }
    };

    return (
        <div className="relative">
            <div className="z- bg-background flex overflow-hidden rounded-lg border-[2px] border-gray-300 shadow-m">

                <Button
                    onClick={handleTableClick}
                    className={`flex flex-1 items-center justify-center w-[60px] h-[50px] ${
                        isTableView
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter cursor-pointer text-gray-500'
                    } border-r-[2px] border-gray-300`}
                    data-testid="card-layout-switcher-table-button"
                >
                    <TableIcon />
                </Button>

                <Button
                    onClick={handleVerticalClick}
                    className={`flex flex-1 items-center justify-center w-[60px] h-[50px]${
                        !isHorizontal && !isTableView
                            ? 'bg-background-lighter text-primary cursor-pointer'
                            : 'cursor-pointer text-gray-500'
                    } hover:bg-background-lighter border-r-[2px] border-gray-300`}
                    data-testid="card-layout-switcher-vertical-button"
                >
                    <div className="relative flex items-center">
                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isMini
                                    ? 'translate-x-2 -translate-y-2 pr-2 pl-1'
                                    : '-translate-x-1 translate-y-1 pl-4'
                            }`}
                        >
                            <MiniCardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    isMini ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                            <CardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    isMini ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        </div>

                        <div
                            className={`relative ${isMini ? 'translate-x-1 translate-y-1 pb-1' : '-translate-x-2 -translate-y-1'}`}
                        >
                            <ArrowCurvedIcon />
                        </div>

                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isMini
                                    ? 'translate-x-1 -translate-y-1 pt-2 pr-2'
                                    : '-translate-x-2 translate-y-4 pb-2'
                            }`}
                        >
                            <CardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    !isMini ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                            <MiniCardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    !isMini ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                        </div>
                    </div>
                </Button>

                <Button
                    onClick={handleQuickPitchClick}
                    className={`flex flex-1 items-center justify-center w-[60px] h-[50px] ${
                        quickPitchView && !isTableView
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter cursor-pointer text-gray-500'
                    } border-r-[2px] border-gray-300`}
                    data-testid="card-layout-switcher-quick-pitch-button"
                >
                    <VideoCameraIcon />
                </Button>
            </div>
        </div>
    );
}