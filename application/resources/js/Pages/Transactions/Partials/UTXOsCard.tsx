import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import { copyToClipboard } from '@/utils/copyClipboard';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { CopyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import TransactionData = App.DataTransferObjects.TransactionData;

interface UTXOsCardProps {
    transaction: TransactionData;
}

interface CardanoAmount {
    unit: string;
    quantity: string;
}

interface CardanoUTXO {
    address: string;
    amount: CardanoAmount[];
    output_index?: number;
    consumed_by_tx?: string;
}

export default function UTXOsCard({ transaction }: UTXOsCardProps) {
    const { t } = useTranslation();
    const [expandedInputs, setExpandedInputs] = useState(false);
    const [expandedOutputs, setExpandedOutputs] = useState(false);

    const inputs = transaction.inputs || [];
    const outputs = transaction.outputs || [];

    const MAX_VISIBLE_ADDRESSES = 2;

    const extractAmount = (amountArray: any[]) => {
        if (!Array.isArray(amountArray) || amountArray.length === 0) return 0;
        const lovelaceAmount = amountArray.find(item => item.unit === 'lovelace');
        return lovelaceAmount ? parseInt(lovelaceAmount.quantity) : 0;
    };

    const lovelaceToAda = (lovelace: number) => {
        return lovelace / 1000000;
    };

    const totalInputLovelace = inputs.reduce((sum, input) => sum + extractAmount(input.amount || []), 0);
    const totalOutputLovelace = outputs.reduce((sum, output) => sum + extractAmount(output.amount || []), 0);

    const totalInput = lovelaceToAda(totalInputLovelace);
    const totalOutput = lovelaceToAda(totalOutputLovelace);

    const formatAmount = (amount: number, isMobile = false) => {
        if (isNaN(amount) || amount === 0) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: isMobile ? 2 : 6
        }).format(amount);
    };
    const hasMoreInputs = inputs.length > MAX_VISIBLE_ADDRESSES;
    const hasMoreOutputs = outputs.length > MAX_VISIBLE_ADDRESSES;
    const visibleInputs = expandedInputs ? inputs : inputs.slice(0, MAX_VISIBLE_ADDRESSES);
    const visibleOutputs = expandedOutputs ? outputs : outputs.slice(0, MAX_VISIBLE_ADDRESSES);

    const AddressRow = ({ address, amount, onCopy, isMobile = false }: { address: string, amount: number, onCopy: () => void, isMobile?: boolean }) => (
        <div className="flex items-center w-full border-background-lighter border-b pb-2">
            <div className="flex items-center ">
                <span className="text-content text-sm font-mono text-gray-900 mr-2">
                    {truncateMiddle(address, isMobile ? 10 : 16)}
                </span>
                <button
                    onClick={onCopy}
                    className="p-1 rounded hover:bg-gray-100"
                >
                    <CopyIcon className="h-4 w-4 text-gray-400" />
                </button>
            </div>
            <div
                className="flex-grow mx-3"
                style={{
                    borderTop: '1px dashed #9CA3AF',
                    height: '1px'
                }}
            />
            <span className="font-semibold text-content whitespace-nowrap">
                {formatAmount(amount, isMobile)} ₳
            </span>
        </div>
    );

    return (
        <div className="bg-background overflow-hidden shadow-xl rounded-lg p-6">
            <Title level="3"
                className="text-content border-background-lighter border-b pb-6 font-bold"
            >
                {t('transactions.utxos')}
            </Title>
            <div className="block lg:hidden pt-4">
                <div className="space-y-6">
                    <div>
                        <Paragraph className="text-3 text-content text-sm font-bold text-gray-700 mb-6">
                            {t('transactions.fromAddresses')}
                        </Paragraph>
                        <div className="space-y-4">
                            {visibleInputs.map((input, index) => {
                                const inputAmount = lovelaceToAda(extractAmount(input.amount || []));
                                return (
                                    <AddressRow
                                        key={index}
                                        address={input.address }
                                        amount={inputAmount}
                                        onCopy={() => copyToClipboard(input.address)}
                                        isMobile={true}
                                    />
                                );
                            })}
                            {hasMoreInputs && (
                                <Button
                                    onClick={() => setExpandedInputs(!expandedInputs)}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                                >
                                    {expandedInputs ? 'Show Less' : `Show ${inputs.length - MAX_VISIBLE_ADDRESSES} More`}
                                </Button>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3">
                            <span className="text-sm font-normal text-gray-500">
                                {t('transactions.totalInput')}
                            </span>
                            <span className="font-bold text-content whitespace-nowrap">
                                {formatAmount(totalInput, true)} ₳
                            </span>
                        </div>
                    </div>
                    <div>
                        <Paragraph className="text-3 text-content text-sm font-bold text-gray-700 mb-6">
                            {t('transactions.toAddresses')}
                        </Paragraph>
                        <div className="space-y-4">
                            {visibleOutputs.map((output, index) => {
                                const outputAmount = lovelaceToAda(extractAmount(output.amount || []));
                                return (
                                    <AddressRow
                                        key={index}
                                        address={output.address || 'Unknown address'}
                                        amount={outputAmount}
                                        onCopy={() => copyToClipboard(output.address)}
                                        isMobile={true}
                                    />
                                );
                            })}
                            {hasMoreOutputs && (
                                <Button
                                    onClick={() => setExpandedOutputs(!expandedOutputs)}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                                >
                                    {expandedOutputs ? 'Show Less' : `Show ${outputs.length - MAX_VISIBLE_ADDRESSES} More`}
                                </Button>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm font-normal text-gray-500">
                                {t('transactions.totalOutput')}
                            </span>
                            <span className="font-bold text-content whitespace-nowrap">
                                {formatAmount(totalOutput, true)} ₳
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 pt-4">
                <div>
                    <Paragraph className="text-3 text-content text-sm font-bold text-gray-700 mb-6">
                        {t('transactions.fromAddresses')}
                    </Paragraph>
                    <div className="space-y-4">
                        {visibleInputs.map((input, index) => {
                            const inputAmount = lovelaceToAda(extractAmount(input.amount || []));
                            return (
                                <AddressRow
                                    key={index}
                                    address={input.address || 'Unknown address'}
                                    amount={inputAmount}
                                    onCopy={() => copyToClipboard(input.address)}
                                    isMobile={false}
                                />
                            );
                        })}
                        {hasMoreInputs && (
                            <Button
                                onClick={() => setExpandedInputs(!expandedInputs)}
                                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                            >
                                {expandedInputs ? 'Show Less' : `Show ${inputs.length - MAX_VISIBLE_ADDRESSES} More`}
                            </Button>
                        )}
                        {inputs.length === 0 && (
                            <div className="text-gray-500 text-center py-8 text-sm">
                                No input addresses found
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <Paragraph className="text-3 text-content text-sm font-bold text-gray-700 mb-6">
                        {t('transactions.toAddresses')}
                    </Paragraph>
                    <div className="space-y-4">
                        {visibleOutputs.map((output, index) => {
                            const outputAmount = lovelaceToAda(extractAmount(output.amount || []));
                            return (
                                <AddressRow
                                    key={index}
                                    address={output.address || 'Unknown address'}
                                    amount={outputAmount}
                                    onCopy={() => copyToClipboard(output.address)}
                                    isMobile={false}
                                />
                            );
                        })}
                        {hasMoreOutputs && (
                            <Button
                                onClick={() => setExpandedOutputs(!expandedOutputs)}
                                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                            >
                                {expandedOutputs ? 'Show Less' : `Show ${outputs.length - MAX_VISIBLE_ADDRESSES} More`}
                            </Button>
                        )}
                        {outputs.length === 0 && (
                            <div className="text-gray-500 text-center py-8 text-sm">
                                No output addresses found
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-2 gap-8 pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-normal text-gray-500">
                            {t('transactions.totalInput')}
                        </span>
                        <span className="font-bold text-content whitespace-nowrap">
                            {formatAmount(totalInput)} ₳
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-normal text-gray-500">
                            {t('transactions.totalOutput')}
                        </span>
                        <span className="font-bold text-content whitespace-nowrap">
                            {formatAmount(totalOutput)} ₳
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
