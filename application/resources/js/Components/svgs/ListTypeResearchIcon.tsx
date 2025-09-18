type ListTypeResearchIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ListTypeResearchIconProps({
     className,
     width = 24,
     height = 24,
 }: ListTypeResearchIconProps) {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 48 48"
            stroke="currentColor"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="24" fill="#3FACD1"/>
            <path d="M16.6853 25.4932H9V33.2783H16.6853V25.4932Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M39.3176 25.4932H19.137V33.2783H39.3176V25.4932Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21.6183 27.874H36.5781" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21.6183 30.4092H32.9408" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16.6853 14.7227H9V22.5078H16.6853V14.7227Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11.0155 18.7242L12.2138 19.9381L14.6655 17.2959" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M39.3176 14.7227H19.137V22.5078H39.3176V14.7227Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21.6183 17.1035H36.5781" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21.6183 19.6387H32.9408" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
}
