import { PageProps } from "@/types";

interface ProposalSolution extends Record<string, unknown> {
    solution?: string;
    slug?: string;
}

export default function ProposalSolution({ solution, slug }: PageProps<ProposalSolution>) {
    return (
        <section className="" aria-labelledby="solution-heading">
            <div className="flex justify-between">
                <h3 id="solution-heading" className="font-medium text-content">
                    Solution
                </h3>
                <a href={slug} target="_blank" className="text-primary hover:underline">
                    See more
                </a>
            </div>

            <p className="mt-4 text-content">
                People need to feel protected and safe when using Cardano
                (crypto). Crypto native cyber insurance was the m...{' '}
            </p>
        </section>
    );
}
