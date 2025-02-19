import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import RecordsNotFound from '@/Layouts/RecordsNotFound';

interface MyCommunitiesProps {
    notSureWhatThisIs?: any[];
}

export default function MyCommunities({}: MyCommunitiesProps) {
    const { t } = useTranslation();

    return (
        <MyLayout>
            <Head title="My Communities" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
                </div>
            </div>
        </MyLayout>
    );
}