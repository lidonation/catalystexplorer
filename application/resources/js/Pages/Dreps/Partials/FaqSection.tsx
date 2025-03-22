import { useState } from 'react';
import Paragraph from "@/Components/atoms/Paragraph";
import Title from "@/Components/atoms/Title";
import { useTranslation } from 'react-i18next';
import Button from '@/Components/atoms/Button';
import MinusIcon from '@/Components/svgs/MinusIcon';
import PlusIcon from '@/Components/svgs/PlusIcon';

// Define interface for FAQ item props
interface FaqItemProps {
    question: string;
    answer: string;
}

// FAQItem component with toggle functionality
const FaqItem = ({ question, answer }: FaqItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <>
            <div 
                className="flex justify-between items-center p-4 cursor-pointer bg-background hover:bg-background-darker"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Title level="3" className="font-semibold text-lg">{question}</Title>
                <Button 
                    className="w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full bg-transparent text-content"
                >
                    {isOpen ? <MinusIcon/> : <PlusIcon/> }
                </Button>
            </div>
            
            <div 
                className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <Paragraph className="p-4 text-content">
                    {answer}
                </Paragraph>
            </div>
        </>
    );
};

// Define interface for FAQ data
interface FaqData {
    question: string;
    answer: string;
}

const FaqSection = () => {
    const { t } = useTranslation();
    const faqs: FaqData[] = [
        {
            question: t('dreps.faq.question1'),
            answer: t('dreps.faq.answer1')
        },
        {
            question: t('dreps.faq.question2'),
            answer: t('dreps.faq.answer2')
        },
        {
            question: t('dreps.faq.question3'),
            answer: t('dreps.faq.answer3')
        },
        {
            question: t('dreps.faq.question4'),
            answer: t('dreps.faq.answer4')
        },
        {
            question: t('dreps.faq.question5'),
            answer: t('dreps.faq.answer5')
        },
        {
            question: t('dreps.faq.question6'),
            answer: t('dreps.faq.answer6')
        },
        {
            question: t('dreps.faq.question7'),
            answer: t('dreps.faq.answer1')
        }
    ];

    return (
        <div className="py-16 bg-background-dark m-2">
            <div className="container px-4 border-2 border-background bg-background shadow-md rounded-lg">
                <Title level="2" className="text-2xl font-bold mb-8 mt-4 text-center">{t('faq.faq')}</Title>
                
                <div className="space-y-6 mb-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-dark rounded-lg overflow-hidden">
                            <FaqItem question={faq.question} answer={faq.answer} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaqSection;
