import { useState, useEffect } from "react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 bg-white/90 backdrop-blur-md hover:bg-royal border-2 border-royal/20 hover:border-royal rounded-full flex items-center justify-center shadow-lg hover:shadow-catalog-hover transition-all duration-300 hover:scale-110 group touch-manipulation"
      aria-label="Scroll to top"
    >
      {/* Progress circle */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-royal transition-all duration-300"
          style={{
            strokeDasharray: `${2 * Math.PI * 20}`,
            strokeDashoffset: `${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`,
          }}
        />
      </svg>

      {/* Arrow icon */}
      <svg
        className="w-5 h-5 md:w-6 md:h-6 text-royal group-hover:text-white transition-colors duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};
