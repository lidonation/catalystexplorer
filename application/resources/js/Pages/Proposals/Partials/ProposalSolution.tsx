import { PageProps } from '@/types';

interface ProposalSolution extends Record<string, unknown> {
    solution?: string;
    problem?: string;
    slug?: string;
}

function truncateText(text: string | null, wordLimit: number): string {
    if (!text) {
        return '';
    }
    const words = text.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
}

export default function ProposalSolution({
    solution = '',
    problem = '',
    slug,
}: PageProps<ProposalSolution>) {
    const text: string | null = solution.length ? solution : problem;
    const wordLimit = 15;
    const truncatedSolution = truncateText(text, wordLimit);

    return (
        <section
            className="proposal-solution"
            aria-labelledby="solution-preview"
        >
            <header className="solution-header flex justify-between">
                <h2 id="solution-heading" className="font-medium text-content">
                    Solution
                </h2>
                <nav aria-label="Go to proposal">
                    <a
                        href={`proposals/${slug}`}
                        target="_blank"
                        className="text-primary hover:underline"
                    >
                        See more
                    </a>
                </nav>
            </header>

            <article className="solution-content mt-4 text-content">
                <p>{truncatedSolution}</p>
            </article>
        </section>
    );
}
