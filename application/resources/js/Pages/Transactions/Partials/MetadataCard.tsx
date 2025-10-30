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

    const formatKey = (key: string) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const renderNestedObject = (obj: any, depth = 0) => {
        if (obj === null || obj === undefined) {
            return <span className="text-gray-500">null</span>;
        }

        if (Array.isArray(obj)) {
            return (
                <div className="space-y-2">
                    {obj.map((item, index) => (
                        <div key={index} className="bg-background-lighter rounded-md p-3">
                            {typeof item === 'object' ? (
                                renderNestedObject(item, depth + 1)
                            ) : (
                                <span className="text-content">{String(item)}</span>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof obj === 'object') {
            return (
                <div className={`space-y-3 ${depth > 0 ? 'pl-4 border-l border-gray-200' : ''}`}>
                    {Object.entries(obj).map(([nestedKey, nestedValue]) => (
                        <div key={nestedKey} className="flex flex-col">
                            <span className="text-gray-persist font-medium mb-1">
                                {formatKey(nestedKey)}
                            </span>
                            {typeof nestedValue === 'object' ? (
                                renderNestedObject(nestedValue, depth + 1)
                            ) : (
                                <span className="text-content bg-background-lighter rounded-sm px-2 py-1 break-all">
                                    {String(nestedValue)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <span className="text-content bg-background-lighter rounded-sm px-2 py-1 break-all">
                {String(obj)}
            </span>
        );
    };

    const isProposalPayout = transaction.json_metadata?.purpose_info?.is_catalyst === true;

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

            {transaction.json_metadata && !showRawData && (
                <div className="space-y-4 pt-4">
                    {isProposalPayout ? (
                        <>
                            {transaction.json_metadata.purpose_info && (
                                <div className="flex">
                                    <span className="text-gray-persist w-40 shrink-0 mb-2">
                                        Purpose Info
                                    </span>
                                    <div className="bg-background-lighter rounded-md p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="font-medium text-gray-persist">{t("description")}: </span>
                                                <span className="text-content">{transaction.json_metadata.purpose_info.description}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-persist">Is Catalyst: </span>
                                                <span className="text-content">{String(transaction.json_metadata.purpose_info.is_catalyst)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-persist">Is Known: </span>
                                                <span className="text-content">{String(transaction.json_metadata.purpose_info.is_known)}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-persist">UUID: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.purpose_info.uuid}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {transaction.json_metadata.x509_data && (
                                <div className="flex">
                                    <span className="text-gray-persist w-40 shrink-0 mb-2">
                                        X509 Data
                                    </span>
                                    <div className="bg-background-lighter rounded-md p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="font-medium text-gray-persist">{t('data')}: </span>
                                                <span className="text-content break-all text-sm">
                                                    {transaction.json_metadata.x509_data.data?.substring(0, 100)}...
                                                </span>
                                            </div>
                                            {transaction.json_metadata.x509_data.parsed_rbac && (
                                                <div className="mt-3">
                                                    <h5 className="font-medium text-gray-persist mb-2">Parsed RBAC</h5>
                                                    <div className="space-y-2 pl-4 border-l border-gray-200">
                                                        <div>
                                                            <span className="font-medium text-gray-persist">Stake Address: </span>
                                                            <span className="text-content break-all">{transaction.json_metadata.x509_data.parsed_rbac.stake_address}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-persist">Cardano URI Found: </span>
                                                            <span className="text-content">{String(transaction.json_metadata.x509_data.parsed_rbac.cardano_uri_found)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-persist">Structure Type: </span>
                                                            <span className="text-content">{transaction.json_metadata.x509_data.parsed_rbac.structure_type}</span>
                                                        </div>
                                                        {transaction.json_metadata.x509_data.parsed_rbac.extracted_data && (
                                                            <div>
                                                                <span className="font-medium text-gray-persist">Stake Key: </span>
                                                                <span className="text-content break-all">{transaction.json_metadata.x509_data.parsed_rbac.extracted_data.stake_key}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {transaction.json_metadata.x509_envelope && (
                                <div className="flex">
                                    <span className="text-gray-persist w-40 shrink-0 mb-2">
                                        X509 Envelope
                                    </span>
                                    <div className="bg-background-lighter rounded-md p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="font-medium text-gray-persist">Compression Type: </span>
                                                <span className="text-content">{transaction.json_metadata.x509_envelope.compression_type}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-persist">Purpose UUID: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.x509_envelope.purpose_uuid}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-persist">Transaction Inputs Hash: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.x509_envelope.txn_inputs_hash}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-persist">Validation Signature: </span>
                                                <span className="text-content break-all text-sm">
                                                    {transaction.json_metadata.x509_envelope.validation_signature?.substring(0, 80)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex">
                                <span className="text-gray-persist w-40 shrink-0 mb-2">
                                    Transaction Details
                                </span>
                                <div className="bg-background-lighter rounded-md p-4">
                                    <div className="space-y-2">
                                        {transaction.json_metadata.purpose_uuid && (
                                            <div>
                                                <span className="font-medium text-gray-persist">Purpose UUID: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.purpose_uuid}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.txType && (
                                            <div>
                                                <span className="font-medium text-gray-persist">{t('transactions.type')}: </span>
                                                <span className="text-content">{transaction.json_metadata.txType}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.txn_inputs_hash && (
                                            <div>
                                                <span className="font-medium text-gray-persist">Transaction Inputs Hash: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.txn_inputs_hash}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.compression_type && (
                                            <div>
                                                <span className="font-medium text-gray-persist">Compression Type: </span>
                                                <span className="text-content">{transaction.json_metadata.compression_type}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.stake_key && (
                                            <div>
                                                <span className="font-medium text-gray-persist">{t('transactions.wallet.stakeKey')}: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.stake_key}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.stake_hex && (
                                            <div>
                                                <span className="font-medium text-gray-persist">Stake Hex: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.stake_hex}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.stake_pub && (
                                            <div>
                                                <span className="font-medium text-gray-persist">Stake Public Key: </span>
                                                <span className="text-content break-all">{transaction.json_metadata.stake_pub}</span>
                                            </div>
                                        )}
                                        {transaction.json_metadata.validation_signature && (
                                            <div>
                                                <span className="font-medium text-gray-persist">Validation Signature: </span>
                                                <span className="text-content break-all text-sm">
                                                    {transaction.json_metadata.validation_signature?.substring(0, 80)}...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {transaction.json_metadata.voter_delegations && (
                                <div className="flex">
                                    <span className="text-gray-persist w-40 shrink-0 mb-2">
                                        Voter Delegations
                                    </span>
                                    {Array.isArray(transaction.json_metadata.voter_delegations) && transaction.json_metadata.voter_delegations.length > 0 ? (
                                        <div className="space-y-3">
                                            {transaction.json_metadata.voter_delegations.map((delegation: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="bg-background-lighter rounded-md p-3 text-sm text-content"
                                                >
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('voter.voterKey')}: </span>{' '}
                                                        <span className="break-all">{delegation.voting_key}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('vote.votePublicKey')}: </span>{' '}
                                                        <span className="break-all">{delegation.votePublicKey}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('transactions.delegationsWeight')}: </span>{' '}
                                                        {delegation.weight}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('voter.voterCatalysId')}: </span>{' '}
                                                        <span className="break-all">{delegation.catId}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-content bg-background-lighter rounded-sm px-2 py-1">[ ]</span>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        Object.entries(transaction.json_metadata).map(([key, value]) => {
                            if (key === 'voter_delegations' && Array.isArray(value)) {
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-gray-persist w-40 shrink-0 mb-2">
                                            {formatKey(key)}
                                        </span>
                                        <div className="space-y-3">
                                            {value.map((delegation, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-background-lighter rounded-md p-3 text-sm text-content"
                                                >
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('voter.voterKey')}: </span>{' '}
                                                        <span className="break-all">{delegation.voting_key}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('vote.votePublicKey')}: </span>{' '}
                                                        <span className="break-all">{delegation.votePublicKey}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('transactions.delegationsWeight')}: </span>{' '}
                                                        {delegation.weight}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-persist">{t('voter.voterCatalysId')}: </span>{' '}
                                                        <span className="break-all">{delegation.catId}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={key} className="flex">
                                    <span className="text-gray-persist w-40 shrink-0">
                                        {formatKey(key)}
                                    </span>
                                    {typeof value === 'object' ? (
                                        <span className="text-content bg-background-lighter rounded-sm px-2 py-1 font-bold break-all">
                                            {JSON.stringify(value, null, 2)}
                                        </span>
                                    ) : (
                                        <span className="text-content bg-background-lighter rounded-sm px-2 py-1 font-bold break-all">
                                            {String(value)}
                                        </span>
                                    )}
                                </div>
                            );
                        })
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
                        ))}
                </div>
            )}
        </div>
    );
}
