import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
  A11y,
  Keyboard,
  Mousewheel,
} from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

interface Product {
  id: string;
  image: string;
  name: string;
  code: string;
}

interface ProductCarouselProps {
  title: string;
  subtitle: string;
  products: Product[];
  sectionId: string;
}

export const ProductCarousel = ({
  title,
  subtitle,
  products,
  sectionId,
}: ProductCarouselProps) => {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Refs для стабильности
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isIOSRef = useRef<boolean>(false);

  const handleImageLoad = useCallback((productId: string) => {
    setLoadedImages((prev) => new Set(prev).add(productId));
  }, []);

  const handleImageError = useCallback((productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  }, []);

  // Определяем iOS более надежно
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    isIOSRef.current = isIOS;

    // Фиксим iOS viewport
    if (isIOS) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    const debouncedResize = debounce(checkMobile, 100);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  // Исправленный Intersection Observer для iOS
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      // Более консервативные настройки для iOS
      threshold: isIOSRef.current ? [0.1, 0.5] : [0, 0.15, 0.3],
      // Убираем rootMargin для iOS чтобы избежать скачков
      rootMargin: isIOSRef.current ? "0px" : "-40px 0px -40px 0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.target.id === sectionId) {
          const nowInView = entry.isIntersecting && entry.intersectionRatio > 0.1;

          // Для iOS используем requestAnimationFrame для плавности
          if (isIOSRef.current) {
            requestAnimationFrame(() => {
              setIsInView(nowInView);
            });
          } else {
            // Для других устройств небольшая задержка
            setTimeout(() => {
              setIsInView(nowInView);
            }, 50);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

    const element = sectionRef.current;
    if (element) {
      observerRef.current.observe(element);
    }

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [sectionId]);

  // Дебаунс функция
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={`
        py-12 md:py-20 px-3 md:px-4 relative overflow-hidden
        ${isIOSRef.current ? 'ios-section' : ''}
      `}
      style={{
        // Фиксим высоту для iOS
        minHeight: isIOSRef.current ? '100vh' : 'auto',
      }}
    >
      {/* Стили для iOS */}
      <style jsx>{`
        .ios-section {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }
        
        .ios-swiper {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        .ios-slide {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: auto;
        }
        
        .ios-slide:hover {
          will-change: transform;
        }
        
        @media (max-width: 768px) {
          .ios-section {
            min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
          }
        }
      `}</style>

      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 md:w-32 h-20 md:h-32 bg-royal rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-24 md:w-40 h-24 md:h-40 bg-catalog-hover rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block relative">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-royal mb-4 royal tracking-wider uppercase relative z-10">
              {title}
            </h2>
            <div className="absolute inset-0 bg-gradient-to-r from-royal/10 via-catalog-hover/20 to-royal/10 blur-xl -z-10 transform scale-110"></div>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl text-royal-light font-medium mt-4 md:mt-6">
            {subtitle}
          </p>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-royal via-catalog-hover to-royal mx-auto mt-6 md:mt-8 rounded-full"></div>
        </div>

        {/* Main Carousel */}
        <div className="relative">
          {isInView && (
            <Swiper
              modules={[
                Navigation,
                Pagination,
                Autoplay,
                EffectCoverflow,
                A11y,
                Keyboard,
                Mousewheel,
              ]}
              spaceBetween={isMobile ? 20 : 30}
              slidesPerView={1}
              centeredSlides={true}

              // Исправленные touch настройки для iOS
              touchRatio={isIOSRef.current ? 0.8 : 1}
              touchAngle={45}
              grabCursor={!isIOSRef.current}
              resistance={true}
              resistanceRatio={isIOSRef.current ? 0.5 : 0.85}
              threshold={isIOSRef.current ? 5 : 10}
              longSwipes={true}
              longSwipesRatio={0.3}
              longSwipesMs={isIOSRef.current ? 200 : 300}
              followFinger={true}
              allowTouchMove={true}
              touchMoveStopPropagation={isIOSRef.current ? true : false}
              simulateTouch={true}
              touchStartPreventDefault={isIOSRef.current ? true : false}
              touchStartForcePreventDefault={isIOSRef.current ? true : false}
              touchReleaseOnEdges={true}

              // Автоплей с учетом iOS
              autoplay={isIOSRef.current ? false : {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: true,
                reverseDirection: false,
                stopOnLastSlide: false,
              }}

              watchSlidesProgress={true}
              watchOverflow={true}
              preventInteractionOnTransition={isIOSRef.current ? true : false}
              observer={true}
              observeParents={true}
              observeSlideChildren={true}
              updateOnWindowResize={true}
              resizeObserver={true}

              // Эффекты
              effect={isMobile ? "slide" : "coverflow"}
              coverflowEffect={{
                rotate: isIOSRef.current ? 10 : 15,
                stretch: 0,
                depth: isIOSRef.current ? 100 : 200,
                modifier: isIOSRef.current ? 0.8 : 1,
                slideShadows: !isIOSRef.current,
              }}

              navigation={{
                prevEl: `.${sectionId}-prev`,
                nextEl: `.${sectionId}-next`,
              }}
              pagination={{
                el: `.${sectionId}-pagination`,
                clickable: true,
                dynamicBullets: true,
              }}

              breakpoints={{
                480: {
                  slidesPerView: 1.1,
                  spaceBetween: 15,
                },
                640: {
                  slidesPerView: 1.3,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 25,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1280: {
                  slidesPerView: 3.5,
                  spaceBetween: 35,
                },
              }}

              className={`
                !pb-8 md:!pb-10 
                ${isIOSRef.current ? 'ios-swiper' : ''}
              `}

              a11y={{
                enabled: true,
                prevSlideMessage: "Previous slide",
                nextSlideMessage: "Next slide",
                firstSlideMessage: "This is the first slide",
                lastSlideMessage: "This is the last slide",
                paginationBulletMessage: "Go to slide {{index}}",
                slideLabelMessage: "{{index}} / {{slidesLength}}",
                containerMessage: null,
                containerRoleDescriptionMessage: null,
                itemRoleDescriptionMessage: null,
                slideRole: "group",
                id: null,
              }}

              keyboard={{
                enabled: !isIOSRef.current,
                onlyInViewport: true,
                pageUpDown: true,
              }}

              mousewheel={false}
            >
              {products.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div
                    className={`
                      group cursor-pointer h-full select-none
                      ${isIOSRef.current ? 'ios-slide' : ''}
                    `}
                    onClick={(e) => {
                      if (isIOSRef.current) {
                        e.preventDefault();
                        const idx = products.findIndex(p => p.id === product.id);
                        setLightboxIndex(idx);
                      }
                    }}
                  >
                    <div className={`
                      relative overflow-hidden rounded-2xl md:rounded-3xl 
                      bg-white/90 backdrop-blur-sm border border-catalog-border/30 
                      shadow-catalog hover:shadow-catalog-hover 
                      transition-all duration-500 h-full
                      ${isIOSRef.current ?
                        'transform-gpu' :
                        'transform hover:-translate-y-2 md:hover:-translate-y-4 hover:scale-105 will-change-transform'
                      }
                    `}>
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`
                            w-full h-full object-cover transition-all duration-500 opacity-0
                            ${isIOSRef.current ? 'transform-gpu' : 'group-hover:scale-110 will-change-transform'}
                          `}
                          loading="lazy"
                          decoding="async"
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = "1";
                            handleImageLoad(product.id);
                            const skeleton = e.currentTarget.parentElement?.querySelector(".animate-pulse");
                            if (skeleton) {
                              skeleton.remove();
                            }
                          }}
                          onError={(e) => {
                            e.currentTarget.style.opacity = "0.5";
                            e.currentTarget.style.filter = "grayscale(1)";
                            handleImageError(product.id);
                            const skeleton = e.currentTarget.parentElement?.querySelector(".animate-pulse");
                            if (skeleton) {
                              skeleton.remove();
                            }
                          }}
                        />

                        {/* Loading skeleton */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>

                        {/* Gradient overlay */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                          ${isIOSRef.current ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-500'}
                        `}></div>

                        {/* Zoom icon */}
                        <div className={`
                          absolute top-4 right-4 w-8 md:w-10 h-8 md:h-10 
                          bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center
                          ${isIOSRef.current ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30'}
                        `}>
                          <svg
                            className="w-4 md:w-5 h-4 md:h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>

                        {/* Mobile tap indicator */}
                        {isMobile && (
                          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                            {isIOSRef.current ? 'Tap to view' : 'Tap to view'}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 md:p-6 bg-gradient-to-t from-white via-white/95 to-white/90">
                        <h3 className={`
                          font-bold text-royal text-lg md:text-xl mb-2 
                          ${isIOSRef.current ? '' : 'group-hover:text-royal-light transition-colors duration-300'}
                        `}>
                          {product.name}
                        </h3>
                        <p className="text-royal-dark text-sm md:text-base font-medium bg-catalog-bg/50 px-3 py-1 rounded-full inline-block">
                          {product.code}
                        </p>
                      </div>

                      {/* Shine effect - отключаем для iOS */}
                      {!isIOSRef.current && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Custom Navigation - Hidden on mobile for cleaner look */}
          <div className="hidden md:flex justify-center items-center space-x-4 mt-3">
            <button
              className={`${sectionId}-prev group w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-royal border border-catalog-border hover:border-royal rounded-full flex items-center justify-center shadow-lg hover:shadow-catalog-hover transition-all duration-200 ${isIOSRef.current ? '' : 'hover:scale-105 will-change-transform'}`}
            >
              <svg
                className="w-6 h-6 text-royal group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className={`${sectionId}-pagination flex space-x-2`}></div>

            <button
              className={`${sectionId}-next group w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-royal border border-catalog-border hover:border-royal rounded-full flex items-center justify-center shadow-lg hover:shadow-catalog-hover transition-all duration-200 ${isIOSRef.current ? '' : 'hover:scale-105 will-change-transform'}`}
            >
              <svg
                className="w-6 h-6 text-royal group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Mobile-only pagination */}
          <div className="md:hidden flex justify-center mt-3">
            <div className={`${sectionId}-pagination flex space-x-2`}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Lightbox Modal */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={products.map((p) => ({
          src: p.image,
          alt: p.name,
          preload: false,
        }))}
        plugins={[Zoom]}
        animation={{ fade: 300 }}
        controller={{
          closeOnBackdropClick: true,
          closeOnEsc: true,
          closeOnPullDown: true,
        }}
        zoom={{ maxZoomPixelRatio: 5, scrollToZoom: true }}
        carousel={{
          finite: false,
          preload: 2,
        }}
      />
    </section>
  );
};