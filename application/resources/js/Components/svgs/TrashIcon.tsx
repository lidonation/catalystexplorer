import { cn } from '@/lib/utils';

type TrashIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function TrashIcon({
    className,
    width = 24,
    height = 24,
}: TrashIconProps) {
    return (
        <svg 
            width={width} 
            height={height} 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={cn(className)}
        >
<path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="#FC2D31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.0835 4.14175L7.26683 3.05008C7.40016 2.25841 7.50016 1.66675 8.9085 1.66675H11.0918C12.5002 1.66675 12.6085 2.29175 12.7335 3.05841L12.9168 4.14175" stroke="#FC2D31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.7082 7.6167L15.1665 16.0084C15.0748 17.3167 14.9998 18.3334 12.6748 18.3334H7.32484C4.99984 18.3334 4.92484 17.3167 4.83317 16.0084L4.2915 7.6167" stroke="#FC2D31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.6084 13.75H11.3834" stroke="#FC2D31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.9165 10.4167H12.0832" stroke="#FC2D31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    );
}
