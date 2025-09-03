import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { copyToClipboard } from '@/utils/copyClipboard';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CopyIcon } from 'lucide-react';
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
    const { t } = useLaravelReactI18n();
    const [expandedInputs, setExpandedInputs] = useState(false);
    const [expandedOutputs, setExpandedOutputs] = useState(false);

    const inputs = transaction.inputs || [];
    const outputs = transaction.outputs || [];

    const MAX_VISIBLE_ADDRESSES = 2;

    const extractAmount = (amountArray: any[]) => {
        if (!Array.isArray(amountArray) || amountArray.length === 0) return 0;
        const lovelaceAmount = amountArray.find(
            (item) => item.unit === 'lovelace',
        );
        return lovelaceAmount ? parseInt(lovelaceAmount.quantity) : 0;
    };

    const lovelaceToAda = (lovelace: number) => {
        return lovelace / 1000000;
    };

    const totalInputLovelace = inputs.reduce(
        (sum, input) => sum + extractAmount(input.amount || []),
        0,
    );
    const totalOutputLovelace = outputs.reduce(
        (sum, output) => sum + extractAmount(output.amount || []),
        0,
    );

    const totalInput = lovelaceToAda(totalInputLovelace);
    const totalOutput = lovelaceToAda(totalOutputLovelace);

    const formatAmount = (amount: number, isMobile = false) => {
        if (isNaN(amount) || amount === 0) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: isMobile ? 2 : 6,
        }).format(amount);
    };
    const hasMoreInputs = inputs.length > MAX_VISIBLE_ADDRESSES;
    const hasMoreOutputs = outputs.length > MAX_VISIBLE_ADDRESSES;
    const visibleInputs = expandedInputs
        ? inputs
        : inputs.slice(0, MAX_VISIBLE_ADDRESSES);
    const visibleOutputs = expandedOutputs
        ? outputs
        : outputs.slice(0, MAX_VISIBLE_ADDRESSES);

    const AddressRow = ({
        address,
        amount,
        onCopy,
        isMobile = false,
    }: {
        address: string;
        amount: number;
        onCopy: () => void;
        isMobile?: boolean;
    }) => (
        <div className="border-background-lighter flex w-full items-center border-b pb-2">
            <div className="flex items-center">
                <span className="text-content mr-2 font-mono text-sm text-gray-900">
                    {truncateMiddle(address, isMobile ? 10 : 16)}
                </span>
                <button
                    onClick={onCopy}
                    className="rounded p-1 hover:bg-gray-100"
                >
                    <CopyIcon className="h-4 w-4 text-gray-400" />
                </button>
            </div>
            <div
                className="mx-3 flex-grow"
                style={{
                    borderTop: '1px dashed #9CA3AF',
                    height: '1px',
                }}
            />
            <span className="text-content font-semibold whitespace-nowrap">
                {formatAmount(amount, isMobile)} ₳
            </span>
        </div>
    );

    return (
        <div className="bg-background overflow-hidden rounded-lg p-6 shadow-xl">
            <Title
                level="3"
                className="text-content border-background-lighter border-b pb-6 font-bold"
            >
                {t('transactions.utxos')}
            </Title>
            <div className="block pt-4 lg:hidden">
                <div className="space-y-6">
                    <div>
                        <Paragraph className="text-3 text-content mb-6 text-sm font-bold text-gray-700">
                            {t('transactions.fromAddresses')}
                        </Paragraph>
                        <div className="space-y-4">
                            {visibleInputs.map((input, index) => {
                                const inputAmount = lovelaceToAda(
                                    extractAmount(input.amount || []),
                                );
                                return (
                                    <AddressRow
                                        key={index}
                                        address={input.address}
                                        amount={inputAmount}
                                        onCopy={() =>
                                            copyToClipboard(input.address)
                                        }
                                        isMobile={true}
                                    />
                                );
                            })}
                            {hasMoreInputs && (
                                <Button
                                    onClick={() =>
                                        setExpandedInputs(!expandedInputs)
                                    }
                                    className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                                >
                                    {expandedInputs
                                        ? 'Show Less'
                                        : `Show ${inputs.length - MAX_VISIBLE_ADDRESSES} More`}
                                </Button>
                            )}
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-3">
                            <span className="text-sm font-normal text-gray-500">
                                {t('transactions.totalInput')}
                            </span>
                            <span className="text-content font-bold whitespace-nowrap">
                                {formatAmount(totalInput, true)} ₳
                            </span>
                        </div>
                    </div>
                    <div>
                        <Paragraph className="text-3 text-content mb-6 text-sm font-bold text-gray-700">
                            {t('transactions.toAddresses')}
                        </Paragraph>
                        <div className="space-y-4">
                            {visibleOutputs.map((output, index) => {
                                const outputAmount = lovelaceToAda(
                                    extractAmount(output.amount || []),
                                );
                                return (
                                    <AddressRow
                                        key={index}
                                        address={
                                            output.address || 'Unknown address'
                                        }
                                        amount={outputAmount}
                                        onCopy={() =>
                                            copyToClipboard(output.address)
                                        }
                                        isMobile={true}
                                    />
                                );
                            })}
                            {hasMoreOutputs && (
                                <Button
                                    onClick={() =>
                                        setExpandedOutputs(!expandedOutputs)
                                    }
                                    className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                                >
                                    {expandedOutputs
                                        ? 'Show Less'
                                        : `Show ${outputs.length - MAX_VISIBLE_ADDRESSES} More`}
                                </Button>
                            )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-normal text-gray-500">
                                {t('transactions.totalOutput')}
                            </span>
                            <span className="text-content font-bold whitespace-nowrap">
                                {formatAmount(totalOutput, true)} ₳
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden gap-8 pt-4 lg:grid lg:grid-cols-2">
                <div>
                    <Paragraph className="text-3 text-content mb-6 text-sm font-bold text-gray-700">
                        {t('transactions.fromAddresses')}
                    </Paragraph>
                    <div className="space-y-4">
                        {visibleInputs.map((input, index) => {
                            const inputAmount = lovelaceToAda(
                                extractAmount(input.amount || []),
                            );
                            return (
                                <AddressRow
                                    key={index}
                                    address={input.address || 'Unknown address'}
                                    amount={inputAmount}
                                    onCopy={() =>
                                        copyToClipboard(input.address)
                                    }
                                    isMobile={false}
                                />
                            );
                        })}
                        {hasMoreInputs && (
                            <Button
                                onClick={() =>
                                    setExpandedInputs(!expandedInputs)
                                }
                                className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                            >
                                {expandedInputs
                                    ? 'Show Less'
                                    : `Show ${inputs.length - MAX_VISIBLE_ADDRESSES} More`}
                            </Button>
                        )}
                        {inputs.length === 0 && (
                            <div className="py-8 text-center text-sm text-gray-500">
                                No input addresses found
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <Paragraph className="text-3 text-content mb-6 text-sm font-bold text-gray-700">
                        {t('transactions.toAddresses')}
                    </Paragraph>
                    <div className="space-y-4">
                        {visibleOutputs.map((output, index) => {
                            const outputAmount = lovelaceToAda(
                                extractAmount(output.amount || []),
                            );
                            return (
                                <AddressRow
                                    key={index}
                                    address={
                                        output.address || 'Unknown address'
                                    }
                                    amount={outputAmount}
                                    onCopy={() =>
                                        copyToClipboard(output.address)
                                    }
                                    isMobile={false}
                                />
                            );
                        })}
                        {hasMoreOutputs && (
                            <Button
                                onClick={() =>
                                    setExpandedOutputs(!expandedOutputs)
                                }
                                className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                            >
                                {expandedOutputs
                                    ? 'Show Less'
                                    : `Show ${outputs.length - MAX_VISIBLE_ADDRESSES} More`}
                            </Button>
                        )}
                        {outputs.length === 0 && (
                            <div className="py-8 text-center text-sm text-gray-500">
                                No output addresses found
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-normal text-gray-500">
                            {t('transactions.totalInput')}
                        </span>
                        <span className="text-content font-bold whitespace-nowrap">
                            {formatAmount(totalInput)} ₳
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-normal text-gray-500">
                            {t('transactions.totalOutput')}
                        </span>
                        <span className="text-content font-bold whitespace-nowrap">
                            {formatAmount(totalOutput)} ₳
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
