import ListBulletIcon from '@/Components/svgs/ListBulletIcon';
import VerticalColumnIcon from '@/Components/svgs/VerticalColumnIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';
import ListBulletIcon from '@/Components/svgs/ListBulletIcon';
import VerticalColumnIcon from '@/Components/svgs/VerticalColumnIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ProposalParamsEnum } from '@/enums/proposal-search-params';
import { ProposalSearchParams } from '../../../../types/proposal-search-params';

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
    const { filters, setFilters } = useFilterContext<ProposalSearchParams>();
    
    const setQuickpitch = (value: boolean) => {
        setGlobalQuickPitchView(value);
        setFilters(ProposalParamsEnum.QUICK_PITCHES, value ? '1' : '');
    };

    const setHorizontal = (value: boolean) => {
        setIsHorizontal(value);
        // setQuickpitch(false);
    };

    return (
        <div className="relative">
            <div className="z- flex overflow-hidden rounded-lg border-[2px] border-gray-300 bg-background shadow-md">
                <button
                    onClick={() => setHorizontal(false)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        !isHorizontal
                            ? 'cursor-default bg-background-lighter text-primary'
                            : 'text-gray-500 hover:bg-background-lighter'
                    } border-r-[2px] border-gray-300`}
                >
                    <VerticalColumnIcon />
                </button>

                <button
                    onClick={() => setHorizontal(true)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        isHorizontal
                            ? 'cursor-default bg-background-lighter text-primary'
                            : 'text-gray-500 hover:bg-background-lighter'
                    } border-r-[2px] border-gray-300`}
                >
                    <ListBulletIcon />
                </button>

                <button
                    onClick={() => setQuickpitch(!quickPitchView)}
                    className={`flex flex-1 items-center justify-center p-2 ${
                        quickPitchView
                            ? 'cursor-default bg-background-lighter text-primary'
                            : 'text-gray-500 hover:bg-background-lighter'
                    }`}
                >
                    <VideoCameraIcon />
                </button>
            </div>
        </div>
    );
}
