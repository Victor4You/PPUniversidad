'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  bordered?: boolean;
  fallbackLetter?: string;
}

const Avatar = ({ src, alt, size = 'w-12 h-12' }: AvatarProps) => {
  return (
    <div className={`${size} rounded-full overflow-hidden shrink-0 bg-gray-300 flex items-center justify-center`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        <span className="text-gray-600 text-sm font-semibold">
        {alt && typeof alt === 'string' 
  ? alt.split(' ').map(n => n[0]).join('').toUpperCase() 
  : 'U'}
        </span>
      )}
    </div>
  );
};

export { Avatar };