// src/components/ui/Carousel/Carousel.types.ts
export interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

export interface CarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}