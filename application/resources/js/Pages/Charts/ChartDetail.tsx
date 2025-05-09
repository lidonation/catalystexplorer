import React from 'react';
import { Head } from '@inertiajs/react';
import ModalLayout from '@/Layouts/ModalLayout';
import Title from '@/Components/atoms/Title';

const Detail = () => {
    return (
        <ModalLayout>
            <Head title="Chart Details" />
            
            <div className="p-6">
                <Title level="2">Chart Details</Title>
                
                <div className="mt-4">
                   
                    <div className="bg-gray-100 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Sample Chart</h3>
                        <div className="h-60 w-full bg-gradient-to-r from-blue-100 to-green-100 rounded flex items-center justify-center">
                            <p className="text-gray-500">Chart visualization would appear here</p>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <p>This is placeholder content for a chart visualization.</p>
                            <p className="mt-2">In a real implementation, you would integrate with a charting library.</p>
                        </div>
                    </div>
                </div>
            </div>
        </ModalLayout>
    );
};

export default Detail;