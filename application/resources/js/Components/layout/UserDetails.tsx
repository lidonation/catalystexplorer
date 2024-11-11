import { useTranslation } from 'react-i18next';
import LogOutIcon from '../svgs/LogOut';
import Avatar from '../Avatar';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { route } from '../../../../vendor/tightenco/ziggy/src/js';



export interface UserDetailsProps {
    name: string,
    email: string,

}

const UserDetails: React.FC<UserDetailsProps> = ({ name, email }) => {
    const { t } = useTranslation();

    const logout = () => {
        axios.post(route('logout')).then((response) => {
            console.log(response)
            window.location.href = '/'
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex gap-3">
                <Avatar/>
                <div className="flex flex-col">
                    {name && email ? (
                        <Link href='/dashboard' className="text-sm font-semibold text-content-primary">
                            {name}
                        </Link>
                    ) : <p className="text-sm font-semibold text-content-primary">{t('app.name')}</p>}

                    <p className="text-xs text-content-primary">
                        {email || t('app.contactEmail')}
                    </p>
                    {name && email && (
                        <Link href='/profile' className="text-xs font-semibold text-primary-100">
                            Edit profile
                        </Link>
                    )}
                </div>
            </div>
            <LogOutIcon
                className="text-content-tertiary cursor-pointer"
                width={20}
                height={20}
                onClick={()=>logout()}
            />
        </div>
    );
}

export default UserDetails;
