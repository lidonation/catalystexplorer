import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import RecordsNotFound from '@/Layouts/RecordsNotFound';

interface MyGroupsProps {
    notSureWhatThisIs?: any[];
}

export default function MyGroups({}: MyGroupsProps) {
    const { t } = useTranslation();

    return (
        <MyLayout >
            <Head title="My Groups" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    <RecordsNotFound />
                </div>
            </div>
        </MyLayout>
    );
}
