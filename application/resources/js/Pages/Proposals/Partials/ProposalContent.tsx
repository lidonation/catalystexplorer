import MinusIcon from '@/Components/svgs/MinusIcon';
import PlusIcon from '@/Components/svgs/PlusIcon';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ProposalContentProps {
    proposal?: App.DataTransferObjects.ProposalData;
}

function normalizeMarkdown(text: string): string {
    if (!text) return '';

    return (
        text
            .replace(/\\\./g, '.')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\[/g, '[')
            .replace(/\\\]/g, ']')
            .replace(/\\\-/g, '-')
            .replace(/\\_/g, '_')
            .replace(/\\\*/g, '*')
            .replace(/\*\*\s*(.*?)\s*\*\*/g, '**$1**')
            .replace(/\*\s*(.*?)\s*\*/g, '*$1*')
            .replace(/\r\n/g, '\n')
            .replace(/\\(?=[A-Za-z0-9])/g, '')
    );
}

const CHECKLIST_LABELS: Record<string, string> = {
    foundational_work: 'I confirm that evidence of prior research, whitepaper, design, or proof-of-concept is provided.',
    ecosystem_value: 'I confirm that the proposal includes ecosystem research and uses the findings to either (a) justify its uniqueness over existing solutions or (b) demonstrate the value of its novel approach.',
    builder_credentials: 'I confirm that the proposal demonstrates technical capability via verifiable in-house talent or a confirmed development partner (GitHub, LinkedIn, portfolio, etc.)',
    catalyst_standing: 'I confirm that the proposer and all team members are in good standing with prior Catalyst projects.',
    problem_use_case: 'I confirm that the proposal clearly defines the problem and the value of the on-chain utility.',
    tangible_prototype: 'I confirm that the primary goal of the proposal is a working prototype deployed on at least a Cardano testnet.',
    technical_approach: 'I confirm that the proposal outlines a credible and clear technical plan and architecture.',
    realistic_scope: 'I confirm that the budget and timeline (≤ 12 months) are realistic for the proposed work.',
    community_engagement: 'I confirm that the proposal includes a community engagement and feedback plan to amplify prototype adoption with the Cardano ecosystem.',
    budget_compliance: 'I confirm that the budget is for future development only; excludes retroactive funding, incentives, giveaways, re-granting, or sub-treasuries.',
    consent_confirmation: '[Required Acknowledgements] Consent & Confirmation',
};

const ProposalContent = ({ proposal }: ProposalContentProps) => {
    const [expanded, setExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const MAX_HEIGHT = 580;

    const formatHeader = (text: string) => {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .toUpperCase();
    };

    const parseContent = () => {
        if (!proposal) return [];

        if (typeof proposal === 'object' && !Array.isArray(proposal)) {
            const structuredSections = [];

            if (proposal.project_details?.solution?.solution) {
                structuredSections.push({
                    header: 'Proposed Solution',
                    content: proposal.project_details.solution.solution,
                });
            }

            if (proposal.project_details?.impact?.impact) {
                structuredSections.push({
                    header: 'Project Impact',
                    content: proposal.project_details.impact.impact,
                });
            }

            if (proposal.project_details?.feasibility?.feasibility) {
                structuredSections.push({
                    header: 'Feasibility & Capability',
                    content: proposal.project_details.feasibility.feasibility,
                });
            }

            if (proposal.pitch?.team?.who) {
                structuredSections.push({
                    header: 'The Team',
                    content: proposal.pitch.team.who,
                });
            }

            if (proposal.theme?.tag || proposal.theme?.group) {
                const themeContent = [
                    proposal.theme.tag ? `**Tag:** ${proposal.theme.tag}` : '',
                    proposal.theme.group ? `**Group:** ${proposal.theme.group}` : ''
                ].filter(Boolean).join('\n\n');

                structuredSections.push({
                    header: 'Theme',
                    content: themeContent,
                });
            }

            if (proposal.pitch?.value?.note) {
                structuredSections.push({
                    header: 'Ecosystem Value',
                    content: proposal.pitch.value.note,
                });
            }

            if (proposal.pitch?.budget?.costs) {
                structuredSections.push({
                    header: 'Budget Breakdown',
                    content: proposal.pitch.budget.costs,
                });
            }

            const categoryItems = [];
            
            if (proposal.category_questions?.innovative_idea) {
                categoryItems.push(`### Innovative Idea\n\n${proposal.category_questions.innovative_idea}`);
            }

            if (proposal.category_questions?.performance_metrics) {
                categoryItems.push(`### Performance Metrics\n\n${proposal.category_questions.performance_metrics}`);
            }

            if (proposal.category_questions?.prototype_mvp) {
                categoryItems.push(`### Prototype / MVP\n\n${proposal.category_questions.prototype_mvp}`);
            }

            if (categoryItems.length > 0) {
                structuredSections.push({
                    header: 'Category Questions',
                    content: categoryItems.join('\n\n---\n\n'),
                });
            }

            if (proposal.self_assessment?.checklist) {
                const checklistItems = Object.entries(proposal.self_assessment.checklist)
                    .map(([key, value]) => {
                        const label = CHECKLIST_LABELS[key] || 
                            key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        
                        const isChecked = value === true || 
                                        value === 'Yes' || 
                                        value === 'I Agree' ||
                                        (typeof value === 'string' && value.toLowerCase() === 'yes');
                        
                        return isChecked ? `${label}  \n**Yes**` : label;
                    })
                    .join('\n\n');

                structuredSections.push({
                    header: 'Self Assessment Checklist',
                    content: checklistItems,
                });
            }

            if (structuredSections.length > 0) return structuredSections;
            
            if (proposal.content) {
                return [{
                    header: 'Overview',
                    content: proposal.content
                }];
            }
        }

        let contentText: string = typeof proposal === 'string' 
            ? proposal 
            : JSON.stringify(proposal);

        return parseProposalSections(contentText);
    };

    const parseProposalSections = (text: string) => {
        const sectionRegex = /(?:^|\n)(?:###\s*)?(?:\\\[|\[)(.*?)(?:\\\]|\])\s*\n(.*?)(?=(?:^|\n)(?:###\s*)?(?:\\\[|\[)|$)/gs;
        const sections = [];
        let match;
        while ((match = sectionRegex.exec(text)) !== null) {
            const header = match[1].trim();
            const content = match[2].trim();
            if (header) {
                sections.push({ header, content });
            }
        }
        if (sections.length === 0 && text.trim()) {
            sections.push({ header: 'Overview', content: text.trim() });
        }
        return sections;
    };

    useEffect(() => {
        if (contentRef.current) {
            setHasOverflow(contentRef.current.scrollHeight > MAX_HEIGHT);
        }
    }, [proposal]);

    const sections = parseContent();

    return (
        <div className="bg-background my-4 overflow-hidden rounded-xl p-6 shadow-sm">
            <div
                ref={contentRef}
                className={`relative ${!expanded && hasOverflow ? 'overflow-hidden' : ''}`}
                style={{ maxHeight: !expanded && hasOverflow ? `${MAX_HEIGHT}px` : 'none' }}
            >
                {sections.map((section, index) => (
                    <div key={index} className="mb-10 last:mb-0">
                        <h2 className="text-content mb-6 text-xl font-bold tracking-tight border-b pb-2 border-content/20">
                            {formatHeader(section.header)}
                        </h2>

                        <div className="prose max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    p: ({ node, ...props }) => <p className="text-content my-3 leading-relaxed" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="my-4 list-disc space-y-2 pl-6" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-content mt-8 mb-4"  {...props} />,
                                    hr: () => <hr className="my-8 border-content/20" />,
                                    strong: ({ node, ...props }) => <strong className="font-bold text-content" {...props} />,
                                    a: ({ node, ...props }) => (
                                        <a className="text-primary font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                                    ),
                                }}
                            >
                                {normalizeMarkdown(section.content)}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {!expanded && hasOverflow && (
                    <div className="from-background absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t to-transparent pointer-events-none" />
                )}
            </div>

            {hasOverflow && (
                <div className="mt-6 flex justify-center border-t border-content/20 pt-4">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center justify-center p-2 rounded-full transition-colors"
                    >
                        {expanded ? <MinusIcon className="w-6 h-6 text-content/60" /> : <PlusIcon className="w-6 h-6 text-content/60" />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProposalContent;