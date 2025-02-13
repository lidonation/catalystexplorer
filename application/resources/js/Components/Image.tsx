interface ImageProps {
    size?: string; // Made optional since there's a default value
    imageUrl?: string; // Made optional to allow conditional rendering
  }
  
  export default function Image({ size = 'size-9', imageUrl }: ImageProps) {
    return imageUrl ? (
      <img
        src={imageUrl}
        alt="avatar"
        className={`rounded-full ${size}`}
        aria-label="User avatar"
      />
    ) : (
      <div className={`bg-dark ${size} rounded-full h-36 w-36`} />
    );
  }
