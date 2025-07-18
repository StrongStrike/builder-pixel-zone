import { useState, useEffect, useRef } from "react";
import { DesktopNavigation, MobileNavigation } from "../components/Navigation";
import { ProductCarousel } from "../components/ProductCarousel";
import { ScrollToTop } from "../components/ScrollToTop";
import ErrorBoundary from "../components/ErrorBoundary";
import { products } from "../data/products";

export default function Index() {
  const [activeSection, setActiveSection] = useState("hero");
  const activeRef = useRef(activeSection); // хранит актуальное значение
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdating = useRef(false);

  useEffect(() => {
    activeRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const SCROLL_DELAY = 150;
    const VISIBILITY_THRESHOLD = 0.6;
    const HYSTERESIS = 0.1;

    const sections = [
      "hero",
      "section-9",
      "section-12",
      "section-x12",
      "section-16",
      "section-18",
      "section-20",
      "section-25",
      "section-40",
      "section-60",
    ];

    const updateActiveSection = () => {
      if (isUpdating.current) return;
      isUpdating.current = true;

      const viewportHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;
      let currentBest = { section: activeRef.current, score: 0 };

      if (scrollTop < 200) {
        if (activeRef.current !== "hero") {
          setActiveSection("hero");
        }
        isUpdating.current = false;
        return;
      }

      for (const sectionId of sections) {
        if (sectionId === "hero" && scrollTop >= 200) continue;

        const element = document.getElementById(sectionId);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const centerDistance = Math.abs(elementCenter - viewportCenter);
        const maxDistance = viewportHeight / 2 + rect.height / 2;

        const centerScore = Math.max(0, 1 - centerDistance / maxDistance);
        const visibleTop = Math.max(
          0,
          Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
        );
        const visibilityScore =
          visibleTop / Math.min(rect.height, viewportHeight);

        const finalScore = centerScore * 0.7 + visibilityScore * 0.3;
        const adjustedScore =
          sectionId === activeRef.current
            ? finalScore + HYSTERESIS
            : finalScore;

        if (
          adjustedScore > VISIBILITY_THRESHOLD &&
          adjustedScore > currentBest.score
        ) {
          currentBest = { section: sectionId, score: adjustedScore };
        }
      }

      if (
        currentBest.section &&
        currentBest.section !== activeRef.current &&
        currentBest.score > VISIBILITY_THRESHOLD
      ) {
        setActiveSection(currentBest.section);
      }

      isUpdating.current = false;
    };

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(updateActiveSection, SCROLL_DELAY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // обрабатывается в ProductCarousel
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <div className="font-jakarta bg-catalog-bg pb-safe">
        <DesktopNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <MobileNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Hero Section */}
        <section
          id="hero"
          className="min-h-screen relative flex items-center justify-center overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-catalog-bg via-white to-catalog-hover/30">
            {/* Floating geometric shapes - adjusted for mobile */}
            <div className="absolute top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-royal/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-32 right-4 md:right-20 w-24 md:w-40 h-24 md:h-40 bg-catalog-hover/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/4 w-16 md:w-24 h-16 md:h-24 bg-royal-light/15 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Pattern overlay */}
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f7c544" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-20 md:opacity-30'
              }
            ></div>
          </div>

          <div className="text-center z-10 px-4 md:px-6 max-w-6xl mx-auto">
            {/* Main title with mobile-optimized animations */}
            <div className="mb-8 md:mb-12 relative">
              <div className="relative inline-block">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-royal mb-4 md:mb-6 royal tracking-wider uppercase relative z-10 animate-fade-in-up">
                  KINGPLAST
                </h1>
                {/* Glowing effect behind text */}
                <div className="absolute inset-0 bg-gradient-to-r from-royal/20 via-catalog-hover/30 to-royal/20 blur-2xl md:blur-3xl -z-10 animate-pulse"></div>
              </div>

              <div
                className="text-lg sm:text-xl md:text-4xl lg:text-6xl font-semibold text-royal-light mb-4 md:mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <span className="inline-block border-b-2 border-catalog-hover pb-1 md:pb-2">
                  Royal Katalog 2025
                </span>
              </div>

              <p
                className="text-base sm:text-lg md:text-2xl lg:text-3xl text-royal-dark font-medium animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                Royal Interior Collection 2025
              </p>

              {/* Decorative line */}
              <div
                className="w-20 md:w-32 h-1 bg-gradient-to-r from-royal via-catalog-hover to-royal mx-auto mt-6 md:mt-8 rounded-full animate-fade-in-up"
                style={{ animationDelay: "0.9s" }}
              ></div>
            </div>

            {/* Mobile-optimized CTA Section */}
            <div
              className="space-y-6 md:space-y-8 animate-fade-in-up"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="relative inline-block group z-50">
                <button
                  onClick={() => {
                    const element = document.getElementById("section-9");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="relative z-50 px-8 md:px-16 py-4 md:py-5 bg-gradient-to-r from-royal to-royal-light text-white text-lg md:text-xl lg:text-2xl font-bold rounded-full shadow-2xl hover:shadow-catalog-hover transform active:scale-95 md:hover:scale-105 transition-all duration-300 md:duration-500 overflow-hidden group touch-manipulation"
                >
                  <span className="relative z-10">Katalogni ko'rish</span>
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {/* Mobile ripple effect */}
                  <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-full"></div>
                </button>

                {/* Floating rings - hidden on mobile for performance */}
                <div className="hidden md:block absolute inset-0 rounded-full border-2 border-royal/30 scale-110 animate-ping"></div>
                <div
                  className="hidden md:block absolute inset-0 rounded-full border border-catalog-hover/40 scale-125 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Mobile-optimized contact info */}
              <div className="space-y-3 md:space-y-4 text-royal-dark text-base md:text-lg lg:text-xl">
                <div className="relative inline-block">
                  <p className="bg-white/60 backdrop-blur-sm px-4 md:px-6 py-2 rounded-full border border-catalog-border text-sm md:text-base">
                    Dekorativ plastik panellar
                  </p>
                </div>
                <div className="relative inline-block">
                  <a
                    href="tel:+998951200888"
                    className="font-bold text-royal text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-royal to-royal-light bg-clip-text text-transparent hover:scale-105 transition-transform duration-200 block"
                  >
                    +998 (95) 120-66-64
                  </a>
                  <div className="absolute -inset-2 bg-gradient-to-r from-royal/10 to-catalog-hover/10 blur-lg rounded-lg -z-10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced mobile-friendly scroll indicator */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div
              className="relative group cursor-pointer touch-manipulation"
              onClick={() => {
                const element = document.getElementById("section-9");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="w-6 md:w-8 h-10 md:h-12 border-2 border-royal rounded-full flex justify-center bg-white/20 backdrop-blur-sm active:bg-royal/10 md:hover:bg-royal/10 transition-all duration-300">
                <div className="w-1 h-3 md:h-4 bg-royal rounded-full mt-2 animate-pulse"></div>
              </div>
              <div className="hidden md:block absolute inset-0 border-2 border-royal/30 rounded-full scale-110 animate-ping group-hover:animate-none"></div>
            </div>
          </div>

          {/* Floating particles - reduced on mobile */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="hidden md:block absolute top-1/4 left-1/3 w-2 h-2 bg-royal rounded-full opacity-60 animate-float"></div>
            <div
              className="absolute top-3/4 left-1/4 w-1 h-1 bg-catalog-hover rounded-full opacity-40 animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="hidden md:block absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-royal-light rounded-full opacity-50 animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>
        </section>

        {/* Product Categories */}
        <ProductCarousel
          title="9sm 3D DekorPlast"
          subtitle="Yuqori sifatli dekorativ panellar"
          products={products["9"]}
          sectionId="section-9"
        />

        <ProductCarousel
          title="12sm 3D DekorPlast"
          subtitle="Zamonaviy dizayn va mukammal sifat"
          products={products["12"]}
          sectionId="section-12"
        />

        <ProductCarousel
          title="x12sm 3D DekorPlast"
          subtitle="Maxsus kolleksiya uchun"
          products={products.x12}
          sectionId="section-x12"
        />

        <ProductCarousel
          title="16sm 3D DekorPlast"
          subtitle="Keng tanlov va chiroyli dizayn"
          products={products["16"]}
          sectionId="section-16"
        />

        <ProductCarousel
          title="18sm 3D DekorPlast"
          subtitle="Premium sifat va uslub"
          products={products["18"]}
          sectionId="section-18"
        />

        <ProductCarousel
          title="20sm 3D DekorPlast"
          subtitle="Mukammal yechim har qanday interior uchun"
          products={products["20"]}
          sectionId="section-20"
        />

        <ProductCarousel
          title="25sm DekorPlast"
          subtitle="Eng yangi kolleksiya"
          products={products["25"]}
          sectionId="section-25"
        />

        <ProductCarousel
          title="40sm DekorPlast"
          subtitle="Professional darajadagi yechimlar"
          products={products["40"]}
          sectionId="section-40"
        />

        <ProductCarousel
          title="60sm DekorPlast"
          subtitle="Maksimal chidamlilik va nafislik"
          products={products["60"]}
          sectionId="section-60"
        />

        {/* Professional Footer */}
        <footer className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-royal via-royal-dark to-royal-light"></div>
          <div
            className={
              'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
            }
          ></div>

          <div className="relative z-10 py-20 px-4 text-white">
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-12">
                <h3 className="text-5xl md:text-7xl font-bold mb-6 royal tracking-wider uppercase relative">
                  KINGPLAST
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-catalog-hover/20 to-white/10 blur-2xl -z-10"></div>
                </h3>
                <p className="text-2xl md:text-3xl mb-8 text-catalog-hover font-medium">
                  Royal Interior Collection 2025
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-catalog-hover">
                    Mahsulotlar
                  </h4>
                  <p className="text-white/80">Dekorativ plastik panellar</p>
                  <p className="text-white/80">7 ta turli kategoriya</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-catalog-hover">
                    Aloqa
                  </h4>
                  <p className="font-bold text-2xl text-catalog-hover">
                    +998 (95) 120-66-64
                  </p>
                  <p className="text-white/80">Har kuni 9:00 - 18:00</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-catalog-hover">
                    Sifat
                  </h4>
                  <p className="text-white/80">Yuqori sifatli materiallar</p>
                  <p className="text-white/80">Professional xizmat</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/20">
                <p className="text-white/60 text-lg">
                  © 2025 KINGPLAST. Barcha huquqlar himoyalangan.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}
