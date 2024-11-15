import SearchBar from '@/Components/SearchBar';
import BlueEyeIcon from '@/Components/svgs/BlueEyeIcon';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import { useTranslation } from 'react-i18next';

const CatalystIntro = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-gradient-to-r from-background-home-gradient-color-1 to-background-home-gradient-color-2 md:rounded-tl-4xl">
            <div
                className="w-full"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="container mx-auto flex flex-col items-center justify-between gap-10 py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <BlueEyeIcon
                            className="text-eye-logo"
                            width={90}
                            height={50}
                        />
                        <div>
                            <p className="text-center text-3xl text-content-light">
                                {t('catalystIntro.title.normalText')}{' '}
                                <span className="text-content-highlight-intro">
                                    {t('catalystIntro.title.highlightedText')}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-center text-content-light">
                                {t('catalystIntro.subtitle')}
                            </p>
                        </div>
                    </div>
                    <div>
                        <SearchBar autoFocus />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalystIntro;
