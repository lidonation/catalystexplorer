import ArrowCurvedIcon from '@/Components/svgs/ArrowCurved';
import CardSwitchIcon from '@/Components/svgs/CardSwitchIcon';
import ArrowCurvedIcon from '@/Components/svgs/ArrowCurved';
import CardSwitchIcon from '@/Components/svgs/CardSwitchIcon';
import ListBulletIcon from '@/Components/svgs/ListBulletIcon';
import MiniCardSwitchIcon from '@/Components/svgs/MiniCardSwitchIcon';
import MiniCardSwitchIcon from '@/Components/svgs/MiniCardSwitchIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { Button } from '@headlessui/react';

interface CardLayoutSwitcherProps {
    isHorizontal: boolean;
    quickPitchView: boolean;
    isMini: boolean;
    isMini: boolean;
    setIsHorizontal: (value: boolean) => void;
    setIsMini: (value: boolean) => void;
    setIsMini: (value: boolean) => void;
    setGlobalQuickPitchView: (value: boolean) => void;
}

export default function CardLayoutSwitcher({
    isHorizontal,
    quickPitchView,
    isMini,
    isMini,
    setIsHorizontal,
    setIsMini,
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

    const setMini = (value: boolean) => {
        setIsMini(value);
    };

    return (
        <div className="relative">
            <div className="z- bg-background flex overflow-hidden rounded-lg border-[2px] border-gray-300 shadow-m">
                <Button
                    onClick={() => {
                        setHorizontal(false);
                        if(isHorizontal === false){
                            setMini(!isMini);
                            setQuickpitch(false)
                        }
                    }}
                    className={`flex flex-1 items-center justify-center w-[50px] h-[40px] ${
                        !isHorizontal || isMini
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                    } border-r-[2px] border-gray-300`}
                >
                    <div className="relative flex items-center">
                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isMini
                                    ? '-translate-y-2 translate-x-2 pr-2 pl-1'
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

                        <div className={`relative ${isMini? 'translate-y-1 translate-x-1 pb-1' : '-translate-y-1 -translate-x-2'}`}>
                            <ArrowCurvedIcon />
                        </div>

                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                isMini
                                    ? 'translate-x-1 -translate-y-1 pt-2 pr-2 '
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
                    onClick={() => {
                        setHorizontal(true)
                        setIsMini(false)
                    }}
                    className={`flex flex-1 items-center justify-center w-[50px] h-[40px] ${
                        isHorizontal
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                    } border-r-[2px] border-gray-300`}
                >
                    <ListBulletIcon />
                </Button>

                <Button
                    onClick={() => {
                        setQuickpitch(!quickPitchView)
                        setIsMini(false)
                    }}
                    className={`flex flex-1 items-center justify-center w-[50px] h-[40px] ${
                        quickPitchView
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                            ? 'bg-background-lighter text-primary'
                            : 'hover:bg-background-lighter text-gray-500 cursor-pointer'
                    }`}
                >
                    <VideoCameraIcon />
                </Button>
            </div>
        </div>
    );
}
