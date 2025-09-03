import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import MinusIcon from '@/Components/svgs/MinusIcon';
import PlusIcon from '@/Components/svgs/PlusIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';

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
                className="bg-background hover:bg-background-darker flex cursor-pointer items-center justify-between px-6 py-3 md:py-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Title level="3" className="text-xl font-semibold">
                    {question}
                </Title>
                <Button className="text-content flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-lg font-bold">
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                </Button>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <Paragraph className="text-content px-6 py-2 md:py-4">
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
    const { t } = useLaravelReactI18n();
    const faqs: FaqData[] = [
        {
            question: t('dreps.faq.question1'),
            answer: t('dreps.faq.answer1'),
        },
        {
            question: t('dreps.faq.question2'),
            answer: t('dreps.faq.answer2'),
        },
        {
            question: t('dreps.faq.question3'),
            answer: t('dreps.faq.answer3'),
        },
        {
            question: t('dreps.faq.question4'),
            answer: t('dreps.faq.answer4'),
        },
        {
            question: t('dreps.faq.question5'),
            answer: t('dreps.faq.answer5'),
        },
        {
            question: t('dreps.faq.question6'),
            answer: t('dreps.faq.answer6'),
        },
        {
            question: t('dreps.faq.question7'),
            answer: t('dreps.faq.answer1'),
        },
    ];

    return (
        <div className="bg-background-dark px-0 py-6 md:px-6">
            <div className="border-background bg-background mx-auto rounded-xl border-2 px-6 py-6 shadow-md">
                <Title
                    level="2"
                    className="mb-8 text-center text-2xl font-bold"
                >
                    {t('dreps.faq.faq')}
                </Title>

                <div className="mb-4 flex flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border-dark-light overflow-hidden border"
                        >
                            <FaqItem
                                question={faq.question}
                                answer={faq.answer}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaqSection;
