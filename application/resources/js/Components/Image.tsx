interface ImageProps {
    size?: string; // Made optional since there's a default value
    imageUrl?: string|null; // Made optional to allow conditional rendering
    alt?: string;
  }

  export default function Image({ size = 'size-9', imageUrl }: ImageProps) {
    return imageUrl ? (
      <img
        src={imageUrl}
        alt="avatar"
        className={` ${size}`}
        aria-label="User avatar"
      />
    ) : (
      <div className={`bg-dark/50 ${size} rounded-full h-36 w-36`} />
    );
  }
