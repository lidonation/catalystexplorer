import UserAvatar from '@/Components/UserAvatar';
import ProposalStatus from './ProposalStatus';

export default function ProposalCard() {
    return (
        <article className="rounded-xl bg-background shadow-lg">
            <header className="rounded-t-xl bg-gradient-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)] p-4 text-white">
                <div className="flex items-center justify-between">
                    <ProposalStatus />
                    <button
                        className="rounded-full p-1.5 hover:bg-background-lighter"
                        aria-label="bookmark-proposal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="20"
                            viewBox="0 0 16 20"
                            fill="none"
                        >
                            <path
                                d="M8 11V5M5 8H11M15 19V5.8C15 4.11984 15 3.27976 14.673 2.63803C14.3854 2.07354 13.9265 1.6146 13.362 1.32698C12.7202 1 11.8802 1 10.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V19L8 15L15 19Z"
                                stroke="black"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </button>
                </div>
                <h2 className="mt-2 text-lg font-medium leading-tight">
                    ACCO2 - The end of eco-fraud! An open-source blockchain and
                    science-based framework for carbon accounting (ACCO2) in the
                    steel industry.
                </h2>
            </header>

            <div className="p-4">
                <nav
                    className="border-b"
                    aria-label="Project details navigation"
                >
                    <ul className="flex justify-between">
                        <li className="w-1/2">
                            <button
                                className="w-full border-b-2 border-primary pb-3 font-semibold text-primary"
                                aria-current="page"
                            >
                                Details
                            </button>
                        </li>
                        <li className="flex w-1/2 items-center justify-center">
                            <button className="flex items-center gap-1 pb-3 font-semibold text-content">
                                <span>Quick Pitch</span>
                                <span className="rounded-full bg-content-light px-2 py-1 text-xs">
                                    Not set
                                </span>
                            </button>
                        </li>
                    </ul>
                </nav>

                <section className="mt-6" aria-labelledby="funding-heading">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Funding</h3>
                        <span className="rounded-md border px-1 py-1 text-xs">
                            Vote Pending
                        </span>
                    </div>

                    <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold">₳1.4M</span>
                            <span className="text-sm text-highlight">
                                / ₳2M (71.67%)
                            </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-content-light">
                            <div
                                className="h-full w-[71.67%] rounded-full bg-primary"
                                role="progressbar"
                                aria-valuenow={71.67}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            ></div>
                        </div>
                    </div>
                </section>

                <section className="mt-6" aria-labelledby="solution-heading">
                    <div className="flex justify-between">
                        <h3
                            id="solution-heading"
                            className="font-medium text-content"
                        >
                            Solution
                        </h3>
                        <a href="#" className="text-primary hover:underline">
                            See more
                        </a>
                    </div>

                    <p className="mt-2 text-content">
                        A blockchain-based framework that uses the science-based
                        Kaplan ma...{' '}
                    </p>
                </section>

                <section
                    className="mt-6 flex justify-between"
                    aria-labelledby="team-heading"
                >
                    <h3 id="team-heading" className="mb-2 font-medium">
                        Team
                    </h3>
                    <ul className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <li key={i}>
                                <UserAvatar
                                    size="size-8"
                                    imageUrl={`https://i.pravatar.cc/300?img=${Math.random()}`}
                                />
                            </li>
                        ))}
                        <li>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-content-light text-sm text-gray-600">
                                +5
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
        </article>
    );
}
