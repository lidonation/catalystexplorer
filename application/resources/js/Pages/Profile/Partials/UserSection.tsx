import Image from '@/Components/Image';
import Title from '@/Components/atoms/Title';
import BackgroundHeader from '@/assets/images/background-header.png';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Mail, MapPin } from 'lucide-react';
import User = App.DataTransferObjects.UserData;

interface UserSectionProps {
    user: User;
}

const UserSection = ({ user }: UserSectionProps) => {
    const { t } = useLaravelReactI18n();
    return (
        <div className="flex flex-col items-center px-4 text-center">
            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 h-full">
                    <div className="bg-background-lighter h-full w-full overflow-hidden">
                        <Image
                            imageUrl={BackgroundHeader}
                            alt={t('profileBackground')}
                            size="w-full h-full object-cover"
                        />
                        <div className="from-background-lighter absolute inset-y-0 left-0 w-32 bg-gradient-to-r to-transparent"></div>
                        <div className="from-background-lighter absolute inset-y-0 right-0 w-32 bg-gradient-to-l to-transparent"></div>
                    </div>
                </div>

                <div className="relative flex flex-col items-center text-center">
                    <div className="mt-16">
                        <Image
                            imageUrl={user?.hero_img_url}
                            size="h-32 w-32 border-4 border-background shadow-lg"
                        />
                    </div>

                    <Title level="3" className="mt-3 text-lg md:text-xl">
                        {user.name}
                    </Title>

                    <div className="text-darker mt-2 mb-6 flex flex-col gap-2 text-sm md:flex-row md:gap-6 md:text-base">
                        <div className="flex items-center justify-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            {user.locations?.length > 0 ? (
                                <span className="max-w-[200px] break-words md:max-w-none">
                                    {JSON.stringify(user.locations)}
                                </span>
                            ) : (
                                <Link
                                    href="#"
                                    className="text-primary underline"
                                >
                                    {t('addYourCity')}
                                </Link>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />

                            {user.email ? (
                                <span className="max-w-[200px] break-words md:max-w-none">
                                    {user.email}
                                </span>
                            ) : (
                                <Link
                                    href="#"
                                    className="text-primary underline"
                                >
                                    {t('addEmail')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSection;
