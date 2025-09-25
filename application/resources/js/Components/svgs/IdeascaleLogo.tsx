type IdeascaleIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function IdeascaleLogo({
    className,
    width = 24,
    height = 24,
}: IdeascaleIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <rect
                width="17"
                height="17"
                transform="matrix(-1 0 0 1 17 0)"
                fill="url(#pattern0_19509_14033)"
            />
            <defs>
                <pattern
                    id="pattern0_19509_14033"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                >
                    <use
                        xlinkHref="#image0_19509_14033"
                        transform="scale(0.0125)"
                    />
                </pattern>
                <image
                    id="image0_19509_14033"
                    width="80"
                    height="80"
                    preserveAspectRatio="none"
                    xlinkHref="data:image/png;base64,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"
                />
            </defs>
        </svg>
    );
}
