import { ArrowUpRight } from '@/Components/svgs/ArrowUpRight';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface MintedNftsCardProps {
    image: string;
    name: string;
    description: string;
    preview_link: string;
    fingerprint: string;
}

const MintedNftsCard: React.FC<MintedNftsCardProps> = ({
    image,
    name,
    description,
    fingerprint,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <div className="group relative h-[355px] w-full max-w-[325px] cursor-pointer overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl">
            <img
                src={image}
                alt={name}
                className="h-full w-full object-cover duration-300 group-hover:scale-105"
            />

            <div className="bg-background-darker bg-opacity-10 absolute inset-0 z-10 opacity-10 transition-opacity duration-300 group-hover:opacity-80" />

            <div className="bg-background items-center flex flex-col  gap-2 absolute right-0 bottom-0 left-0 z-20 m-4 translate-y-4 rounded-[20px] p-4 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="text-content truncate text-base font-bold">
                    {name}
                </h3>
                <p className="text-slate mt-1 line-clamp-3 text-sm">
                    {description}
                </p>

                <a
                    href={`https://pool.pm/${fingerprint}`}
                    target="_blank "
                    className="hover:bg-background-tertiary px-3 hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary bg-primary active:text-content-secondary text-content-light relative inline-flex w-auto cursor-pointer items-center justify-center rounded-md p-1 text-sm tracking-widest whitespace-nowrap transition duration-150 ease-in-out focus:ring-0 focus:ring-offset-0 focus:outline-hidden"
                >
                    {t('workflows.completedProjectNfts.viewNft')}
                    <ArrowUpRight />
                </a>
            </div>
        </div>
    );
};

export default MintedNftsCard;
