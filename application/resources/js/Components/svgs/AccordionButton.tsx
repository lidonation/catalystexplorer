type AccordionButtonProps = {
    isOpen: boolean;
    className?: string;
    width?: number;
    height?: number;
};
export default function AccordionButton({
    isOpen,
    className,
    width = 32,
    height = 32,
}: AccordionButtonProps) {
    return (
        <div>
            {!isOpen ? (
                <svg
                    width={width}
                    height={height}
                    viewBox="0 0 24 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 10V18M8 14H16M22 14C22 19.5228 17.5228 24 12 24C6.47715 24 2 19.5228 2 14C2 8.47715 6.47715 4 12 4C17.5228 4 22 8.47715 22 14Z"
                        stroke="#2596BE"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    ></path>
                </svg>
            ) : (
                <svg
                    width={width}
                    height={height}
                    viewBox="0 0 24 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 14H16M22 14C22 19.5228 17.5228 24 12 24C6.47715 24 2 19.5228 2 14C2 8.47715 6.47715 4 12 4C17.5228 4 22 8.47715 22 14Z"
                        stroke="#98A2B3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    ></path>
                </svg>
            )}
        </div>
    );
}
