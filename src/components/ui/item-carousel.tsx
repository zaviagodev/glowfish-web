import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useConfig } from "@/hooks/useConfig";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

interface ItemCarouselProps {
  image: string | undefined;
  images: ProductImage[];
  name?: string;
}

const ItemCarousel = ({ images, image, name }: ItemCarouselProps) => {
  const { config } = useConfig();
  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [thumbnailApi, setThumbnailApi] = useState<any>(null);
  const [modalApi, setModalApi] = useState<any>(null);

  // Sync thumbnail carousel
  useEffect(() => {
    if (thumbnailApi) {
      thumbnailApi.on("select", () => {
        const index = thumbnailApi.selectedScrollSnap();
        setCurrentSlide(index);
      });
    }
  }, [thumbnailApi]);

  // Sync modal carousel
  useEffect(() => {
    if (modalApi) {
      modalApi.on("select", () => {
        const index = modalApi.selectedScrollSnap();
        setCurrentSlide(index);
      });
    }
  }, [modalApi]);

  // Sync both carousels when current slide changes
  useEffect(() => {
    if (thumbnailApi) {
      thumbnailApi.scrollTo(currentSlide);
    }
    if (modalApi) {
      modalApi.scrollTo(currentSlide);
    }
  }, [currentSlide, thumbnailApi, modalApi]);

  // When opening modal, ensure it shows the same slide as thumbnail
  useEffect(() => {
    if (openImageModal && modalApi) {
      modalApi.scrollTo(currentSlide);
    }
  }, [openImageModal, modalApi, currentSlide]);

  return (
    <div
      className={cn(
        openImageModal
          ? "fixed inset-0 z-[999] bg-background flex flex-col justify-center items-center w-full max-width-mobile h-full"
          : ""
      )}
    >
      {openImageModal && (
        <>
          <div
            className="absolute right-5 top-5 h-10 w-10 bg-black/20 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setOpenImageModal(false)}
          >
            <X className="h-6 w-6" />
          </div>
          {Array.isArray(images) && images.length > 0 ? (
            <div className="w-full h-full flex items-center justify-center p-4 max-width-mobile">
              <Carousel className="w-full" setApi={setModalApi}>
                <CarouselContent>
                  {images.map((img: ProductImage) => (
                    <CarouselItem key={img.id}>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={img.url}
                          alt={img.alt || name}
                          className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200 cursor-pointer",
                          index === currentSlide
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/75"
                        )}
                      />
                    ))}
                  </div>
                )}
              </Carousel>
            </div>
          ) : image ? (
            <div className="w-full h-full flex items-center justify-center p-4 max-width-mobile">
              <img
                src={image}
                alt={name}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 max-width-mobile">
              {config?.storeLogo ? (
                <img src={config.storeLogo} alt="Store Logo" className="w-20 h-20 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-lg" />
              )}
            </div>
          )}
        </>
      )}

      {/* Thumbnail view (when modal is closed) */}
      {!openImageModal && (
        <>
          {Array.isArray(images) && images.length > 0 ? (
            <div className="w-full aspect-square overflow-hidden">
              <Carousel className="w-full" setApi={setThumbnailApi}>
                <CarouselContent>
                  {images.map((img: ProductImage) => (
                    <CarouselItem
                      key={img.id}
                      onClick={() => setOpenImageModal(true)}
                    >
                      <div className="relative w-full aspect-square">
                        <img
                          src={img.url}
                          alt={img.alt || name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200 cursor-pointer",
                          index === currentSlide
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/75"
                        )}
                      />
                    ))}
                  </div>
                )}
              </Carousel>
            </div>
          ) : image ? (
            <div className="w-full aspect-square overflow-hidden">
              <Carousel>
                <CarouselContent>
                  <CarouselItem onClick={() => setOpenImageModal(true)}>
                    <div className="relative w-full aspect-square">
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full aspect-square overflow-hidden bg-black">
              {config?.storeLogo ? (
                <img src={config.storeLogo} alt="Store Logo" className="w-20 h-20 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-lg" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ItemCarousel;
