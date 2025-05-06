import { ReactNode } from 'react';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import CatalystEyeIcon from '@/Components/svgs/CatalystEyeIcon';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import LoginImageOne from '@/assets/images/login-image-one.png';
import LoginImageTwo from '@/assets/images/login-image-two.png';
import LoginImageThree from '@/assets/images/login-image-three.png';
import LoginImageFour from '@/assets/images/login-image-four.png';
import LoginImageFive from '@/assets/images/login-image-five.png';
import Image from '@/Components/Image';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col lg:flex-row w-full items-center justify-center min-h-screen'>
      <div className='p-4 mt-30 mb-30 ml-54 mr-54 w-[300px] sm:w-[400px] lg:w-[700px] bg-background rounded-xl shadow-md inline-flex flex-col justify-start items-center gap-7'>
        <div className="flex justify-center p-3">
          <CatalystLogo />
        </div>
        {children}
      </div>

      <div 
        className='w-full splash-wrapper bg-gradient-to-r from-background-home-gradient-color-1 to-background-home-gradient-color-2 hidden lg:flex lg:sticky z-10 justify-center lg:rounded-tl-4xl lg:-top-64 lg:h-screen lg:order-2'
      >
        <div
          className="flex h-full w-full flex-col justify-center relative overflow-visible lg:gap-8 lg:pt-8"
          style={{
            backgroundImage: `url(${ConcentricCircles})`,
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute top-0 left-0 p-4 md:p-6 lg:p-10">
            <CatalystEyeIcon />
            <Title level='1' className='text-light-persist'>{t('app.name')}</Title>
            <Paragraph className='text-light-persist text-base font-normal max-w-md'>
              {t('authMessage')}
            </Paragraph>
          </div>

          <div className="mt-45 relative overflow-hidden">
            <div className="flex items-end gap-6">
              <Image imageUrl={LoginImageOne} className="w-[292.67px] h-[295.3px]" />
              <Image imageUrl={LoginImageTwo} className="w-[320.67px] h-[232px]" />
              <Image imageUrl={LoginImageThree} className="w-[461.3px] h-[464px]" />
            </div>
            
            <div className="flex mt-6 gap-6">
              <Image imageUrl={LoginImageFour} className="w-[292.67px] h-[481.3px]" />
              <Image imageUrl={LoginImageFive} className="w-[543.5px] h-[361px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
