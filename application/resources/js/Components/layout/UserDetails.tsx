import { useTranslation } from 'react-i18next';
import LogOutIcon from '../svgs/LogOut';

function UserDetails() {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-400"></div>
                <div className="flex flex-col">
                    <p className="text-sm text-content-primary">
                        {t('app.name')}
                    </p>
                    <p className="text-xs text-content-primary">
                        {t('app.contactEmail')}
                    </p>
                </div>
            </div>
            <LogOutIcon
                className="text-content-tertiary"
                width={20}
                height={20}
            />
        </div>
    );
}

export default UserDetails;
