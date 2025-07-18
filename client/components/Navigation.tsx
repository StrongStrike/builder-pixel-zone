import { useState, useEffect, useCallback } from "react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const categories = [
  { id: "9", label: "9sm 3D", section: "section-9" },
  { id: "12", label: "12sm 3D", section: "section-12" },
  { id: "x12", label: "x12sm 3D", section: "section-x12" },
  { id: "16", label: "16sm 3D", section: "section-16" },
  { id: "18", label: "18sm 3D", section: "section-18" },
  { id: "20", label: "20sm 3D", section: "section-20" },
  { id: "25", label: "25sm DekorPlast", section: "section-25" },
  { id: "40", label: "40sm DekorPlast", section: "section-40" },
  { id: "60", label: "60sm DekorPlast", section: "section-60" },
];

// Хук для отслеживания скролла с улучшенной поддержкой iOS
const useScrollSpy = (onSectionChange: (section: string) => void) => {
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = useCallback(() => {
    if (isScrolling) return; // Предотвращаем конфликт с программным скроллом

    const scrollPosition = window.scrollY + window.innerHeight / 2;
    let currentSection = "hero";

    // Проверяем hero секцию
    const heroElement = document.getElementById("hero");
    if (heroElement) {
      const heroRect = heroElement.getBoundingClientRect();
      const heroTop = heroRect.top + window.scrollY;
      const heroBottom = heroTop + heroRect.height;

      if (scrollPosition >= heroTop && scrollPosition < heroBottom) {
        currentSection = "hero";
      }
    }

    // Проверяем остальные секции
    for (const category of categories) {
      const element = document.getElementById(category.section);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          currentSection = category.section;
          break;
        }
      }
    }

    onSectionChange(currentSection);
  }, [onSectionChange, isScrolling]);

  useEffect(() => {
    // Добавляем обработчики для разных событий скролла
    const handleScrollThrottled = () => {
      requestAnimationFrame(handleScroll);
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScrollWithTimeout = () => {
      handleScrollThrottled();

      // Дополнительная проверка через небольшой таймаут для iOS
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleScroll();
      }, 100);
    };

    // Добавляем обработчики для всех типов событий скролла
    window.addEventListener("scroll", handleScrollWithTimeout, { passive: true });
    window.addEventListener("touchmove", handleScrollWithTimeout, { passive: true });
    window.addEventListener("touchend", handleScrollWithTimeout, { passive: true });

    // Intersection Observer как дополнительный способ отслеживания
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionId = entry.target.id;
            if (sectionId && !isScrolling) {
              onSectionChange(sectionId);
            }
          }
        });
      },
      {
        threshold: [0.3, 0.5, 0.7],
        rootMargin: "-20% 0px -20% 0px"
      }
    );

    // Наблюдаем за всеми секциями
    const heroElement = document.getElementById("hero");
    if (heroElement) observer.observe(heroElement);

    categories.forEach((category) => {
      const element = document.getElementById(category.section);
      if (element) observer.observe(element);
    });

    // Инициализируем текущую секцию
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScrollWithTimeout);
      window.removeEventListener("touchmove", handleScrollWithTimeout);
      window.removeEventListener("touchend", handleScrollWithTimeout);
      observer.disconnect();
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll, onSectionChange, isScrolling]);

  return { setIsScrolling };
};

export const DesktopNavigation = ({
  activeSection,
  onSectionChange,
}: NavigationProps) => {
  const { setIsScrolling } = useScrollSpy(onSectionChange);

  const scrollToSection = (sectionId: string) => {
    setIsScrolling(true);

    const element = document.getElementById(sectionId);
    if (element) {
      // Используем более надежный способ скролла для iOS
      const elementTop = element.offsetTop;
      const offset = 80; // Отступ от верха

      window.scrollTo({
        top: elementTop - offset,
        behavior: "smooth"
      });

      onSectionChange(sectionId);

      // Сбрасываем флаг скролла через некоторое время
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  return (
    <div
      className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex xl:flex 2xl:flex"
      style={{
        display:
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? "flex"
            : "none",
      }}
    >
      <div className="flex flex-col space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl">
        {categories.map((category, index) => (
          <div key={category.id} className="relative group">
            <button
              onClick={() => scrollToSection(category.section)}
              className={`relative w-14 h-14 rounded-xl font-bold transition-all duration-500 shadow-lg hover:scale-110 overflow-hidden ${activeSection === category.section
                  ? "bg-royal text-white shadow-catalog-hover scale-110"
                  : "bg-white/90 backdrop-blur-sm text-royal hover:bg-royal hover:text-white"
                }`}
            >
              <span className="relative z-10">{category.id}</span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            {/* Tooltip */}
            <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div className="bg-royal text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                {category.label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-royal"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Scroll to top button */}
        <div className="relative group mt-6">
          <button
            onClick={() => scrollToSection("hero")}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-catalog-hover to-royal text-white font-bold transition-all duration-500 shadow-lg hover:scale-110 hover:shadow-catalog-hover group overflow-hidden"
            title="Yuqoriga"
          >
            <svg
              className="w-6 h-6 mx-auto transition-transform duration-300 group-hover:-translate-y-1"
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
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          {/* Tooltip */}
          <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-royal text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
              Yuqoriga
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-royal"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileNavigation = ({
  activeSection,
  onSectionChange,
}: NavigationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setIsScrolling } = useScrollSpy(onSectionChange);

  const scrollToSection = (sectionId: string) => {
    setIsScrolling(true);

    const element = document.getElementById(sectionId);
    if (element) {
      // Используем более надежный способ скролла для iOS
      const elementTop = element.offsetTop;
      const offset = 80; // Отступ от верха

      window.scrollTo({
        top: elementTop - offset,
        behavior: "smooth"
      });

      onSectionChange(sectionId);
      setIsExpanded(false); // Close expanded view after selection

      // Сбрасываем флаг скролла через некоторое время
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  };

  const currentCategoryIndex = categories.findIndex(
    (cat) => cat.section === activeSection,
  );
  const currentCategory = categories[currentCategoryIndex];

  return (
    <>
      {/* Compact Navigation */}
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 block lg:hidden xl:hidden 2xl:hidden transition-all duration-500"
        style={{
          display:
            typeof window !== "undefined" && window.innerWidth < 1024
              ? "block"
              : "none",
        }}
      >
        {!isExpanded ? (
          // Compact mode
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/30 rounded-full px-4 py-3 flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-3 group"
            >
              <div className="w-8 h-8 bg-royal rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentCategory?.id || "9"}
              </div>
              <span className="text-royal font-medium text-sm">
                {currentCategory?.label.split(" ")[1] || "3D"}
              </span>
              <svg
                className="w-4 h-4 text-royal group-hover:text-royal-light transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Progress indicator */}
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-royal to-catalog-hover transition-all duration-500 rounded-full"
                style={{
                  width: `${((currentCategoryIndex + 1) / categories.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        ) : (
          // Expanded mode
          <div className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/30 rounded-2xl p-3 w-72 max-w-[85vw]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-royal font-bold text-lg">Select Category</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToSection(category.section)}
                  className={`group relative p-4 rounded-xl transition-all duration-300 ${activeSection === category.section
                      ? "bg-royal text-white shadow-lg scale-105"
                      : "bg-gray-50 text-royal hover:bg-royal/10 hover:scale-102"
                    }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-lg ${activeSection === category.section
                          ? "bg-white/20 text-white"
                          : "bg-royal text-white"
                        }`}
                    >
                      {category.id}
                    </div>
                    <span className="text-sm font-medium block">
                      {category.label}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {activeSection === category.section && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-catalog-hover rounded-full animate-pulse"></div>
                  )}

                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-royal/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl"></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Progress</span>
                <span>
                  {currentCategoryIndex + 1} / {categories.length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-royal via-catalog-hover to-royal-light transition-all duration-500 rounded-full"
                  style={{
                    width: `${((currentCategoryIndex + 1) / categories.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for expanded mode */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};