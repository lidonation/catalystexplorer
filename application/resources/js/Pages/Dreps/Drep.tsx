import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;

interface DrepPageProps {
    drep: CatalystDrepData;
}
const DrepPage = ({ drep }: DrepPageProps) => {
    const { t } = useLaravelReactI18n();
    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };
    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log('Copied to clipboard:', text);
            })
            .catch((err) => {
                console.error('Failed to copy:', err);
            });
    };
    return (
        <div>
            <Head title="Dreps" />
            <header>
                <div className="container flex gap-2">
                    <Title level="2">
                        {formatAddress(drep?.stake_address ?? '')}
                    </Title>
                    <Button
                        onClick={() => copyToClipboard(drep?.stake_address ?? '')}
                        className="ml-2 rounded-full p-1 hover:bg-gray-100"
                        ariaLabel={t('copyToClipboard')}
                    >
                        <CopyIcon
                            width={16}
                            height={16}
                            className="text-gray-persist"
                        />
                    </Button>
                </div>
                <div className="container">
                    <Paragraph className="text-content">
                        {t('dreps.drepList.subtitle')}
                    </Paragraph>
                </div>
            </header>
        </div>
    );
};

export default DrepPage;
