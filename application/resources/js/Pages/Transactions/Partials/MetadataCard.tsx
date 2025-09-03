import Title from '@/Components/atoms/Title';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { JsonWrapper } from '../../../Components/JsonDisplay';
import TransactionData = App.DataTransferObjects.TransactionData;

interface MetadataCardProps {
    transaction: TransactionData;
}

export default function MetadataCard({ transaction }: MetadataCardProps) {
    const { t } = useLaravelReactI18n();
    const [showRawData, setShowRawData] = useState(false);

    return (
        <div className="bg-background mb-6 rounded-lg p-6">
            <div className="border-background-lighter flex items-center justify-between border-b pb-4">
                <Title className="text-content font-bold" level="3">
                    {t('transactions.metadata')}
                </Title>
                <div className="flex items-center">
                    <span className="text-gray-persist mr-2 text-sm">
                        {t('transactions.rawData')}
                    </span>
                    <div
                        onClick={() => setShowRawData(!showRawData)}
                        className={`h-4 w-7 p-1 ${
                            showRawData
                                ? 'bg-primary'
                                : 'bg-background-lighter outline-light-persist shadow-[inset_0px_2px_5px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px]'
                        } inline-flex rounded-[30px] ${
                            showRawData ? 'justify-end' : 'justify-start'
                        } cursor-pointer items-center gap-2.5 transition-colors duration-300`}
                        data-public-profile-switch={showRawData ? 'on' : 'off'}
                    >
                        <div
                            className={`h-3 w-3 rounded-full bg-white transition-transform duration-300 ${
                                showRawData ? 'translate-x-1' : 'translate-x-0'
                            }`}
                        />
                    </div>
                </div>
            </div>

            {transaction.raw_metadata && !showRawData && (
                <div className="space-y-4 pt-4">
                    {Object.entries(transaction.raw_metadata).map(
                        ([key, value]) => (
                            <div key={key} className="flex">
                                <span className="text-gray-persist w-24">
                                    {key}
                                </span>
                                <span className="text-content bg-background-lighter rounded-sm px-2 py-1 font-bold break-all">
                                    {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
                                </span>
                            </div>
                        ),
                    )}
                </div>
            )}

            {transaction.raw_metadata && showRawData && (
                <div className="bg-background-json mt-4 rounded-xl p-4">
                    {Object.entries(transaction.raw_metadata).map(
                        ([key, value]) => (
                            <div key={key} className="mb-6">
                                <div className="text-light-persist border-background-lighter mb-4 border-b pb-2 text-lg font-bold">
                                    {key}
                                </div>
                                <div className="text-light-persist overflow-hidden rounded-md p-4">
                                    {typeof value === 'object' ? (
                                        <pre className="text-sm whitespace-pre-wrap">
                                            <JsonWrapper data={value} />
                                        </pre>
                                    ) : (
                                        <pre className="text-sm whitespace-pre-wrap">
                                            {'{'}
                                            <div className="pl-4">
                                                <span className="text-json-key">
                                                    "{key}"
                                                </span>
                                                :
                                                {typeof value === 'number' ? (
                                                    <span className="text-primary">
                                                        {' '}
                                                        {value}
                                                    </span>
                                                ) : (
                                                    <span className="text-json-string">
                                                        {' '}
                                                        "{String(value)}"
                                                    </span>
                                                )}
                                            </div>
                                            {'}'}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
