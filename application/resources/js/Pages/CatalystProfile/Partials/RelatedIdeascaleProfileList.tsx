import Paragraph from '@/Components/atoms/Paragraph';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { HTMLAttributes } from 'react';
import CatalystProfileCardMini from './CatalystProfileCardMini';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface CatalystProfilesListProps extends HTMLAttributes<HTMLDivElement> {
    catalystProfiles: PaginatedData<CatalystProfileData[]>;
}

const RelatedCatalystProfilesList: React.FC<CatalystProfilesListProps> = ({
    catalystProfiles,
    ...props
}) => {
    const { t } = useLaravelReactI18n();

    if (!catalystProfiles?.total) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeIn' }}
                >
                    <RecordsNotFound context="profiles" searchTerm="" />
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            <div
                className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                {...props}
            >
                {!!catalystProfiles?.data &&
                    catalystProfiles?.data.map((catalystProfile, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, ease: 'easeIn' }}
                            className="border-border-dark-on-dark h-full rounded-lg border-2"
                        >
                            <CatalystProfileCardMini
                                catalystProfile={catalystProfile}
                            />
                        </motion.div>
                    ))}

                {!!catalystProfiles?.data &&
                    catalystProfiles?.total > catalystProfiles?.per_page && (
                        <div className="">
                            <Link
                                href="#"
                                className="bg-background flex h-full flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-transform hover:scale-95"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-center">
                                        <Paragraph className="text-sm text-gray-600">
                                            {t('seeAll')}
                                        </Paragraph>
                                        <Paragraph className="text-xl font-semibold">
                                            {catalystProfiles.total}
                                        </Paragraph>
                                        <Paragraph className="text-sm text-gray-600">
                                            {t(
                                                'catalystProfiles.catalystProfiles',
                                            )}
                                        </Paragraph>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
            </div>
        </AnimatePresence>
    );
};

export default RelatedCatalystProfilesList;
