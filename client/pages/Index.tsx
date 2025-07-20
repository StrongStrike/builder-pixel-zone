import { useState, useEffect, useRef } from "react";
import { DesktopNavigation, MobileNavigation } from "../components/Navigation";
import { ProductCarousel } from "../components/ProductCarousel";
import { ScrollToTop } from "../components/ScrollToTop";
import ErrorBoundary from "../components/ErrorBoundary";
import { products } from "../data/products";

// Компонент анимированного золотого фона
const AnimatedGoldenBackground = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Настройка canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Класс частицы
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random() * 0.6 + 0.1;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = Math.random() * 1.5 + 0.5;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
        this.decay = Math.random() * 0.01 + 0.005;
        this.brightness = Math.random() * 0.8 + 0.2;
        this.twinkle = Math.random() * 0.02 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.pullStrength = Math.random() * 0.0003 + 0.0001;
      }

      update() {
        // Гравитация к мыши
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const force = (200 - distance) / 200;
          this.vx += (dx / distance) * this.pullStrength * force;
          this.vy += (dy / distance) * this.pullStrength * force;
        }

        // Движение
        this.x += this.vx;
        this.y += this.vy;

        // Трение
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Мерцание
        this.brightness += Math.sin(Date.now() * this.twinkle + this.twinkleOffset) * 0.1;
        this.brightness = Math.max(0.1, Math.min(1, this.brightness));

        // Старение
        this.life -= this.decay;

        // Сброс если частица вышла за границы или умерла
        if (this.life <= 0 || this.x < -50 || this.x > canvas.width + 50 || this.y > canvas.height + 50) {
          this.reset();
          this.life = 1;
        }
      }

      draw(ctx) {
        ctx.save();
        
        const alpha = this.life * this.brightness * 0.7;
        
        // Создаем градиент для золотого эффекта
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        
        gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha})`); // Золотой центр
        gradient.addColorStop(0.4, `rgba(255, 193, 7, ${alpha * 0.8})`); // Золотисто-желтый
        gradient.addColorStop(0.7, `rgba(255, 165, 0, ${alpha * 0.4})`); // Оранжево-золотой
        gradient.addColorStop(1, `rgba(255, 140, 0, 0)`); // Прозрачный край

        // Внутреннее свечение
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Яркое ядро
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();

        // Дополнительное свечение для ярких частиц
        if (this.brightness > 0.7) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.1})`;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Создание частиц
    const createParticles = () => {
      const particleCount = Math.min(150, Math.max(50, Math.floor(canvas.width / 15)));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    createParticles();
    particlesRef.current = particles;

    // Отслеживание мыши
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY + window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Анимационный цикл
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Обновление и отрисовка частиц
      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      // Создание связей между близкими частицами
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.15;
            ctx.strokeStyle = `rgba(255, 215, 0, ${opacity * particles[i].life * particles[j].life})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ 
        background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.02) 0%, transparent 70%)',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default function Index() {
  const [activeSection, setActiveSection] = useState("hero");
  const activeRef = useRef(activeSection);
  const scrollTimeoutRef = useRef(null);
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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // обрабатывается в ProductCarousel
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <div className="font-jakarta bg-catalog-bg pb-safe relative">
        {/* Анимированный золотой фон */}
        <AnimatedGoldenBackground />
        
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
          className="min-h-screen relative flex items-center justify-center overflow-hidden z-10"
        >
          {/* Enhanced animated background with gold accents */}
          <div className="absolute inset-0 bg-gradient-to-br from-catalog-bg via-white to-catalog-hover/30">
            {/* Floating geometric shapes with gold tints */}
            <div className="absolute top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-32 right-4 md:right-20 w-24 md:w-40 h-24 md:h-40 bg-gradient-to-br from-amber-400/20 to-yellow-500/15 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/4 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-yellow-300/15 to-amber-400/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            {/* Enhanced pattern overlay with gold tint */}
            <div
              className="absolute inset-0 opacity-20 md:opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7c544' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>

            {/* Golden shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-amber-500/5 animate-pulse" style={{ animationDuration: '4s' }}></div>
          </div>

          <div className="text-center z-20 px-4 md:px-6 max-w-6xl mx-auto">
            {/* Main title with enhanced golden effects */}
            <div className="mb-8 md:mb-12 relative">
              <div className="relative inline-block">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-royal mb-4 md:mb-6 royal tracking-wider uppercase relative z-10 animate-fade-in-up">
                  KINGPLAST
                </h1>
                {/* Enhanced glowing effect with gold */}
                <div className="absolute inset-0 bg-gradient-to-r from-royal/20 via-yellow-400/20 to-royal/20 blur-2xl md:blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-300/15 to-amber-500/10 blur-xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              <div
                className="text-lg sm:text-xl md:text-4xl lg:text-6xl font-semibold text-royal-light mb-4 md:mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <span className="inline-block border-b-2 border-gradient-to-r from-catalog-hover to-yellow-400 pb-1 md:pb-2 bg-gradient-to-r from-catalog-hover to-amber-500 bg-clip-border">
                  Royal Katalog 2025
                </span>
              </div>

              <p
                className="text-base sm:text-lg md:text-2xl lg:text-3xl text-royal-dark font-medium animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                Royal Interior Collection 2025
              </p>

              {/* Enhanced decorative line with gold gradient */}
              <div
                className="w-20 md:w-32 h-1 bg-gradient-to-r from-royal via-yellow-400 to-royal mx-auto mt-6 md:mt-8 rounded-full animate-fade-in-up shadow-lg shadow-yellow-400/30"
                style={{ animationDelay: "0.9s" }}
              ></div>
            </div>

            {/* Enhanced CTA Section with golden accents */}
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
                  className="relative z-50 px-8 md:px-16 py-4 md:py-5 bg-gradient-to-r from-royal via-amber-600 to-royal-light text-white text-lg md:text-xl lg:text-2xl font-bold rounded-full shadow-2xl shadow-yellow-400/30 hover:shadow-amber-500/40 transform active:scale-95 md:hover:scale-105 transition-all duration-300 md:duration-500 overflow-hidden group touch-manipulation"
                >
                  <span className="relative z-10">Katalogni ko'rish</span>
                  {/* Enhanced button shine effect with gold */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {/* Mobile ripple effect with gold tint */}
                  <div className="absolute inset-0 bg-yellow-200/30 scale-0 group-active:scale-100 transition-transform duration-200 rounded-full"></div>
                </button>

                {/* Enhanced floating rings with gold */}
                <div className="hidden md:block absolute inset-0 rounded-full border-2 border-yellow-400/40 scale-110 animate-ping"></div>
                <div
                  className="hidden md:block absolute inset-0 rounded-full border border-amber-500/50 scale-125 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Contact info with golden highlights */}
              <div className="space-y-3 md:space-y-4 text-royal-dark text-base md:text-lg lg:text-xl">
                <div className="relative inline-block">
                  <p className="bg-white/60 backdrop-blur-sm px-4 md:px-6 py-2 rounded-full border border-yellow-200 text-sm md:text-base shadow-lg shadow-yellow-400/10">
                    Dekorativ plastik panellar
                  </p>
                </div>
                <div className="relative inline-block">
                  <a
                    href="tel:+998951200888"
                    className="font-bold text-royal text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-royal via-amber-600 to-royal-light bg-clip-text text-transparent hover:scale-105 transition-transform duration-200 block"
                  >
                    +998 (95) 120-66-64
                  </a>
                  <div className="absolute -inset-2 bg-gradient-to-r from-royal/10 via-yellow-400/15 to-amber-500/10 blur-lg rounded-lg -z-10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced scroll indicator with gold */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
            <div
              className="relative group cursor-pointer touch-manipulation"
              onClick={() => {
                const element = document.getElementById("section-9");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="w-6 md:w-8 h-10 md:h-12 border-2 border-royal rounded-full flex justify-center bg-gradient-to-b from-white/30 to-yellow-100/20 backdrop-blur-sm active:bg-yellow-100/20 md:hover:bg-yellow-100/20 transition-all duration-300 shadow-lg shadow-yellow-400/20">
                <div className="w-1 h-3 md:h-4 bg-gradient-to-b from-royal to-amber-600 rounded-full mt-2 animate-pulse"></div>
              </div>
              <div className="hidden md:block absolute inset-0 border-2 border-yellow-400/40 rounded-full scale-110 animate-ping group-hover:animate-none"></div>
            </div>
          </div>
        </section>

        {/* Product Categories with golden backdrop */}
        <div className="relative z-10 bg-gradient-to-b from-transparent via-yellow-50/30 to-transparent">
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
        </div>

        {/* Enhanced footer with golden effects */}
        <footer className="relative overflow-hidden z-10">
          {/* Enhanced background with gold */}
          <div className="absolute inset-0 bg-gradient-to-br from-royal via-amber-900 to-royal-light"></div>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          
          {/* Golden shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10 animate-pulse" style={{ animationDuration: '6s' }}></div>

          <div className="relative z-10 py-20 px-4 text-white">
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-12">
                <h3 className="text-5xl md:text-7xl font-bold mb-6 royal tracking-wider uppercase relative">
                  KINGPLAST
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-yellow-400/20 to-white/10 blur-2xl -z-10"></div>
                </h3>
                <p className="text-2xl md:text-3xl mb-8 text-yellow-300 font-medium">
                  Royal Interior Collection 2025
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-yellow-300">
                    Mahsulotlar
                  </h4>
                  <p className="text-white/80">Dekorativ plastik panellar</p>
                  <p className="text-white/80">Qirollik sifati</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-yellow-300">
                    Aloqa
                  </h4>
                  <p className="font-bold text-2xl text-yellow-300">
                    +998 (95) 120-66-64
                  </p>
                  <p className="text-white/80">Har kuni 9:00 - 20:00</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-yellow-300">
                    Sifat
                  </h4>
                  <p className="text-white/80">Yuqori sifatli materiallar</p>
                  <p className="text-white/80">Professional xizmat</p>
                </div>
              </div>

              <div className="pt-8 border-t border-yellow-400/30">
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