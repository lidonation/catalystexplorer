import Title from '@/Components/atoms/Title';
import AccordionButton from '@/Components/svgs/AccordionButton';
import Markdown from 'marked-react';
import { useState } from 'react';

interface CampaignAccordionProps {
    title?: string;
    content?: string;
}

const CampaignAccordion: React.FC<CampaignAccordionProps> = ({
    title,
    content,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <button
                className="flex w-full items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-content text-left font-bold">
                    <Title level="4" className="font-semibold">
                        <Markdown>{title}</Markdown>
                    </Title>
                </span>
                <span
                    className={`flex h-8 w-8 items-center justify-center text-lg transition-transform`}
                >
                    <AccordionButton isOpen={isOpen} />
                </span>
            </button>
            {isOpen && (
                <div className="text-content p-4 text-left text-xl">
                    <Markdown>{content}</Markdown>
                </div>
            )}
        </div>
    );
};

export default CampaignAccordion;
