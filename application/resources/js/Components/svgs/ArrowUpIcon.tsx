type ArrowUpIconProps = {
    className?: string;
    width?: number;
    height?: number;
  };

  export default function ArrowUpIcon({
    className,
    width = 24,
    height = 24,
  }: ArrowUpIconProps) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 8 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M1.08333 5.05367C0.908333 5.05367 0.791667 4.99534 0.675 4.87867C0.441667 4.64534 0.441667 4.29534 0.675 4.062L3.59167 1.14534C3.825 0.912004 4.175 0.912004 4.40833 1.14534L7.325 4.062C7.55833 4.29534 7.55833 4.64534 7.325 4.87867C7.09167 5.112 6.74167 5.112 6.50833 4.87867L4 2.37034L1.49167 4.87867C1.375 4.99534 1.25833 5.05367 1.08333 5.05367Z"
          fill="currentColor"
        />
      </svg>
    );
  }
