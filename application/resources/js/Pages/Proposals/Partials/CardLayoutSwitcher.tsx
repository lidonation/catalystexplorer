import Button from '@/Components/atoms/Button';
import ArrowCurvedIcon from '@/Components/svgs/ArrowCurved';
import CardSwitchIcon from '@/Components/svgs/CardSwitchIcon';
import PdfIcon from '@/Components/svgs/PdfIcon';
import MiniCardSwitchIcon from '@/Components/svgs/MiniCardSwitchIcon';
import TableIcon from '@/Components/svgs/TableIcon';
import VideoCameraIcon from '@/Components/svgs/VideoCameraIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useEffect } from 'react';
import Paragraph from '@/Components/atoms/Paragraph';

interface CardLayoutSwitcherProps {
    quickPitchView: boolean;
    setGlobalQuickPitchView: (value: boolean) => void;
    hideTableView?: boolean;
    hidePdfView?: boolean;
    onClearAllFilters?: () => void;
    customClassName?: string;
    customButtonClassName?: string;
}

export default function CardLayoutSwitcher({
    quickPitchView,
    setGlobalQuickPitchView,
    hideTableView = false,
    hidePdfView = true,
    customClassName = '',
    customButtonClassName = '',
}: CardLayoutSwitcherProps) {
    const { filters, setFilters } = useFilterContext();
    
    // Use IndexedDB for persistent view settings
    const { value: isTableOrPdfView, setValue: setTableOrPdfViewSetting } = useUserSetting<boolean>(userSettingEnums.VIEW_TABLE, false);
    const { value: isHorizontal, setValue: setIsHorizontalSetting } = useUserSetting<boolean>(userSettingEnums.VIEW_HORIZONTAL, false);
    const { value: isMini, setValue: setIsMiniSetting } = useUserSetting<boolean>(userSettingEnums.VIEW_MINI, false);
    
    // Provide defaults for all boolean values
    const currentIsTableOrPdfView = isTableOrPdfView ?? false;
    const currentIsHorizontal = isHorizontal ?? false;
    const currentIsMini = isMini ?? false;

    const setQuickpitch = (value: boolean) => {
        setGlobalQuickPitchView(value);
        setFilters({
            param: ParamsEnum.QUICK_PITCHES,
            value: value ? '1' : '',
            label: undefined,
        });
    };

    const handleQuickPitchClick = () => {
        
        setQuickpitch(true);

         setTableOrPdfViewSetting(false);
        
    };


    return (
        <div className={`relative ${customClassName}`}>
            <div className={`z- bg-background flex overflow-hidden rounded-lg border-[2px] border-r-0 border-light-gray-persist shadow-m ${customClassName}`}>

                {/* PDF View Button - conditionally hidden */}
                {!hidePdfView && (
                    <Button
                        onClick={() => { setTableOrPdfViewSetting(true); }}
                        className={`flex flex-1 items-center justify-center w-[60px] h-[50px] ${customButtonClassName} ${
                            isTableOrPdfView
                                ? 'bg-background-lighter text-primary'
                                : 'bg-background text-light-gray-persist hover:bg-background-lighter cursor-pointer'
                        } border-r-[2px] border-light-gray-persist`}
                        data-testid="card-layout-switcher-pdf-button"
                    >
                        <PdfIcon />
                    </Button>
                )}

                {/* Table View Button - conditionally hidden */}
                {!hideTableView && (
                    <Button
                        onClick={() => {
                            setTableOrPdfViewSetting(true);
                        }}
                        className={`flex flex-1 items-center justify-center w-[60px] h-[50px] ${customButtonClassName} ${
                            isTableOrPdfView
                                ? 'bg-background-lighter text-primary'
                                : 'bg-background text-light-gray-persist hover:bg-background-lighter cursor-pointer'
                        } border-r-[2px] border-light-gray-persist`}
                        data-testid="card-layout-switcher-table-button"
                    >
                        <TableIcon />
                    </Button>
                )}

                <Button
                    onClick={() => {
                        setTableOrPdfViewSetting(false);
                        setQuickpitch(false);
                        if (!currentIsTableOrPdfView && !quickPitchView) {
                            setIsMiniSetting(!currentIsMini);
                        }
                       
                    }}
                    className={`flex flex-1 items-center justify-center w-[60px] h-[50px] ${customButtonClassName} ${
                         !currentIsTableOrPdfView && !quickPitchView
                            ? 'bg-background-lighter text-primary'
                            : 'bg-background text-light-gray-persist hover:bg-background-lighter cursor-pointer'
                    } border-r-[2px] border-light-gray-persist`}
                    data-testid="card-layout-switcher-vertical-button"
                >
                    <div className="relative flex items-center">
                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                currentIsMini
                                    ? 'translate-x-2 -translate-y-2 pr-2 pl-1'
                                    : '-translate-x-1 translate-y-1 pl-4'
                            }`}
                        >
                            <MiniCardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    currentIsMini ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                            <CardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    currentIsMini ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                        </div>

                        <div
                            className={`relative ${currentIsMini ? 'translate-x-1 translate-y-1 pb-1' : '-translate-x-2 -translate-y-1'}`}
                        >
                            <ArrowCurvedIcon />
                        </div>

                        <div
                            className={`relative transition-all duration-500 ease-in-out ${
                                currentIsMini
                                    ? 'translate-x-1 -translate-y-1 pt-2 pr-2'
                                    : '-translate-x-2 translate-y-4 pb-2'
                            }`}
                        >
                            <CardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    !currentIsMini ? 'opacity-100' : 'opacity-0'
                                }`}
                            />
                            <MiniCardSwitchIcon
                                className={`transition-opacity duration-500 ease-in-out ${
                                    !currentIsMini ? 'opacity-0' : 'opacity-100'
                                }`}
                            />
                        </div>
                    </div>
                </Button>

                <Button
                    onClick={() => handleQuickPitchClick()}
                    className={`flex flex-1 items-center justify-center w-[60px] h-[50px] ${customButtonClassName} ${
                        quickPitchView && !currentIsTableOrPdfView
                            ? 'bg-background-lighter text-primary'
                            : 'bg-background text-light-gray-persist hover:bg-background-lighter cursor-pointer'
                    } border-r-[2px] border-light-gray-persist`}
                    data-testid="card-layout-switcher-quick-pitch-button"
                >
                    <VideoCameraIcon />
                </Button>
            </div>
        </div>
    );
}