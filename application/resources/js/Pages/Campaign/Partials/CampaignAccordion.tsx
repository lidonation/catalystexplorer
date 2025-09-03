import Button from '@/Components/atoms/Button';
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
            <div className="flex w-full items-center">
                <div className="text-content text-left">
                    <Title level="6" className="font-medium">
                        <Markdown>{title}</Markdown>
                    </Title>
                </div>
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex size-8 items-center justify-center text-lg transition-transform"
                >
                    <AccordionButton isOpen={isOpen} />
                </Button>
            </div>

            {isOpen && (
                <div className="text-content py-4 text-left">
                    <Markdown>{content}</Markdown>
                </div>
            )}
        </div>
    );
};

export default CampaignAccordion;
