import CardanoLogo from "@/assets/images/cardano-ada-logo.png";
import Image from "../Image";

type CardanoProps = {
    className?: string;
};

export default function CardanoIcon({
    className,
}: CardanoProps) {
    return (
        <Image 
            imageUrl={CardanoLogo} 
            alt="Cardano Logo" 
            size='20'
            className={className} 
        />
    );
}
