import { PageProps } from '@/types';
import { shortNumber } from '@/utils/shortNumber';
import { useState } from 'react';
import ProposalBookmark from './ProposalBookmark';
import ProposalFundingPercentages from './ProposalFundingPercentages';
import ProposalQuickpitch from './ProposalQuickpitch';
import ProposalSolution from './ProposalSolution';
import ProposalStatus from './ProposalStatus';
import ProposalUsers from './ProposalUsers';
import ProposalFundingStatus from './ProposalFundingStatus';

interface Proposal extends Record<string, unknown> {
    proposal: App.DataTransferObjects.ProposalData;
}
export default function ProposalCard({ proposal }: PageProps<Proposal>) {
    const gradientColors: Record<string, unknown> = {
        complete:
            'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default:
            'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };

    const headerBGColor =
        gradientColors[proposal.status] || gradientColors.default;

    const absatainVotes = shortNumber(proposal.abstain_votes_count) ?? '(N/A)';
    const yesVotes = shortNumber(proposal.yes_votes_count) ?? '(N/A)';

    const [quickPitchView, setQuickPitchView] = useState(false);

    return (
        <article className="rounded-xl bg-background p-2 shadow-lg">
            <header
                className={`mb-2 rounded-xl bg-gradient-to-tr text-content-light ${headerBGColor}`}
            >
                <div className="flex items-center justify-between p-4">
                    <ProposalStatus status={proposal.status} />
                    <ProposalBookmark />
                </div>
                <div className="mb-4 px-4">
                    <a
                        href="#"
                        className="text-2 font-medium leading-tight hover:text-primary"
                    >
                        ACCO2 - The end of eco-fraud! An open-source blockchain
                        and science-based framework for carbon accounting
                        (ACCO2) in the steel industry.
                    </a>
                </div>
                <nav
                    className="flex bg-white bg-opacity-10 p-2 font-semibold text-content-light"
                    aria-label="Related Platforms"
                >
                    <a
                        href={proposal.ideascale_link}
                        className="text-4 flex w-1/2 items-center justify-center border-r text-opacity-100"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ideascale
                    </a>
                    <a
                        href={proposal.projectcatalyst_io_link}
                        className="text-4 flex w-1/2 items-center justify-center text-opacity-100"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Projectcatalyst.io
                    </a>
                </nav>
            </header>

            <div className="p-2">
                <nav
                    className="border-b"
                    aria-label="Project details navigation"
                >
                    <ul className="flex justify-between">
                        <li className="w-1/2">
                            <button
                                onClick={() => setQuickPitchView(false)}
                                className={`w-full border-b-2 pb-3 font-semibold ${
                                    !quickPitchView
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-content'
                                }`}
                                aria-current={
                                    !quickPitchView ? 'page' : undefined
                                }
                            >
                                Details
                            </button>
                        </li>
                        <li className="flex w-1/2 items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setQuickPitchView(true)}
                                className={`flex items-center gap-1 pb-3 font-semibold ${
                                    quickPitchView
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'border-transparent text-content'
                                }`}
                                aria-current={
                                    quickPitchView ? 'page' : undefined
                                }
                            >
                                <span>Quick Pitch</span>
                                <span className="text-dark-persist rounded-full bg-content-light px-2 py-1 text-xs">
                                    Not set
                                </span>
                            </button>
                        </li>
                    </ul>
                </nav>
                <section className="mt-6" aria-labelledby="funding-heading">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Funding</h3>
                        <ProposalFundingStatus funding_status={proposal.funding_status}/>
                    </div>
                    <ProposalFundingPercentages proposal={proposal} />
                </section>

                <div className="my-4 border-b"></div>

                <div className="relative h-36">
                    {quickPitchView ? (
                        <ProposalQuickpitch />
                    ) : (
                        <ProposalSolution
                            solution={proposal.solution}
                            slug={proposal.slug}
                        />
                    )}
                </div>

                {proposal.users && <ProposalUsers users={proposal.users} />}

                <div className="my-4 border-b"></div>

                <footer className="mt-4 flex items-center justify-between rounded-lg border border-t">
                    <button className="text-4 flex w-1/2 items-center justify-center border-r p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 font-medium text-success"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                            />
                        </svg>
                        <span className="flex gap-2">
                            <span className="font-semibold">Yes</span>
                            <span className="text-highlight">({yesVotes})</span>
                        </span>
                    </button>
                    <div className="h-full border-r"></div>
                    <button className="text-4 flex w-1/2 items-center justify-center p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 font-medium"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                            />
                        </svg>
                        <span className="flex gap-2">
                            <span className="font-semibold">Abstain</span>
                            <span className="text-highlight">
                                ({absatainVotes})
                            </span>
                        </span>
                    </button>
                </footer>
            </div>
        </article>
    );
}
