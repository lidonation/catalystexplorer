import React from 'react';
import {useTranslation} from 'react-i18next';

interface MintedNftsCardProps {
  image: string;
  name: string;
  description: string;
  preview_link: string;
  onView: () => void;
}

const MintedNftsCard: React.FC<MintedNftsCardProps> = ({
  image,
  name,
  description,
  onView,
}) => {

  const {t} = useTranslation();

  return (
    <div className="relative w-full max-w-[325px] h-[355px] rounded-xl overflow-hidden shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl">
      <img
        src={image} 
        alt={name}
        className="w-full h-full object-cover duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-background-darker bg-opacity-10 opacity-10 group-hover:opacity-80 transition-opacity duration-300 z-10" />

      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-[20px] p-4 m-4 shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
        <h3 className="text-base font-bold text-content truncate">{name}</h3>
        <p className="text-sm text-slate mt-1 line-clamp-3">{description}</p>

        <button
           onClick={onView}
          className="mt-4 w-full bg-primary text-content-light font-medium py-2 px-4 rounded hover:bg-primary/90 transition-all"
        >
          {t('viewNFT')}
        </button>
      </div>
    </div>
  );
};

export default MintedNftsCard;
