import VideoCameraIcon from "@/Components/svgs/VideoCameraIcon";
import VerticalColumnIcon from "@/Components/svgs/VerticalColumnIcon";
import ListBulletIcon from "@/Components/svgs/ListBulletIcon";

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
    return (
        <div className="relative">
            <div className="flex border-[2px] border-gray-300 rounded-lg overflow-hidden bg-background shadow-md z-">
                <button
                    onClick={() => setIsHorizontal(false)}
                    className={`flex-1 flex justify-center items-center p-2  ${!isHorizontal
                        ? "bg-background-lighter text-primary cursor-default"
                        : "hover:bg-background-lighter text-gray-500"
                        } border-r-[2px] border-gray-300`}
                >
                    <VerticalColumnIcon />
                </button>

                <button
                    onClick={() => setIsHorizontal(true)}
                    className={`flex-1 flex justify-center items-center p-2 ${isHorizontal
                        ? "bg-background-lighter text-primary cursor-default"
                        : "hover:bg-background-lighter text-gray-500"
                        } border-r-[2px] border-gray-300`}
                >
                    <ListBulletIcon />
                </button>

                <button
                    onClick={() => setGlobalQuickPitchView(true)}
                    className={`flex-1 flex justify-center items-center p-2 ${quickPitchView ?
                        "bg-background-lighter text-primary cursor-default"
                        : "hover:bg-background-lighter text-gray-500"
                        }`}
                >
                    <VideoCameraIcon />
                </button>
            </div>
        </div>
    );
}
