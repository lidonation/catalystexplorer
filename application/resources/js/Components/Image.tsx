import { ImgHTMLAttributes } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: string;
  imageUrl?: string | null;
}

export default function Image({ 
  size = 'size-9', 
  imageUrl, 
  alt = 'avatar', 
  className = '', 
  ...props 
}: ImageProps) {
  return imageUrl ? (
    <img
      src={imageUrl}
      alt={alt}
      className={`${size} ${className}`}
      aria-label="User avatar"
      {...props}
    />
  ) : (
    <div className={`bg-content-highlight-intro ${size} rounded-full ${className}`} />
  );
}
