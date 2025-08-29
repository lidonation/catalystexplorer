import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import FundData = App.DataTransferObjects.FundData;

interface ActiveFundBannerProps extends Record<string, unknown> {
    fund: FundData;
}

const ActiveFundBanner: React.FC<ActiveFundBannerProps> = ({ fund }) => {
    const { t } = useLaravelReactI18n();
    return (
        <section className="container py-8">
            <div className="relative flex md:h-120 h-60 w-full items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-gray-100 to-gray-900">
                <img
                    src={fund.banner_img_url}
                    alt={fund.title || 'Fund'}
                    className="h-full w-full object-cover"
                />
                <div className="absolute top-1/2 left-12 -translate-y-1/2 text-white hidden md:block">
                    <Title
                        level="1"
                        className="font-bold "
                    >{`${t('activeFund.title')} - ${fund?.title}`}</Title>
                    <Paragraph className="line-clamp-3 min-h-[4.5rem] w-96 leading-relaxed" size='md'>
                        {t('activeFund.subtitle')}
                    </Paragraph>
                </div>
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 text-white block md:hidden">
                    <Title
                        level="3"
                        className="font-bold "
                    >{`${t('activeFund.title')} - ${fund?.title}`}</Title>
                    <Paragraph className=" leading-relaxed" size='md'>
                        {t('activeFund.subtitle')}
                    </Paragraph>
                </div>
            </div>
        </section>
    );
};

export default ActiveFundBanner;
