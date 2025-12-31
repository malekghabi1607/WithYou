type Props = {
  src: string;
  alt?: string;
  className?: string;
};

export function ImageWithFallback({ src, alt = "", className }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/images/fallback.jpg";
      }}
    />
  );
}