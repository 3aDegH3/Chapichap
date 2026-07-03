"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SVGProps,
} from "react";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = ComponentType<IconProps>;

type RevealDirection = "up" | "down" | "left" | "right" | "fade";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
};

type FooterLinkProps = {
  href: string;
  label: string;
  description?: string;
  icon?: IconComponent;
};

type FooterHeadingProps = {
  eyebrow: string;
  title: string;
  icon: IconComponent;
};

type SpotlightPanelProps = {
  children: ReactNode;
  className?: string;
};

const designServices = [
  {
    type: "print",
    label: "طرح آماده برای چاپ",
    description: "انتخاب طرح‌های آماده و قابل شخصی‌سازی",
    icon: PrintIcon,
  },
  {
    type: "custom_print",
    label: "طرح اختصاصی چاپ",
    description: "طراحی از صفر متناسب با ایده شما",
    icon: PaletteIcon,
  },
  {
    type: "gift",
    label: "هدیه اختصاصی",
    description: "هدیه شخصی برای مناسبت‌های خاص",
    icon: GiftIcon,
  },
  {
    type: "caricature",
    label: "طراحی کاریکاتور",
    description: "تبدیل عکس به یک طرح متفاوت",
    icon: FaceIcon,
  },
  {
    type: "consulting",
    label: "مشاوره طراحی",
    description: "انتخاب بهترین محصول و روش چاپ",
    icon: MessageIcon,
  },
  {
    type: "other",
    label: "سایر خدمات",
    description: "بررسی ایده‌های متفاوت و سفارشی",
    icon: SparklesIcon,
  },
] as const;

const quickLinks = [
  {
    href: "/",
    label: "صفحه اصلی",
    description: "بازگشت به صفحه نخست",
    icon: HomeIcon,
  },
  {
    href: "/products",
    label: "فروشگاه محصولات",
    description: "مشاهده محصولات قابل سفارش",
    icon: ShoppingBagIcon,
  },
  {
    href: "/portfolio",
    label: "نمونه‌کارها",
    description: "مشاهده پروژه‌های اجراشده",
    icon: GalleryIcon,
  },
  {
    href: "/design-request",
    label: "طراحی اختصاصی",
    description: "ثبت ایده و سفارش دلخواه",
    icon: PaletteIcon,
  },
  {
    href: "/about",
    label: "درباره چاپی چاپ",
    description: "آشنایی با داستان و مسیر ما",
    icon: InfoIcon,
  },
  {
    href: "/contact",
    label: "تماس با ما",
    description: "ارتباط و دریافت مشاوره",
    icon: PhoneIcon,
  },
] as const;

const supportLinks = [
  {
    href: "/account",
    label: "داشبورد حساب",
    description: "مدیریت حساب و فعالیت‌ها",
    icon: UserIcon,
  },
  {
    href: "/account/orders",
    label: "سفارش‌های من",
    description: "مشاهده و پیگیری سفارش‌ها",
    icon: PackageIcon,
  },
  {
    href: "/account/tickets",
    label: "پشتیبانی و تیکت",
    description: "ارسال درخواست برای پشتیبانی",
    icon: HeadsetIcon,
  },
  {
    href: "/account/design-requests",
    label: "درخواست‌های طراحی",
    description: "پیگیری طرح‌های اختصاصی",
    icon: PaletteIcon,
  },
  {
    href: "/account/profile",
    label: "اطلاعات کاربری",
    description: "ویرایش مشخصات حساب",
    icon: SettingsIcon,
  },
  {
    href: "/cart",
    label: "سبد خرید",
    description: "بررسی محصولات انتخاب‌شده",
    icon: ShoppingBagIcon,
  },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        observer.unobserve(element);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const revealStyle = {
    "--footer-reveal-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <div
      ref={elementRef}
      style={revealStyle}
      className={[
        "footer-reveal",
        `footer-reveal--${direction}`,
        isVisible ? "footer-reveal--visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function SpotlightPanel({
  children,
  className = "",
}: SpotlightPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = panelRef.current;

    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;

    element.style.setProperty("--footer-pointer-x", `${pointerX}px`);
    element.style.setProperty("--footer-pointer-y", `${pointerY}px`);
  };

  const handlePointerLeave = () => {
    const element = panelRef.current;

    if (!element) return;

    element.style.setProperty("--footer-pointer-x", "70%");
    element.style.setProperty("--footer-pointer-y", "20%");
  };

  return (
    <div
      ref={panelRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`footer-spotlight ${className}`}
    >
      {children}
    </div>
  );
}

function FooterLink({
  href,
  label,
  description,
  icon: Icon,
}: FooterLinkProps) {
  return (
    <Link
      href={href}
      className="footer-navigation-link group relative flex min-h-[74px] items-center gap-4 overflow-hidden rounded-[20px] border border-transparent px-4 py-3.5 outline-none transition-[transform,border-color,background-color,color,box-shadow] duration-500 ease-out hover:-translate-x-1 hover:border-white/[0.09] hover:bg-white/[0.055] hover:shadow-[0_18px_40px_-34px_rgba(0,0,0,0.95)] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/75"
    >
      <span className="pointer-events-none absolute inset-y-3 right-0 w-1 origin-center scale-y-0 rounded-full bg-[#d2ad70] transition-transform duration-500 ease-out group-hover:scale-y-100" />

      {Icon && (
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/[0.07] bg-white/[0.045] text-[#a99c8e] transition-all duration-500 ease-out group-hover:rotate-[-4deg] group-hover:border-[#d2ad70]/50 group-hover:bg-[#d2ad70] group-hover:text-[#292521]">
          <span className="pointer-events-none absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0" />
          <Icon className="relative h-6 w-6" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-[20px] font-black leading-8 text-[#d8cec3] transition-colors duration-300 group-hover:text-white">
          {label}
        </span>

        {description && (
          <span className="mt-0.5 block text-[20px] font-bold leading-7 text-[#887d72] transition-colors duration-300 group-hover:text-[#b7ab9f]">
            {description}
          </span>
        )}
      </span>

      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.06] bg-white/[0.035] text-[#74695f] transition-all duration-500 ease-out group-hover:-translate-x-1 group-hover:border-[#d2ad70]/30 group-hover:bg-[#d2ad70]/10 group-hover:text-[#e4bc78]">
        <ArrowLeftIcon className="h-5 w-5" />
      </span>
    </Link>
  );
}

function FooterHeading({
  eyebrow,
  title,
  icon: Icon,
}: FooterHeadingProps) {
  return (
    <div className="flex items-start gap-4">
      <span className="footer-heading-icon relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[#d2ad70]/25 bg-[#d2ad70]/10 text-[#e1b873] shadow-[0_18px_35px_-28px_rgba(210,173,112,0.75)]">
        <span className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
        <Icon className="relative h-7 w-7" />
      </span>

      <div>
        <p className="text-[20px] font-black tracking-[0.05em] text-[#d2ad70]">
          {eyebrow}
        </p>

        <h3 className="mt-1.5 text-[25px] font-black leading-10 text-white sm:text-[27px]">
          {title}
        </h3>

        <span className="relative mt-4 block h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.08]">
          <span className="footer-heading-line absolute inset-y-0 right-0 w-11 rounded-full bg-gradient-to-l from-[#f0cc8b] via-[#d2ad70] to-[#855e31]" />
        </span>
      </div>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear().toLocaleString("fa-IR", {
    useGrouping: false,
  });

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 700);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="footer-root relative overflow-hidden border-t border-[#ded4c7] bg-[#191714] text-white">
        {/* نوار طلایی بالای فوتر */}
        <div className="relative h-[6px] overflow-hidden bg-[#292521]">
          <div className="footer-top-line absolute inset-0 bg-gradient-to-l from-transparent via-[#e0b973] to-transparent" />
        </div>

        {/* پس‌زمینه تزئینی */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="footer-orb footer-orb--one absolute -right-64 top-10 h-[620px] w-[620px] rounded-full bg-[#d2ad70]/[0.085] blur-[125px]" />

          <div className="footer-orb footer-orb--two absolute -left-64 bottom-0 h-[560px] w-[560px] rounded-full bg-white/[0.045] blur-[120px]" />

          <div className="footer-orb footer-orb--three absolute left-[35%] top-[35%] h-[390px] w-[390px] rounded-full bg-[#8d6334]/[0.055] blur-[100px]" />

          <div className="absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_50%_0%,rgba(210,173,112,0.12),transparent_58%)]" />

          <div className="footer-grid-pattern absolute inset-0 opacity-[0.035]" />

          <div className="footer-floating-shape footer-floating-shape--one absolute right-[6%] top-[16%] h-5 w-5 rotate-45 rounded-[4px] border border-[#d2ad70]/35" />

          <div className="footer-floating-shape footer-floating-shape--two absolute left-[8%] top-[38%] h-8 w-8 rotate-12 rounded-[8px] border border-white/10" />

          <div className="footer-floating-shape footer-floating-shape--three absolute bottom-[14%] right-[45%] h-3 w-3 rounded-full bg-[#d2ad70]/30" />

          <svg
            className="absolute left-0 top-20 h-[420px] w-[420px] opacity-[0.025]"
            viewBox="0 0 420 420"
            fill="none"
          >
            <circle cx="210" cy="210" r="170" stroke="currentColor" />
            <circle cx="210" cy="210" r="125" stroke="currentColor" />
            <circle cx="210" cy="210" r="80" stroke="currentColor" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-[1600px] px-4 pb-6 pt-8 sm:px-6 sm:pt-10 xl:px-8">
          {/* محتوای اصلی فوتر */}
          <div className="grid gap-12 border-b border-white/[0.09] py-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1fr_1.15fr] lg:gap-9 lg:py-16 xl:gap-14">
            {/* معرفی برند */}
            <Reveal direction="right">
              <div>
                <Link
                  href="/"
                  className="group inline-flex items-center gap-5 rounded-[26px] outline-none focus-visible:ring-2 focus-visible:ring-[#d2ad70]/75"
                  aria-label="صفحه اصلی چاپی چاپ"
                >
                  <span className="footer-logo-card relative flex h-[118px] w-[118px] shrink-0 items-center justify-center overflow-hidden rounded-[30px] border border-[#d2ad70]/40 bg-[#fbfaf6] shadow-[0_28px_60px_-32px_rgba(0,0,0,1)] transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-3deg] group-hover:border-[#d2ad70]">
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-transparent to-[#ead5b4]/50" />

                    <span className="footer-logo-glow pointer-events-none absolute -inset-8 rounded-full border border-[#d2ad70]/0 transition-colors duration-500 group-hover:border-[#d2ad70]/15" />

                    <Image
                      src="/brand/logo.webp"
                      alt="لوگوی چاپی چاپ"
                      width={170}
                      height={170}
                      className="relative h-full w-full object-contain p-0.5 transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </span>

                  <span>
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span className="block text-[35px] font-black tracking-tight text-white sm:text-[38px]">
                        چاپی چاپ
                      </span>

                      <span className="footer-small-badge rounded-full border border-[#d2ad70]/30 bg-[#d2ad70]/10 px-3.5 py-1.5 text-[20px] font-black text-[#e1b873]">
                        استودیو چاپ
                      </span>
                    </span>

                    <span className="mt-2 block text-[20px] font-bold tracking-[0.035em] text-[#d2ad70]">
                      طراحی · چاپ · هدیه اختصاصی
                    </span>
                  </span>
                </Link>

                <p className="mt-8 max-w-lg text-[20px] font-medium leading-10 text-[#c5baaf]">
                  چاپی چاپ جایی برای تبدیل عکس‌ها، ایده‌ها و لحظه‌های مهم شما
                  به محصولاتی شخصی، زیبا و ماندگار است؛ محصولاتی که فقط چاپ
                  نمی‌شوند، بلکه داستان شما را روایت می‌کنند.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    "طراحی متناسب با سلیقه و مناسبت شما",
                    "بررسی جزئیات سفارش قبل از چاپ",
                    "پشتیبانی در تمام مراحل آماده‌سازی",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="group flex min-h-[54px] items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.03] px-4 transition-all duration-400 hover:border-[#d2ad70]/25 hover:bg-white/[0.055]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-[#d2ad70]/12 text-[#d2ad70] transition-all duration-400 group-hover:bg-[#d2ad70] group-hover:text-[#292521]">
                        <CheckIcon className="h-5 w-5" />
                      </span>

                      <span className="text-[20px] font-bold leading-8 text-[#c3b8ad]">
                        {item}
                      </span>

                      <span className="mr-auto text-[20px] font-black text-[#62584f]">
                        ۰{index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* کارت مشاوره */}
                <SpotlightPanel className="relative mt-8 overflow-hidden rounded-[28px] border border-[#d2ad70]/25 bg-gradient-to-l from-[#392f26] to-[#25211e] p-6">
                  <div className="footer-pointer-light pointer-events-none absolute inset-0 opacity-60" />

                  <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#d2ad70]/15 blur-[70px]" />

                  <div className="relative flex items-start gap-4">
                    <span className="footer-chat-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-[21px] bg-[#d2ad70] text-[#292521] shadow-[0_18px_35px_-20px_rgba(210,173,112,0.9)]">
                      <MessageIcon className="h-8 w-8" />
                    </span>

                    <div>
                      <p className="text-[22px] font-black leading-9 text-white">
                        برای انتخاب محصول مرددی؟
                      </p>

                      <p className="mt-2 text-[20px] font-medium leading-8 text-[#c5baaf]">
                        ایده و بودجه‌ات را بگو تا مناسب‌ترین محصول و روش چاپ را
                        پیشنهاد کنیم.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="group relative mt-6 inline-flex min-h-[56px] items-center gap-3 rounded-[17px] border border-[#d2ad70]/30 bg-[#d2ad70]/10 px-6 text-[20px] font-black text-[#eccb91] outline-none transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/75"
                  >
                    دریافت مشاوره طراحی

                    <ArrowLeftIcon className="h-6 w-6 transition-transform duration-500 group-hover:-translate-x-1.5" />
                  </Link>
                </SpotlightPanel>
              </div>
            </Reveal>

            {/* لینک‌های اصلی */}
            <Reveal direction="up" delay={100}>
              <nav aria-label="مسیرهای اصلی سایت">
                <FooterHeading
                  eyebrow="دسترسی سریع"
                  title="مسیرهای اصلی"
                  icon={CompassIcon}
                />

                <div className="mt-7 grid gap-1.5">
                  {quickLinks.map((link) => (
                    <FooterLink key={link.href} {...link} />
                  ))}
                </div>
              </nav>
            </Reveal>

            {/* خدمات مشتریان */}
            <Reveal direction="up" delay={180}>
              <nav aria-label="خدمات مشتریان">
                <FooterHeading
                  eyebrow="حساب و سفارش"
                  title="خدمات مشتریان"
                  icon={UserIcon}
                />

                <div className="mt-7 grid gap-1.5">
                  {supportLinks.map((link) => (
                    <FooterLink key={link.href} {...link} />
                  ))}
                </div>
              </nav>
            </Reveal>

            {/* خدمات اختصاصی */}
            <Reveal direction="left" delay={260}>
              <div>
                <FooterHeading
                  eyebrow="برای ایده‌های خاص"
                  title="خدمات اختصاصی"
                  icon={SparklesIcon}
                />

                <div className="mt-7 grid gap-3">
                  {designServices.map((service, index) => {
                    const Icon = service.icon;

                    return (
                      <Link
                        key={service.type}
                        href={`/design-request?type=${service.type}`}
                        className="footer-service-link group relative flex min-h-[78px] items-center gap-4 overflow-hidden rounded-[21px] border border-white/[0.08] bg-white/[0.035] px-4 py-3 outline-none transition-all duration-500 ease-out hover:-translate-x-1.5 hover:border-[#d2ad70]/38 hover:bg-[#d2ad70]/10 hover:shadow-[0_18px_45px_-36px_rgba(0,0,0,1)] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/75"
                      >
                        <span className="absolute inset-y-3 right-0 w-1 scale-y-0 rounded-full bg-[#d2ad70] transition-transform duration-500 group-hover:scale-y-100" />

                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.07] bg-white/[0.055] text-[#a99b8c] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:border-[#d2ad70] group-hover:bg-[#d2ad70] group-hover:text-[#292521]">
                          <Icon className="h-6 w-6" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[20px] font-black leading-8 text-[#d7ccc1] transition-colors duration-300 group-hover:text-[#f1d19a]">
                            {service.label}
                          </span>

                          <span className="mt-0.5 block text-[20px] font-bold leading-7 text-[#82766b] transition-colors duration-300 group-hover:text-[#b2a598]">
                            {service.description}
                          </span>
                        </span>

                        <span className="flex flex-col items-center gap-1">
                          <span className="text-[20px] font-black text-[#62574d]">
                            {(index + 1).toLocaleString("fa-IR", {
                              minimumIntegerDigits: 2,
                            })}
                          </span>

                          <ArrowLeftIcon className="h-5 w-5 text-[#74695e] transition-all duration-500 group-hover:-translate-x-1 group-hover:text-[#d2ad70]" />
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <SpotlightPanel className="relative mt-6 overflow-hidden rounded-[27px] border border-[#d2ad70]/30 bg-gradient-to-l from-[#3d3329] to-[#292521] p-6">
                  <div className="footer-pointer-light pointer-events-none absolute inset-0 opacity-60" />

                  <div className="pointer-events-none absolute -left-14 -top-14 h-44 w-44 rounded-full bg-[#d2ad70]/15 blur-[60px]" />

                  <div className="relative">
                    <span className="footer-idea-icon inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#d2ad70]/25 bg-[#d2ad70]/10 text-[#e6be7c]">
                      <LightbulbIcon className="h-7 w-7" />
                    </span>

                    <p className="mt-5 text-[23px] font-black leading-9 text-white">
                      سفارش متفاوتی داری؟
                    </p>

                    <p className="mt-2 text-[20px] font-medium leading-8 text-[#c5baaf]">
                      فایل، عکس یا مناسبت موردنظر را بفرست تا بهترین روش اجرای
                      آن را بررسی کنیم.
                    </p>

                    <Link
                      href="/design-request"
                      className="footer-primary-button group relative mt-6 inline-flex min-h-[58px] items-center justify-center gap-3 overflow-hidden rounded-[18px] bg-[#d2ad70] px-7 text-[20px] font-black text-[#292521] shadow-[0_18px_35px_-22px_rgba(210,173,112,0.8)] outline-none transition-all duration-500 ease-out hover:-translate-y-1.5 hover:bg-[#e3be7a] focus-visible:ring-2 focus-visible:ring-[#f1d098]"
                    >
                      <span className="footer-button-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-sm" />

                      <span className="relative">ارسال ایده برای بررسی</span>

                      <ArrowLeftIcon className="relative h-6 w-6 transition-transform duration-500 group-hover:-translate-x-1.5" />
                    </Link>
                  </div>
                </SpotlightPanel>
              </div>
            </Reveal>
          </div>

          {/* بخش پایانی */}
          <Reveal direction="fade">
            <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <p className="text-[20px] font-bold leading-8 text-[#aaa095] sm:text-[20px]">
                  © {currentYear} تمام حقوق برای{" "}
                  <span className="font-black text-white">چاپی چاپ</span> محفوظ
                  است.
                </p>

                <span className="hidden h-5 w-px bg-white/15 sm:block" />

                <p className="text-[20px] font-bold leading-8 text-[#766c62] sm:text-[20px]">
                  طراحی‌شده با تمرکز بر یک تجربه ساده و لذت‌بخش
                </p>
              </div>

              <div className="footer-love-badge inline-flex min-h-[54px] items-center gap-3 self-start rounded-full border border-[#d2ad70]/25 bg-[#d2ad70]/[0.08] px-6 text-[20px] font-black text-[#ddb97b] lg:self-auto sm:text-[20px]">
                <HeartIcon className="footer-heart-icon h-6 w-6" />
                هدیه‌ای شخصی، چاپی تمیز، تجربه‌ای ماندگار
              </div>
            </div>
          </Reveal>
        </div>
      </footer>

      {/* دکمه بازگشت به بالا */}
      <button
        type="button"
        onClick={handleScrollToTop}
        className={[
          "footer-scroll-top fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#d2ad70]/35 bg-[#292521]/95 text-[#e4bd7a] shadow-[0_20px_45px_-22px_rgba(0,0,0,0.9)] backdrop-blur-xl outline-none transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/70",
          showScrollButton
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-5 scale-90 opacity-0",
        ].join(" ")}
        aria-label="بازگشت به بالای صفحه"
      >
        <ArrowUpIcon className="h-7 w-7" />
      </button>

      <style jsx global>{`
        .footer-root {
          isolation: isolate;
        }

        .footer-grid-pattern {
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.28) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.28) 1px,
              transparent 1px
            );
          background-size: 52px 52px;
          mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.85),
            transparent 90%
          );
        }

        .footer-top-line {
          background-size: 240% 100%;
          animation: footer-top-line-move 7s ease-in-out infinite;
        }

        .footer-orb {
          will-change: transform;
        }

        .footer-orb--one {
          animation: footer-orb-one 16s ease-in-out infinite alternate;
        }

        .footer-orb--two {
          animation: footer-orb-two 19s ease-in-out infinite alternate;
        }

        .footer-orb--three {
          animation: footer-orb-three 21s ease-in-out infinite alternate;
        }

        .footer-floating-shape--one {
          animation: footer-floating-one 8s ease-in-out infinite;
        }

        .footer-floating-shape--two {
          animation: footer-floating-two 11s ease-in-out infinite;
        }

        .footer-floating-shape--three {
          animation: footer-floating-three 7s ease-in-out infinite;
        }

        .footer-ring--one {
          animation: footer-ring-one 18s linear infinite;
        }

        .footer-ring--two {
          animation: footer-ring-two 13s linear infinite reverse;
        }

        .footer-spotlight {
          --footer-pointer-x: 70%;
          --footer-pointer-y: 20%;
        }

        .footer-pointer-light {
          background: radial-gradient(
            430px circle at var(--footer-pointer-x) var(--footer-pointer-y),
            rgba(229, 188, 117, 0.13),
            transparent 68%
          );
          transition: opacity 400ms ease;
        }

        .footer-reveal {
          opacity: 0;
          transition:
            opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 900ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--footer-reveal-delay, 0ms);
          filter: blur(6px);
          will-change: opacity, transform, filter;
        }

        .footer-reveal--up {
          transform: translate3d(0, 44px, 0);
        }

        .footer-reveal--down {
          transform: translate3d(0, -44px, 0);
        }

        .footer-reveal--right {
          transform: translate3d(44px, 0, 0);
        }

        .footer-reveal--left {
          transform: translate3d(-44px, 0, 0);
        }

        .footer-reveal--fade {
          transform: scale(0.985);
        }

        .footer-reveal--visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }

        .footer-badge {
          transition:
            transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 450ms ease,
            background-color 450ms ease,
            box-shadow 450ms ease;
        }

        .footer-badge:hover {
          transform: translateY(-3px);
          border-color: rgba(210, 173, 112, 0.42);
          background-color: rgba(255, 255, 255, 0.085);
        }

        .footer-badge--gold {
          animation: footer-badge-glow 4s ease-in-out infinite;
        }

        .footer-highlighted-title::after {
          content: "";
          position: absolute;
          right: 0;
          bottom: 4px;
          width: 100%;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            to left,
            transparent,
            rgba(232, 194, 127, 0.85),
            transparent
          );
          transform-origin: right;
          animation: footer-title-line 3.8s ease-in-out infinite;
        }

        .footer-primary-button:hover .footer-button-shine {
          animation: footer-button-shine 850ms ease-out;
        }

        .footer-secondary-button {
          position: relative;
          overflow: hidden;
        }

        .footer-secondary-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 20%,
            rgba(255, 255, 255, 0.08),
            transparent 80%
          );
          transform: translateX(120%);
          transition: transform 800ms ease;
        }

        .footer-secondary-button:hover::before {
          transform: translateX(-120%);
        }

        .footer-route-icon {
          animation: footer-route-float 4.6s ease-in-out infinite;
        }

        .footer-process-line {
          transform-origin: top;
          animation: footer-process-line 4s ease-in-out infinite;
        }

        .footer-process-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 30%,
            rgba(255, 255, 255, 0.035),
            transparent 70%
          );
          transform: translateX(120%);
          transition: transform 900ms ease;
        }

        .footer-process-card:hover::after {
          transform: translateX(-120%);
        }

        .footer-trust-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.045),
            transparent 42%
          );
          opacity: 0;
          transition: opacity 500ms ease;
        }

        .footer-trust-card:hover::after {
          opacity: 1;
        }

        .footer-heading-icon {
          animation: footer-heading-icon 5s ease-in-out infinite;
        }

        .footer-heading-line {
          animation: footer-heading-line 4s ease-in-out infinite;
        }

        .footer-navigation-link::after,
        .footer-service-link::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.035),
            transparent 70%
          );
          transform: translateX(120%);
          transition: transform 850ms ease;
        }

        .footer-navigation-link:hover::after,
        .footer-service-link:hover::after {
          transform: translateX(-120%);
        }

        .footer-logo-card::after {
          content: "";
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgba(210, 173, 112, 0.22),
            transparent 35%
          );
          animation: footer-logo-rotate 8s linear infinite;
        }

        .footer-logo-card > * {
          z-index: 1;
        }

        .footer-small-badge {
          animation: footer-small-badge 4s ease-in-out infinite;
        }

        .footer-chat-icon {
          animation: footer-chat-icon 4.8s ease-in-out infinite;
        }

        .footer-idea-icon {
          animation: footer-idea-icon 3.8s ease-in-out infinite;
        }

        .footer-love-badge {
          transition:
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 500ms ease,
            background-color 500ms ease;
        }

        .footer-love-badge:hover {
          transform: translateY(-3px);
          border-color: rgba(210, 173, 112, 0.5);
          background-color: rgba(210, 173, 112, 0.13);
        }

        .footer-heart-icon {
          animation: footer-heart 2.2s ease-in-out infinite;
          transform-origin: center;
        }

        .footer-scroll-top {
          will-change: transform, opacity;
        }

        .footer-scroll-top::before {
          content: "";
          position: absolute;
          inset: -5px;
          z-index: -1;
          border-radius: 22px;
          border: 1px solid rgba(210, 173, 112, 0.14);
          animation: footer-scroll-pulse 2.6s ease-out infinite;
        }

        @keyframes footer-top-line-move {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes footer-orb-one {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          100% {
            transform: translate3d(-70px, 50px, 0) scale(1.12);
          }
        }

        @keyframes footer-orb-two {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          100% {
            transform: translate3d(65px, -45px, 0) scale(1.1);
          }
        }

        @keyframes footer-orb-three {
          0% {
            transform: translate3d(0, 0, 0) scale(0.95);
          }

          100% {
            transform: translate3d(45px, 70px, 0) scale(1.15);
          }
        }

        @keyframes footer-floating-one {
          0%,
          100% {
            transform: translateY(0) rotate(45deg);
          }

          50% {
            transform: translateY(-18px) rotate(95deg);
          }
        }

        @keyframes footer-floating-two {
          0%,
          100% {
            transform: translateY(0) rotate(12deg);
          }

          50% {
            transform: translateY(22px) rotate(-28deg);
          }
        }

        @keyframes footer-floating-three {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }

          50% {
            transform: translateY(-14px) scale(1.35);
            opacity: 1;
          }
        }

        @keyframes footer-ring-one {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes footer-ring-two {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes footer-badge-glow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(210, 173, 112, 0);
          }

          50% {
            box-shadow: 0 0 35px rgba(210, 173, 112, 0.12);
          }
        }

        @keyframes footer-title-line {
          0%,
          100% {
            transform: scaleX(0.3);
            opacity: 0.35;
          }

          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes footer-button-shine {
          from {
            transform: translateX(0) skewX(-12deg);
          }

          to {
            transform: translateX(550%) skewX(-12deg);
          }
        }

        @keyframes footer-route-float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }

          50% {
            transform: translateY(-7px) rotate(-4deg);
          }
        }

        @keyframes footer-process-line {
          0%,
          100% {
            opacity: 0.4;
            transform: scaleY(0.7);
          }

          50% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        @keyframes footer-heading-icon {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }

          50% {
            transform: translateY(-4px) rotate(-3deg);
          }
        }

        @keyframes footer-heading-line {
          0%,
          100% {
            width: 42%;
            opacity: 0.55;
          }

          50% {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes footer-logo-rotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes footer-small-badge {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes footer-chat-icon {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }

          50% {
            transform: translateY(-5px) rotate(4deg);
          }
        }

        @keyframes footer-idea-icon {
          0%,
          100% {
            filter: drop-shadow(0 0 0 rgba(210, 173, 112, 0));
            transform: rotate(0);
          }

          50% {
            filter: drop-shadow(0 0 12px rgba(210, 173, 112, 0.35));
            transform: rotate(-5deg);
          }
        }

        @keyframes footer-heart {
          0%,
          100% {
            transform: scale(1);
          }

          15% {
            transform: scale(1.18);
          }

          30% {
            transform: scale(1);
          }

          45% {
            transform: scale(1.12);
          }

          60% {
            transform: scale(1);
          }
        }

        @keyframes footer-scroll-pulse {
          0% {
            opacity: 0.65;
            transform: scale(0.85);
          }

          100% {
            opacity: 0;
            transform: scale(1.35);
          }
        }

        @media (max-width: 639px) {
          .footer-pointer-light {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-root *,
          .footer-root *::before,
          .footer-root *::after,
          .footer-scroll-top,
          .footer-scroll-top::before {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }

          .footer-reveal {
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }

        }
      `}</style>
    </>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />
      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
      <path d="m19 16-.5 1.3a2 2 0 0 1-1.2 1.2L16 19l1.3.5a2 2 0 0 1 1.2 1.2L19 22l.5-1.3a2 2 0 0 1 1.2-1.2L22 19l-1.3-.5a2 2 0 0 1-1.2-1.2L19 16Z" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowUpIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ShoppingBagIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function PrintIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 8V3h10v5" />
      <path d="M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
      <path d="M18 11h.01" />
    </svg>
  );
}

function HeadsetIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M18 19h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2v7h1Z" />
      <path d="M6 19H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2v7H6Z" />
      <path d="M18 19c0 1.1-.9 2-2 2h-3" />
    </svg>
  );
}

function PackageIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" />
      <path d="m8 5.2 8 4.5" />
    </svg>
  );
}

function MessageIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function HeartIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function LightbulbIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 14.5A7 7 0 1 1 15.5 14.5C14.5 15.3 14 16 14 18h-4c0-2-.5-2.7-1.5-3.5Z" />
    </svg>
  );
}

function GiftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 9h18v4H3z" />
      <path d="M5 13h14v8H5z" />
      <path d="M12 9v12" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9Z" />
      <path d="M12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </svg>
  );
}

function FaceIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10h.01M15.5 10h.01" />
      <path d="M8 15c1.2 1.3 2.5 2 4 2s2.8-.7 4-2" />
    </svg>
  );
}

function CompassIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function GalleryIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-5-5L5 20" />
    </svg>
  );
}

function InfoIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function PhoneIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function SettingsIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}
