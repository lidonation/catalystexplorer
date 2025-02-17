import { MapPin, Mail } from 'lucide-react';
import Title from '@/Components/atoms/Title';
import User = App.DataTransferObjects.UserData;
import BackgroundHeader from '@/assets/images/background-header.png';
import { useTranslation } from 'react-i18next';
import Image from '@/Components/Image';
import { Link, usePage } from '@inertiajs/react';

interface UserSectionProps {
    user: User;
}

const UserSection = ({ user }: UserSectionProps) => {
    const { t } = useTranslation();
    const { url } = usePage().props;
    
    const isDashboardPage = typeof url === 'string' 
        ? url.includes('/my/dashboard')
        : window.location.pathname.includes('/my/dashboard');

    return (
        <div className="flex flex-col items-center text-center px-4">
            <div className={`
                relative w-full max-w-md 
                ${isDashboardPage ? 'h-150px' : 'h-50px'}
            `}>
                <div className="absolute inset-0 h-full">
                    <div className="w-full h-full overflow-hidden bg-background-lighter">
                        <Image 
                            imageUrl={BackgroundHeader}
                            alt={t('profileBackground')} 
                            size="w-full h-full object-cover"
                        />
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background-lighter to-transparent"></div>
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background-lighter to-transparent"></div>
                    </div>
                </div>

                <div className="relative flex flex-col items-center text-center">
                    <div className={`
                        ${isDashboardPage 
                            ? 'mt-16' 
                            : 'mt-2 scale-75'
                        }
                    `}>
                        <Image
                            imageUrl={user.profile_photo_url}
                            size={`
                                ${isDashboardPage 
                                    ? 'h-32 w-32' 
                                    : 'h-24 w-24'
                                }
                                h-32 w-32 border-4 border-background shadow-lg
                            `}
                        />
                    </div>

                    <Title level='3' className={`
                        mt-3 text-lg md:text-xl 
                        ${isDashboardPage ? 'text-base' : 'text-sm'}
                    `}>
                        {user.name}
                    </Title>
                    
                    <div className={`
                        mt-2 flex flex-col gap-2 md:flex-row md:gap-6 
                        text-darker text-sm md:text-base mb-6
                    `}>
                        <div className="flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {user.locations ? (
                                <span className="break-words max-w-[200px] md:max-w-none">{user.locations}</span>
                            ) : (
                                <Link href="#" className="text-primary underline">{t('addYourCity')}</Link>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {user.email ? (
                                <span className="break-words max-w-[200px] md:max-w-none">{user.email}</span>
                            ) : (
                                <Link href="#" className="text-primary underline">{t('addEmail')}</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSection;
