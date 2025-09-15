type ListTypeVoterIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ListTypeVoterIcon({
      className,
      width = 24,
      height = 24,
  }: ListTypeVoterIconProps) {
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
            <path d="M33.9907 28.7031H14.0094V35.9993H33.9907V28.7031Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M35.5399 24.9004H12.454V28.7028H35.5399V24.9004Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M29.9919 20.5732H32.8823L35.546 24.9003H12.454L15.1912 20.5732H18.449" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.4491 22.7402H29.9921" stroke="white" stroke-linejoin="round"/>
            <path d="M19.2635 19.3826L26.8139 12L31.8414 17.1419L26.1465 22.7405H22.5948L19.2635 19.3826Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22.9622 18.6349L24.591 20.2768L27.9223 16.709" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
}
