import useEscapeKey from '@/Hooks/useEscapeKey';
import { Key, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './atoms/Button';
import TextInput from './atoms/TextInput';
import CloseIcon from './svgs/CloseIcon';
import SearchLensIcon from './svgs/SearchLensIcon';

export default function ModelSearch({
    className,
    placeholder,
    domain,
    metricFields,
    selectedItems,
    handleSelect,
}: {
    className?: string;
    placeholder: string;
    domain: string;
    metricFields?: string[];
    selectedItems?: string[];
    handleSelect: (hash: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEscapeKey(() => handleClear());

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    function handleSearch(term: string): void {
        throw new Error('Function not implemented.');
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setSearchQuery(newValue);
        handleSearch(newValue);
    };

    const handleClear = () => {
        setSearchQuery('');
        handleSearch('');
    };

    return (
        <div>
            <div className={`w-full ${className}`}>
                <label className="relative flex w-full items-center gap-2 pl-0">
                    <div className="absolute left-0 flex h-full w-10 items-center justify-center">
                        <SearchLensIcon width={16} className="text-dark" />
                    </div>

                    <TextInput
                        ref={inputRef}
                        placeholder={placeholder}
                        size={placeholder.length}
                        className={`bg-background text-content focus:border-primary w-full rounded-lg pl-10 shadow-none focus:border-0 ${showRingOnFocus ? 'focus:ring-primary focus:ring-2' : 'focus:ring-0'}`}
                        value={searchQuery ?? ''}
                        onChange={handleChange}
                    />
                    <Button
                        onClick={() => handleClear()}
                        ariaLabel={t('clear')}
                        className="hover:text-primary absolute right-0 flex h-full w-10 cursor-pointer items-center justify-center"
                    >
                        <CloseIcon width={16} />
                    </Button>
                </label>
            </div>
            <div className="space-y-2 p-4 lg:mt-4 lg:space-y-3 lg:p-6">
                {results &&
                    results.map((result, index) => (
                        <div className="w-full" key={index}>
                            <label
                                htmlFor={result.hash as string | undefined}
                                className={`peer-checked:border-primary peer-checked:text-primary peer-checked:border-primary ${proposal.minted_nfts_fingerprint ? 'cursor-not-allowed' : ''} inline-flex w-full items-center justify-between rounded-lg border border-gray-100 text-gray-500 peer-checked:border-2`}
                            ></label>
                        </div>
                    ))}
            </div>
        </div>
    );
}
