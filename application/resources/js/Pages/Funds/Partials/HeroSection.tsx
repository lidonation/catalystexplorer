import FundData = App.DataTransferObjects.FundData;

interface HeroSectionProps extends Record<string, unknown> {
    fund: FundData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ fund }) => {
    return (
        <div>
            <div className="relative w-full">
                {/* desktop view */}
                <div className="relative hidden h-72 w-auto overflow-hidden rounded-lg bg-center sm:block">
                    <img
                        src={`/${fund.slug}-banner.jpg`}
                        alt="Example"
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="hidden py-8 sm:absolute sm:left-16 sm:top-32 sm:block">
                    <div className="flex h-64 w-full items-center justify-center rounded-full border-0 p-4 sm:h-48 sm:w-48 sm:bg-white sm:shadow-lg">
                        <img src="/fund-13-thumbnail.jpg" alt="Example" />
                    </div>
                </div>
                <div className="font-spacing-2 relative mb-4 mt-24 hidden text-3xl font-bold tracking-wider sm:block">
                    <p>{fund.title}</p>
                </div>
            </div>

            {/* mobile view */}
            <div className="flex flex-col gap-4 rounded-md bg-white p-4 sm:hidden">
                <div className="text-2xl font-bold text-content">Fund 13</div>
                <div className="flex flex-row gap-4">
                    <div className="w-1/2">
                        <img
                            src={`/${fund.slug}-thumbnail.jpg`}
                            alt="Example"
                        />
                    </div>
                    <div className="flex w-auto flex-col gap-8 p-4 sm:hidden">
                        <div className="flex flex-col">
                            <p className="text-md font-bold">Total Allocated</p>
                            <p className="text-xl font-bold">
                                46.48M <span className="opacity-50">/50M </span>
                            </p>
                            <div className="flex flex-row items-center gap-2">
                                <span>
                                    <svg
                                        className="fill-current text-green-500"
                                        width="20px"
                                        height="20px"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill="g"
                                            stroke="#000000"
                                            stroke-width="2"
                                            d="M1,16 L8,9 L13,14 L23,4 M0,22 L23.999,22 M16,4 L23,4 L23,11"
                                        />
                                    </svg>
                                </span>
                                <span>18.48%</span>
                                <span className="text-sm">vs last fund</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-bold">Funded Projects</p>
                            <p className="text-xl font-bold">
                                199 <span className="opacity-50">/1639</span>
                            </p>
                            <div className="flex flex-row items-center gap-2">
                                <span>
                                    <svg
                                        className="fill-current text-green-500"
                                        width="20px"
                                        height="20px"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill="g"
                                            stroke="#000000"
                                            stroke-width="2"
                                            d="M1,16 L8,9 L13,14 L23,4 M0,22 L23.999,22 M16,4 L23,4 L23,11"
                                        />
                                    </svg>
                                </span>
                                <span>18.48%</span>
                                <span className="text-sm">vs last fund</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
