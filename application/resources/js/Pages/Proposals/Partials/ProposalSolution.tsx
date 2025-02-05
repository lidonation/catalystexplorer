import { PageProps } from '@/types';
import Markdown from "marked-react";

interface ProposalSolution extends Record<string, unknown> {
    solution?: string;
    problem?: string;
    slug?: string;
}

function truncateText(text: string | null, limit: number): string {
    if (!text) {
        return '';
    }
    const words = text.split(' ');
    if (text.length > limit) {
        return text.slice(0, limit) + '...';
    }
    return text;
}

export default function ProposalSolution({
    solution = '',
    problem = '',
    slug,
}: PageProps<ProposalSolution>) {
    const text: string | null = solution.length ? solution : problem;

    return (
        <section
            className="proposal-solution"
            aria-labelledby="solution-preview"
        >
            <header className="solution-header flex justify-between">
                <h2 id="solution-heading" className="text-content font-medium">
                    Solution
                </h2>
            </header>

            <div className="solution-content text-content pb-1 line-clamp-5">
                <Markdown>{text}</Markdown>
            </div>
        </section>
    );
}
