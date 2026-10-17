import React, { useState } from "react";

export const Image = React.forwardRef(
  ({ src, alt = "", className = "", loading = "lazy", onError, onLoad, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const fallbackSrc =
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80";

    return (
      <img
        ref={ref}
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading={loading}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          if (!hasError) {
            setHasError(true);
            onError?.(e);
          }
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-90"
        }`}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export default Image;
