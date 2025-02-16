import { MapPin, Mail } from 'lucide-react';
import Title from '@/Components/atoms/Title';
import User = App.DataTransferObjects.UserData;
import BackgroundHeader from '@/assets/images/Ideascale Profile Background Header.png';

interface UserSectionProps {
    user: User;
}

const UserSection = ({ user }: UserSectionProps) => {
    return (
        <div className="flex flex-col items-center text-center px-4">
            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 h-full">
                    <div className="w-full h-full overflow-hidden bg-background-lighter">
                        <img
                            src={BackgroundHeader}
                            alt="Profile background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background-lighter to-transparent"></div>
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background-lighter to-transparent"></div>
                    </div>
                </div>

                {/* Content container */}
                <div className="relative flex flex-col items-center text-center">
                    <div className="mt-16">
                        <img
                            src={user.profile_photo_url}
                            alt={user.name}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-lg"
                        />
                    </div>

                    <Title level='3' className="mt-3 text-lg md:text-xl">{user.name}</Title>
                    
                    <div className="mt-2 flex flex-col gap-2 md:flex-row md:gap-6 text-darker text-sm md:text-base mb-6">
                        <div className="flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {user.location ? (
                                <span className="break-words max-w-[200px] md:max-w-none">{user.location}</span>
                            ) : (
                                <a href="#" className="text-primary underline cursor-pointer">Add your city</a>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {user.email ? (
                                <span className="break-words max-w-[200px] md:max-w-none">{user.email}</span>
                            ) : (
                                <a href="#" className="text-primary underline cursor-pointer">Add email</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSection;
