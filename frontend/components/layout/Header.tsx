"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SVGProps,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = ComponentType<IconProps>;

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: IconComponent;
  featured?: boolean;
};

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

const navItems: readonly NavItem[] = [
  {
    href: "/",
    label: "خانه",
    description: "صفحه اصلی چاپی چاپ",
    icon: HomeIcon,
  },
  {
    href: "/products",
    label: "فروشگاه",
    description: "محصولات چاپی و هدیه",
    icon: StoreIcon,
  },
  {
    href: "/portfolio",
    label: "نمونه‌کارها",
    description: "پروژه‌های اجراشده",
    icon: GalleryIcon,
  },
  {
    href: "/design-request",
    label: "طراحی اختصاصی",
    description: "ایده خودت را ثبت کن",
    icon: PaletteIcon,
    featured: true,
  },
  {
    href: "/about",
    label: "درباره ما",
    description: "داستان چاپی چاپ",
    icon: InfoIcon,
  },
  {
    href: "/contact",
    label: "تماس با ما",
    description: "مشاوره و پشتیبانی",
    icon: PhoneIcon,
  },
] as const;

const accountLinks = [
  {
    href: "/account",
    label: "داشبورد حساب",
    description: "نمای کلی حساب کاربری",
    icon: UserIcon,
  },
  {
    href: "/account/orders",
    label: "سفارش‌های من",
    description: "پیگیری وضعیت سفارش‌ها",
    icon: PackageIcon,
  },
  {
    href: "/account/design-requests",
    label: "درخواست‌های طراحی",
    description: "مدیریت طرح‌های اختصاصی",
    icon: PaletteIcon,
  },
  {
    href: "/account/notifications",
    label: "اعلان‌ها",
    description: "خبرها و تغییر وضعیت‌ها",
    icon: BellIcon,
  },
] as const;

const announcementItems = [
  {
    label: "طراحی اختصاصی",
    description: "از ایده تا فایل آماده چاپ",
    icon: PaletteIcon,
  },
  {
    label: "چاپ باکیفیت",
    description: "کنترل رنگ و جزئیات",
    icon: PrintIcon,
  },
  {
    label: "پشتیبانی سفارش",
    description: "همراهی تا تحویل محصول",
    icon: HeadsetIcon,
  },
] as const;

const mobileFeatureItems = [
  {
    title: "ساخت یک هدیه خاص",
    description: "عکس و ایده‌ات را برای ما بفرست",
    icon: SparklesIcon,
  },
  {
    title: "بررسی قبل از چاپ",
    description: "جزئیات فایل پیش از اجرا کنترل می‌شود",
    icon: SearchIcon,
  },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getUserLabel(user?: {
  first_name?: string | null;
  username?: string | null;
} | null) {
  return user?.first_name?.trim() || user?.username?.trim() || "حساب کاربری";
}

function getUserInitial(label: string) {
  return label.trim().charAt(0) || "ک";
}

function Spotlight({ children, className = "" }: SpotlightProps) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = spotlightRef.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    element.style.setProperty(
      "--header-pointer-x",
      `${event.clientX - bounds.left}px`,
    );
    element.style.setProperty(
      "--header-pointer-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  const handlePointerLeave = () => {
    const element = spotlightRef.current;
    if (!element) return;

    element.style.setProperty("--header-pointer-x", "50%");
    element.style.setProperty("--header-pointer-y", "50%");
  };

  return (
    <div
      ref={spotlightRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`header-spotlight ${className}`}
    >
      {children}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { totalItems } = useCart();

  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  const isCartActive = pathname === "/cart";
  const isLoginActive = pathname === "/login";
  const isAccountActive =
    pathname === "/account" || pathname.startsWith("/account/");

  const shouldShowCartCount = hasMounted && totalItems > 0;
  const userLabel = useMemo(() => getUserLabel(user), [user]);
  const userInitial = useMemo(() => getUserInitial(userLabel), [userLabel]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setHasMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      setIsScrolled(scrollTop > 14);
      setScrollProgress(
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
          : 0,
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAnnouncementIndex(
        (current) => (current + 1) % announcementItems.length,
      );
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsAccountMenuOpen(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };

    mediaQuery.addEventListener("change", handleDesktopChange);
    return () => mediaQuery.removeEventListener("change", handleDesktopChange);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    const timeout = window.setTimeout(() => firstFocusable?.focus(), 180);
    return () => window.clearTimeout(timeout);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const currentAnnouncement = announcementItems[announcementIndex];
  const CurrentAnnouncementIcon = currentAnnouncement.icon;

  const progressStyle = {
    transform: `scaleX(${scrollProgress / 100})`,
  } as CSSProperties;

  return (
    <>
      <header
        className={cn(
          "header-root sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out",
          isScrolled
            ? "border-[#d8cdbf]/90 bg-[#fbfaf6]/94 shadow-[0_24px_70px_-38px_rgba(35,31,27,0.62)] backdrop-blur-2xl"
            : "border-[#e7dfd3] bg-[#fbfaf6]/90 shadow-[0_12px_35px_-32px_rgba(35,31,27,0.35)] backdrop-blur-xl",
        )}
      >
        {/* نوار اطلاع‌رسانی */}
        <div className="header-announcement relative overflow-hidden border-b border-white/10 bg-[#211e1b] text-[#f8f2e9]">
          <div className="pointer-events-none absolute inset-0">
            <div className="header-announcement-orb absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#d2ad70]/20 blur-[70px]" />
            <div className="absolute -left-24 bottom-[-90px] h-52 w-52 rounded-full bg-white/[0.07] blur-[70px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,173,112,0.08),transparent_55%)]" />
            <div className="header-announcement-grid absolute inset-0 opacity-[0.045]" />
          </div>

          <div className="relative mx-auto flex min-h-[54px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
            <div className="min-w-0 flex-1 lg:hidden">
              <div
                key={announcementIndex}
                className="header-announcement-swap flex items-center justify-center gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#d2ad70]/25 bg-[#d2ad70]/10 text-[#e6be7b]">
                  <CurrentAnnouncementIcon className="h-5 w-5" />
                </span>

                <span className="min-w-0 text-center">
                  <span className="block truncate text-[16px] font-black">
                    {currentAnnouncement.label}
                  </span>
                  <span className="hidden truncate text-[13px] font-bold text-[#bfb3a6] sm:block">
                    {currentAnnouncement.description}
                  </span>
                </span>
              </div>
            </div>

            <div className="hidden items-center gap-7 lg:flex">
              <Link
                href="/design-request"
                className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#d2ad70]/70"
              >
                <span className="header-sparkle-icon flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#d2ad70] text-[#292521] shadow-[0_12px_26px_-16px_rgba(210,173,112,0.9)]">
                  <SparklesIcon className="h-5 w-5" />
                </span>

                <span>
                  <span className="block text-[17px] font-black">
                    ایده‌ات را به یک محصول خاص تبدیل کن
                  </span>
                  <span className="mt-0.5 block text-[13px] font-bold text-[#bdb1a4]">
                    طراحی، چاپ و آماده‌سازی هدیه اختصاصی
                  </span>
                </span>

                <ArrowLeftIcon className="h-5 w-5 text-[#d2ad70] transition-transform duration-500 group-hover:-translate-x-1" />
              </Link>
            </div>

            <div className="hidden items-center gap-2 xl:flex">
              {announcementItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="group flex min-h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3.5 text-[14px] font-black text-[#d6cbc0] transition-all duration-400 hover:-translate-y-0.5 hover:border-[#d2ad70]/30 hover:bg-white/[0.07] hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px] text-[#dfb66f] transition-transform duration-400 group-hover:rotate-[-5deg] group-hover:scale-110" />
                    <span>{item.label}</span>

                    {index < announcementItems.length - 1 && (
                      <span className="mr-1 h-1 w-1 rounded-full bg-white/20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* بدنه اصلی هدر */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-36 -top-48 h-80 w-80 rounded-full bg-[#d2ad70]/[0.055] blur-[85px]" />
            <div className="absolute left-[35%] top-[-170px] h-72 w-72 rounded-full bg-white/60 blur-[80px]" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#c99a52]/75 to-transparent" />

          <div
            className={cn(
              "relative mx-auto flex max-w-[1600px] items-center gap-5 px-4 transition-[height,padding] duration-500 ease-out sm:px-6 xl:px-8",
              isScrolled ? "h-[112px]" : "h-[132px]",
            )}
          >
            {/* برند */}
            <Link
              href="/"
              className="group flex min-w-0 shrink-0 items-center gap-4 rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-[#c99a52]/60"
              aria-label="صفحه اصلی چاپی چاپ"
            >
              <span
                className={cn(
                  "header-logo-shell relative flex shrink-0 items-center justify-center rounded-[25px] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-[-2deg]",
                  isScrolled ? "h-[88px] w-[88px]" : "h-[108px] w-[108px]",
                )}
              >
                <span className="header-logo-ring pointer-events-none absolute -inset-1.5 rounded-[29px] bg-[conic-gradient(from_0deg,transparent,rgba(201,154,82,0.7),transparent_32%,transparent_70%,rgba(201,154,82,0.35),transparent)] opacity-55" />

                <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] border border-[#d6c29f] bg-white shadow-[0_20px_46px_-26px_rgba(43,36,28,0.78)] transition-all duration-500 group-hover:border-[#c99a52] group-hover:shadow-[0_24px_52px_-24px_rgba(153,105,38,0.62)]">
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-transparent to-[#ead5b4]/38" />
                  <span className="header-logo-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/65 blur-sm" />

                  <Image
                    src="/brand/logo.webp"
                    alt="لوگوی چاپی چاپ"
                    width={140}
                    height={140}
                    priority
                    className="relative h-full w-full object-contain p-0.5 transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </span>
              </span>

              <span className="hidden min-w-0 sm:block">
                <span className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={cn(
                      "block font-black tracking-tight text-[#292621] transition-[font-size] duration-500",
                      isScrolled ? "text-[30px]" : "text-[34px]",
                    )}
                  >
                    چاپی چاپ
                  </span>

                  <span className="header-studio-badge rounded-full border border-[#d7b77e]/60 bg-[#f7ead5] px-3.5 py-1.5 text-[15px] font-black text-[#956321] shadow-[0_10px_22px_-18px_rgba(149,99,33,0.75)]">
                    استودیو چاپ
                  </span>
                </span>

                <span
                  className={cn(
                    "mt-1.5 block font-bold tracking-[0.045em] text-[#8f7d68] transition-[font-size] duration-500",
                    isScrolled ? "text-[16px]" : "text-[18px]",
                  )}
                >
                  طراحی · چاپ · هدیه اختصاصی
                </span>
              </span>
            </Link>

            {/* منوی دسکتاپ */}
            <Spotlight className="mx-auto hidden xl:block">
              <nav
                className="header-nav-panel relative flex items-center gap-1.5 overflow-hidden rounded-[28px] border border-[#e3d9cc] bg-white/[0.74] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_22px_52px_-34px_rgba(42,35,29,0.78)] backdrop-blur-xl"
                aria-label="منوی اصلی"
              >
                <span className="header-pointer-light pointer-events-none absolute inset-0" />

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "header-nav-item group relative flex h-[70px] items-center gap-2.5 overflow-hidden rounded-[20px] px-4 text-[18px] font-black outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50 2xl:px-5 2xl:text-[19px]",
                        item.featured
                          ? "text-[#85551a] hover:bg-[#f6e8d1]"
                          : "text-[#6b645c] hover:bg-[#f5f0e8] hover:text-[#292621]",
                        isActive &&
                          (item.featured
                            ? "bg-[#f2dfc2] text-[#71440e] shadow-[inset_0_0_0_1px_rgba(201,154,82,0.48),0_14px_28px_-22px_rgba(130,78,18,0.48)]"
                            : "bg-[#eee8df] text-[#292621] shadow-[inset_0_0_0_1px_rgba(201,154,82,0.32)]"),
                      )}
                    >
                      <span
                        className={cn(
                          "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] transition-all duration-500 ease-out group-hover:rotate-[-5deg]",
                          isActive
                            ? "bg-[#c99a52] text-white shadow-[0_12px_24px_-16px_rgba(143,90,25,0.75)]"
                            : item.featured
                              ? "bg-[#ead4b1] text-[#754818]"
                              : "bg-[#f0ebe4] text-[#8b8074] group-hover:bg-white group-hover:text-[#9c6a2a]",
                        )}
                      >
                        <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0" />
                        <Icon className="relative h-5 w-5" />
                      </span>

                      <span className="relative z-10 whitespace-nowrap">
                        {item.label}
                      </span>

                      {item.featured && !isActive && (
                        <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#c99a52] shadow-[0_0_0_4px_rgba(201,154,82,0.12)]" />
                      )}

                      {isActive && (
                        <span className="header-active-line absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-gradient-to-l from-transparent via-[#c99a52] to-transparent" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </Spotlight>

            {/* اکشن‌های دسکتاپ */}
            <div className="mr-auto hidden shrink-0 items-center gap-3 xl:flex xl:mr-0">
              <Link
                href="/cart"
                className={cn(
                  "header-action-button group relative inline-flex h-[70px] items-center gap-3 overflow-hidden rounded-[22px] border px-4 text-[18px] font-black outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50 2xl:px-5",
                  isCartActive
                    ? "border-[#c99a52]/65 bg-[#f3e2c8] text-[#67400f] shadow-[0_18px_35px_-26px_rgba(126,77,20,0.55)]"
                    : "border-[#dfd5c8] bg-white/[0.84] text-[#58524b] shadow-[0_16px_36px_-28px_rgba(42,35,29,0.82)] hover:-translate-y-1 hover:border-[#c99a52]/60 hover:bg-white hover:text-[#292621]",
                )}
                aria-label={
                  shouldShowCartCount
                    ? `سبد خرید، ${totalItems.toLocaleString("fa-IR")} کالا`
                    : "سبد خرید"
                }
              >
                <span className="header-action-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/45 blur-sm" />

                <span className="relative flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f2ece4] transition-all duration-500 group-hover:rotate-[-5deg] group-hover:bg-[#f0dfc5]">
                  <ShoppingBagIcon className="h-6 w-6" />

                  {shouldShowCartCount && (
                    <span className="header-cart-count absolute -left-2.5 -top-2.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-[#b87725] px-1.5 text-[12px] font-black leading-none text-white shadow-[0_8px_18px_-10px_rgba(132,76,14,0.85)]">
                      {totalItems > 99
                        ? "+۹۹"
                        : totalItems.toLocaleString("fa-IR")}
                    </span>
                  )}
                </span>

                <span className="hidden 2xl:inline">سبد خرید</span>
              </Link>

              {isLoading ? (
                <div className="h-[70px] w-44 animate-pulse rounded-[22px] border border-[#e2d9cc] bg-[#eee8df]" />
              ) : isAuthenticated ? (
                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((value) => !value)}
                    className={cn(
                      "header-account-trigger group relative inline-flex h-[70px] items-center gap-3 overflow-hidden rounded-[22px] border bg-white/[0.84] px-3 pl-4 text-right outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50",
                      isAccountActive || isAccountMenuOpen
                        ? "border-[#c99a52]/65 bg-[#f6ead8] shadow-[0_18px_36px_-26px_rgba(126,77,20,0.45)]"
                        : "border-[#dfd5c8] shadow-[0_16px_36px_-28px_rgba(42,35,29,0.82)] hover:-translate-y-1 hover:border-[#c99a52]/60 hover:bg-white",
                    )}
                    aria-haspopup="menu"
                    aria-expanded={isAccountMenuOpen}
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#d2ad70]/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#2d2925] via-[#40372f] to-[#665440] text-[20px] font-black text-white shadow-[0_12px_24px_-14px_rgba(35,31,27,0.9)] transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105">
                      {userInitial}
                    </span>

                    <span className="relative hidden max-w-36 2xl:block">
                      <span className="block truncate text-[17px] font-black text-[#302c27]">
                        {userLabel}
                      </span>
                      <span className="mt-1 block text-[13px] font-bold text-[#8f806e]">
                        مدیریت حساب
                      </span>
                    </span>

                    <ChevronDownIcon
                      className={cn(
                        "relative h-5 w-5 text-[#81766b] transition-transform duration-500",
                        isAccountMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "header-account-menu absolute left-0 top-[calc(100%+16px)] w-[370px] origin-top-left overflow-hidden rounded-[30px] border border-[#dbcfbf] bg-[#fffdf9]/98 p-3.5 shadow-[0_34px_85px_-34px_rgba(37,31,25,0.62)] backdrop-blur-2xl transition-all duration-500 ease-out",
                      isAccountMenuOpen
                        ? "visible translate-y-0 scale-100 opacity-100"
                        : "invisible -translate-y-3 scale-[0.97] opacity-0",
                    )}
                    role="menu"
                  >
                    <div className="relative mb-3 overflow-hidden rounded-[23px] bg-gradient-to-l from-[#26221f] via-[#332c26] to-[#493b30] p-5 text-white">
                      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d2ad70]/20 blur-3xl" />
                      <div className="pointer-events-none absolute -left-12 bottom-[-60px] h-28 w-28 rounded-full bg-white/[0.08] blur-3xl" />

                      <div className="relative flex items-center gap-4">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/15 bg-white/10 text-[24px] font-black shadow-[0_15px_30px_-22px_rgba(0,0,0,0.9)]">
                          {userInitial}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[20px] font-black">
                            {userLabel}
                          </p>
                          <p className="mt-1.5 text-[14px] font-bold text-[#d4c7b9]">
                            مدیریت سفارش‌ها و درخواست‌ها
                          </p>
                        </div>

                        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#d2ad70]/25 bg-[#d2ad70]/10 text-[#e3ba76]">
                          <UserIcon className="h-5 w-5" />
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      {accountLinks.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = isNavActive(pathname, item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            tabIndex={isAccountMenuOpen ? 0 : -1}
                            style={
                              {
                                "--header-account-delay": `${index * 45}ms`,
                              } as CSSProperties
                            }
                            className={cn(
                              "header-account-link group flex min-h-[66px] items-center gap-3.5 rounded-[18px] border border-transparent px-4 py-2.5 outline-none transition-all duration-400 focus-visible:ring-2 focus-visible:ring-[#c99a52]/50",
                              isAccountMenuOpen &&
                                "header-account-link--visible",
                              isActive
                                ? "border-[#dbc39a] bg-[#f1e3ce] text-[#704613]"
                                : "text-[#5d574f] hover:border-[#e5dacb] hover:bg-[#f5f0e9] hover:text-[#2c2824]",
                            )}
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-[#8f806e] shadow-[0_10px_22px_-18px_rgba(41,35,29,0.75)] transition-all duration-400 group-hover:rotate-[-4deg] group-hover:bg-[#d2ad70] group-hover:text-[#292521]">
                              <Icon className="h-[22px] w-[22px]" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-[17px] font-black leading-7">
                                {item.label}
                              </span>
                              <span className="mt-0.5 block text-[13px] font-bold leading-6 text-[#998c7e]">
                                {item.description}
                              </span>
                            </span>

                            <ArrowLeftIcon className="h-5 w-5 text-[#a29587] transition-transform duration-400 group-hover:-translate-x-1 group-hover:text-[#9c6a2a]" />
                          </Link>
                        );
                      })}
                    </div>

                    <div className="my-3 h-px bg-gradient-to-l from-transparent via-[#e4dacd] to-transparent" />

                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      tabIndex={isAccountMenuOpen ? 0 : -1}
                      className="group flex min-h-[62px] w-full items-center gap-3.5 rounded-[18px] border border-transparent px-4 text-[17px] font-black text-[#98483f] outline-none transition-all duration-400 hover:border-[#efd5cf] hover:bg-[#faece9] focus-visible:ring-2 focus-visible:ring-[#c56b5e]/40"
                      role="menuitem"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#faece9] transition-all duration-400 group-hover:rotate-[-4deg] group-hover:bg-[#f2d8d2]">
                        <LogoutIcon className="h-5 w-5" />
                      </span>

                      <span>خروج از حساب</span>

                      <ArrowLeftIcon className="mr-auto h-5 w-5 text-[#c58880] transition-transform duration-400 group-hover:-translate-x-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "header-login-button group relative inline-flex h-[70px] items-center gap-3 overflow-hidden rounded-[22px] border px-5 text-[18px] font-black outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50",
                    isLoginActive
                      ? "border-[#c99a52] bg-[#f2dfc2] text-[#704511] shadow-[0_18px_36px_-25px_rgba(126,77,20,0.5)]"
                      : "border-[#292521] bg-[#292521] text-white shadow-[0_20px_42px_-24px_rgba(34,30,26,0.95)] hover:-translate-y-1 hover:border-[#433a32] hover:bg-[#39322c]",
                  )}
                >
                  <span className="header-login-light pointer-events-none absolute inset-0" />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.08] transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-105">
                    <UserIcon className="h-6 w-6" />
                  </span>
                  <span className="relative">ورود / ثبت‌نام</span>
                  <ArrowLeftIcon className="relative h-5 w-5 transition-transform duration-500 group-hover:-translate-x-1.5" />
                </Link>
              )}
            </div>

            {/* اکشن‌های موبایل */}
            <div className="mr-auto flex items-center gap-3 xl:hidden">
              <Link
                href="/cart"
                className={cn(
                  "header-mobile-action group relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[20px] border outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50",
                  isCartActive
                    ? "border-[#c99a52] bg-[#f2dfc2] text-[#754917] shadow-[0_16px_30px_-22px_rgba(126,77,20,0.55)]"
                    : "border-[#ddd2c4] bg-white/[0.86] text-[#39342e] shadow-[0_14px_28px_-24px_rgba(40,34,28,0.75)] hover:-translate-y-1 hover:border-[#c99a52] hover:bg-[#f6ecdc]",
                )}
                aria-label="سبد خرید"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                <ShoppingBagIcon className="relative h-6 w-6 transition-transform duration-500 group-hover:rotate-[-5deg]" />

                {shouldShowCartCount && (
                  <span className="header-cart-count absolute -left-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#fbfaf6] bg-[#b97927] px-1 text-[10px] font-black text-white shadow-sm">
                    {totalItems > 99
                      ? "+۹۹"
                      : totalItems.toLocaleString("fa-IR")}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="header-mobile-action group relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[20px] border border-[#ddd2c4] bg-white/[0.86] text-[#39342e] shadow-[0_14px_28px_-24px_rgba(40,34,28,0.75)] outline-none transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#c99a52] hover:bg-[#f6ecdc] focus-visible:ring-2 focus-visible:ring-[#c99a52]/50"
                aria-label="باز کردن منوی سایت"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                <MenuIcon className="relative h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        {/* خط پیشرفت اسکرول */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-transparent">
          <span
            style={progressStyle}
            className="header-scroll-progress block h-full origin-right bg-gradient-to-l from-[#7f5420] via-[#d2ad70] to-[#f0cf92] shadow-[0_0_14px_rgba(210,173,112,0.75)]"
          />
        </div>
      </header>

      {/* منوی موبایل */}
      <div
        className={cn(
          "fixed inset-0 z-[80] xl:hidden",
          isMobileMenuOpen
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none",
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "absolute inset-0 bg-[#171411]/65 backdrop-blur-md transition-opacity duration-500 ease-out",
            isMobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="بستن منو"
          tabIndex={isMobileMenuOpen ? 0 : -1}
        />

        <aside
          ref={mobileMenuRef}
          id="mobile-navigation"
          className={cn(
            "header-mobile-drawer absolute right-0 top-0 flex h-dvh w-[min(94vw,500px)] flex-col overflow-hidden border-l border-white/10 bg-[#fbfaf6] shadow-[-30px_0_90px_-38px_rgba(20,17,14,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="منوی موبایل"
        >
          {/* هدر منوی موبایل */}
          <div className="relative overflow-hidden bg-[#211e1b] p-6 text-white sm:p-7">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#d2ad70]/25 blur-[70px]" />
              <div className="absolute -left-20 bottom-[-100px] h-52 w-52 rounded-full bg-white/[0.08] blur-[70px]" />
              <div className="header-mobile-grid absolute inset-0 opacity-[0.055]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#e3ba75]/80 to-transparent" />
            </div>

            <div className="relative flex items-center justify-between gap-4">
              <Link
                href="/"
                className="group flex min-w-0 items-center gap-4 rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#d7ac68]"
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                <span className="header-mobile-logo relative flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-[23px]">
                  <span className="absolute -inset-1 rounded-[27px] bg-[conic-gradient(from_0deg,transparent,rgba(210,173,112,0.7),transparent_38%)] opacity-60" />
                  <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] border border-white/15 bg-white shadow-[0_18px_38px_-22px_rgba(0,0,0,0.9)]">
                    <Image
                      src="/brand/logo.webp"
                      alt="لوگوی چاپی چاپ"
                      width={110}
                      height={110}
                      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  </span>
                </span>

                <span className="min-w-0">
                  <span className="block text-[27px] font-black tracking-tight">
                    چاپی چاپ
                  </span>
                  <span className="mt-1.5 block truncate text-[15px] font-bold text-[#d8cbbb] sm:text-[16px]">
                    استودیو طراحی و چاپ اختصاصی
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] border border-white/15 bg-white/[0.08] text-white outline-none transition-all duration-500 hover:rotate-90 hover:border-[#d2ad70]/40 hover:bg-white/[0.14] focus-visible:ring-2 focus-visible:ring-[#d7ac68]"
                aria-label="بستن منو"
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                <CloseIcon className="h-7 w-7" />
              </button>
            </div>

            <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
              {mobileFeatureItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    style={
                      {
                        "--header-mobile-delay": `${180 + index * 90}ms`,
                      } as CSSProperties
                    }
                    className={cn(
                      "header-mobile-feature flex items-start gap-3 rounded-[21px] border border-white/10 bg-white/[0.065] p-4",
                      isMobileMenuOpen && "header-mobile-feature--visible",
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#d2ad70] text-[#292521] shadow-[0_14px_26px_-18px_rgba(210,173,112,0.85)]">
                      <Icon className="h-6 w-6" />
                    </span>

                    <span>
                      <span className="block text-[17px] font-black leading-7">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[13px] font-bold leading-6 text-[#cfc2b4] sm:text-[14px]">
                        {item.description}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* بدنه منوی موبایل */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 sm:py-6">
            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <p className="text-[14px] font-black text-[#a1702f]">
                  منوی اصلی سایت
                </p>
                <h2 className="mt-1 text-[22px] font-black text-[#302c27]">
                  کجا می‌خواهی بروی؟
                </h2>
              </div>

              <span className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#dfd4c6] bg-white text-[#9b6a2c] shadow-[0_12px_26px_-22px_rgba(41,35,29,0.75)]">
                <CompassIcon className="h-6 w-6" />
              </span>
            </div>

            <nav className="grid gap-2" aria-label="منوی اصلی موبایل">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isNavActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                    style={
                      {
                        "--header-mobile-delay": `${220 + index * 55}ms`,
                      } as CSSProperties
                    }
                    className={cn(
                      "header-mobile-nav-link group relative flex min-h-[82px] items-center justify-between overflow-hidden rounded-[23px] border px-4 py-3.5 outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50",
                      isMobileMenuOpen && "header-mobile-nav-link--visible",
                      isActive
                        ? "border-[#d2ad70] bg-[#f1e0c6] text-[#68400f] shadow-[0_18px_38px_-28px_rgba(126,78,21,0.55)]"
                        : item.featured
                          ? "border-[#e1c89e] bg-[#fbf0df] text-[#805117] hover:-translate-x-1 hover:border-[#c99a52]"
                          : "border-[#ece4da] bg-white text-[#575149] shadow-[0_12px_30px_-28px_rgba(40,34,28,0.8)] hover:-translate-x-1 hover:border-[#dfd1be] hover:bg-[#f6f1ea] hover:text-[#2d2925]",
                    )}
                  >
                    <span className="pointer-events-none absolute inset-y-3 right-0 w-1 scale-y-0 rounded-full bg-[#c99a52] transition-transform duration-500 group-hover:scale-y-100" />

                    <span className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={cn(
                          "relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] transition-all duration-500 group-hover:rotate-[-5deg]",
                          isActive
                            ? "bg-[#c99a52] text-white shadow-[0_14px_28px_-18px_rgba(126,78,21,0.72)]"
                            : item.featured
                              ? "bg-[#e8cfaa] text-[#754818]"
                              : "bg-[#f1ece5] text-[#897d70] group-hover:bg-white group-hover:text-[#9b6929]",
                        )}
                      >
                        <Icon className="relative h-6 w-6" />
                      </span>

                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-[19px] font-black leading-8">
                            {item.label}
                          </span>

                          {item.featured && (
                            <span className="rounded-full border border-[#d3ac6c]/35 bg-[#ead5b3] px-2.5 py-1 text-[12px] font-black text-[#774914]">
                              ویژه
                            </span>
                          )}
                        </span>

                        <span className="mt-0.5 block truncate text-[14px] font-bold leading-7 text-[#93877a]">
                          {item.description}
                        </span>
                      </span>
                    </span>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-black/[0.05] bg-white/65 text-[#9a8e81] transition-all duration-500 group-hover:-translate-x-1 group-hover:border-[#d2ad70]/35 group-hover:text-[#9b6929]">
                      <ArrowLeftIcon className="h-5 w-5" />
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="my-5 h-px bg-gradient-to-l from-transparent via-[#ddd2c4] to-transparent" />

            {/* کارت سبد خرید */}
            <Link
              href="/cart"
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className={cn(
                "header-mobile-cart group relative flex min-h-[92px] items-center justify-between overflow-hidden rounded-[25px] border p-4 outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#c99a52]/50",
                isCartActive
                  ? "border-[#c99a52] bg-[#f1dfc4]"
                  : "border-[#dfd4c6] bg-white shadow-[0_18px_42px_-32px_rgba(40,34,28,0.88)] hover:-translate-y-1 hover:border-[#c99a52]/60",
              )}
            >
              <span className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full bg-[#d2ad70]/0 blur-3xl transition-colors duration-500 group-hover:bg-[#d2ad70]/12" />

              <span className="relative flex items-center gap-4">
                <span className="relative flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-[#292521] text-white shadow-[0_16px_32px_-20px_rgba(37,32,27,0.9)] transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-105">
                  <ShoppingBagIcon className="h-7 w-7" />

                  {shouldShowCartCount && (
                    <span className="header-cart-count absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#c0812f] px-1 text-[10px] font-black text-white">
                      {totalItems > 99
                        ? "+۹۹"
                        : totalItems.toLocaleString("fa-IR")}
                    </span>
                  )}
                </span>

                <span>
                  <span className="block text-[20px] font-black text-[#302c27]">
                    سبد خرید
                  </span>
                  <span className="mt-1 block text-[14px] font-bold leading-7 text-[#8f8376]">
                    {shouldShowCartCount
                      ? `${totalItems.toLocaleString("fa-IR")} کالا در سبد شما`
                      : "سبد خرید شما هنوز خالی است"}
                  </span>
                </span>
              </span>

              <span className="relative flex h-11 w-11 items-center justify-center rounded-[15px] border border-[#dfd4c6] bg-[#f7f2ea] text-[#8f8376] transition-all duration-500 group-hover:-translate-x-1 group-hover:border-[#c99a52]/45 group-hover:text-[#9b6929]">
                <ArrowLeftIcon className="h-5 w-5" />
              </span>
            </Link>

            {/* حساب کاربری موبایل */}
            <div className="relative mt-4 overflow-hidden rounded-[27px] border border-[#dfd4c6] bg-white p-4 shadow-[0_18px_42px_-32px_rgba(40,34,28,0.88)]">
              <div className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full bg-[#d2ad70]/10 blur-3xl" />

              {isLoading ? (
                <div className="h-28 animate-pulse rounded-[19px] bg-[#eee8df]" />
              ) : isAuthenticated ? (
                <>
                  <div className="relative mb-4 flex items-center gap-4 rounded-[21px] bg-gradient-to-l from-[#f1ece5] to-[#f8f5f0] p-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#302b26] to-[#594a3b] text-[21px] font-black text-white shadow-[0_14px_28px_-18px_rgba(35,31,27,0.85)]">
                      {userInitial}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[20px] font-black text-[#302c27]">
                        {userLabel}
                      </p>
                      <p className="mt-1 text-[14px] font-bold text-[#8f8376]">
                        خوش آمدید؛ حساب شما آماده است
                      </p>
                    </div>

                    <UserIcon className="h-6 w-6 text-[#a1702f]" />
                  </div>

                  <div className="relative grid grid-cols-2 gap-3">
                    <Link
                      href="/account"
                      tabIndex={isMobileMenuOpen ? 0 : -1}
                      className="group flex min-h-[60px] items-center justify-center gap-2.5 rounded-[18px] bg-[#292521] px-3 text-[16px] font-black text-white shadow-[0_18px_34px_-22px_rgba(37,32,27,0.9)] outline-none transition-all duration-500 hover:-translate-y-1 hover:bg-[#3a332d] focus-visible:ring-2 focus-visible:ring-[#c99a52]/50"
                    >
                      <UserIcon className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[-5deg]" />
                      پنل کاربری
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      tabIndex={isMobileMenuOpen ? 0 : -1}
                      className="group flex min-h-[60px] items-center justify-center gap-2.5 rounded-[18px] border border-[#ead5cf] bg-[#fff4f1] px-3 text-[16px] font-black text-[#984b40] outline-none transition-all duration-500 hover:-translate-y-1 hover:border-[#deb9b0] hover:bg-[#fbe8e3] focus-visible:ring-2 focus-visible:ring-[#c56b5e]/40"
                    >
                      <LogoutIcon className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[-5deg]" />
                      خروج
                    </button>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className="mb-4 flex items-start gap-3 rounded-[20px] bg-[#f3eee7] p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#d2ad70] text-[#292521]">
                      <UserIcon className="h-6 w-6" />
                    </span>

                    <div>
                      <p className="text-[19px] font-black text-[#302c27]">
                        حساب کاربری خودت را بساز
                      </p>
                      <p className="mt-1 text-[14px] font-bold leading-7 text-[#8f8376]">
                        سفارش‌ها و درخواست‌های طراحی را راحت‌تر مدیریت کن.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/login"
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                    className="header-login-button group relative flex min-h-[64px] items-center justify-between overflow-hidden rounded-[20px] bg-[#292521] px-5 text-[18px] font-black text-white shadow-[0_20px_38px_-24px_rgba(37,32,27,0.9)] outline-none transition-all duration-500 hover:-translate-y-1 hover:bg-[#3a332d] focus-visible:ring-2 focus-visible:ring-[#c99a52]/50"
                  >
                    <span className="header-login-light pointer-events-none absolute inset-0" />

                    <span className="relative flex items-center gap-3">
                      <UserIcon className="h-6 w-6" />
                      ورود یا ساخت حساب
                    </span>

                    <ArrowLeftIcon className="relative h-5 w-5 transition-transform duration-500 group-hover:-translate-x-1.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="relative border-t border-[#e4dacd] bg-white/80 px-5 py-4 text-center">
            <p className="text-[14px] font-black text-[#776b5f] sm:text-[15px]">
              چاپی چاپ؛ جایی برای ساختن هدیه‌های شخصی و ماندگار
            </p>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .header-root {
          isolation: isolate;
        }

        .header-announcement-grid,
        .header-mobile-grid {
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.26) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.26) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
        }

        .header-announcement-orb {
          animation: header-announcement-orb 8s ease-in-out infinite alternate;
        }

        .header-announcement-swap {
          animation: header-announcement-swap 600ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .header-sparkle-icon {
          animation: header-sparkle-float 4s ease-in-out infinite;
        }

        .header-spotlight {
          --header-pointer-x: 50%;
          --header-pointer-y: 50%;
        }

        .header-pointer-light {
          background: radial-gradient(
            250px circle at var(--header-pointer-x) var(--header-pointer-y),
            rgba(210, 173, 112, 0.16),
            transparent 68%
          );
          opacity: 0.8;
        }

        .header-logo-ring {
          animation: header-logo-ring 8s linear infinite;
        }

        .header-logo-shell:hover .header-logo-shine {
          animation: header-shine 900ms ease-out;
        }

        .header-studio-badge {
          animation: header-studio-badge 4.5s ease-in-out infinite;
        }

        .header-nav-item::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(255, 255, 255, 0.5),
            transparent 72%
          );
          transform: translateX(130%);
          transition: transform 850ms ease;
        }

        .header-nav-item:hover::after {
          transform: translateX(-130%);
        }

        .header-active-line {
          animation: header-active-line 3.3s ease-in-out infinite;
        }

        .header-action-button:hover .header-action-shine {
          animation: header-shine 850ms ease-out;
        }

        .header-cart-count {
          animation: header-cart-count 2.8s ease-in-out infinite;
          transform-origin: center;
        }

        .header-account-trigger::after,
        .header-login-button::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(255, 255, 255, 0.1),
            transparent 72%
          );
          transform: translateX(130%);
          transition: transform 900ms ease;
        }

        .header-account-trigger:hover::after,
        .header-login-button:hover::after {
          transform: translateX(-130%);
        }

        .header-account-menu::before {
          content: "";
          position: absolute;
          left: 38px;
          top: -8px;
          width: 16px;
          height: 16px;
          transform: rotate(45deg);
          border-top: 1px solid #dbcfbf;
          border-left: 1px solid #dbcfbf;
          background: rgba(255, 253, 249, 0.98);
        }

        .header-account-link {
          opacity: 0;
          transform: translateY(10px);
          transition-delay: var(--header-account-delay, 0ms);
        }

        .header-account-link--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .header-login-light {
          background: radial-gradient(
            170px circle at 20% 0%,
            rgba(210, 173, 112, 0.2),
            transparent 70%
          );
          transition: transform 600ms ease;
        }

        .header-login-button:hover .header-login-light {
          transform: translateX(12%);
        }

        .header-mobile-action::after {
          content: "";
          position: absolute;
          inset: -40%;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgba(201, 154, 82, 0.13),
            transparent 35%
          );
          animation: header-mobile-action-ring 7s linear infinite;
        }

        .header-mobile-action > * {
          z-index: 1;
        }

        .header-scroll-progress {
          transition: transform 120ms linear;
          will-change: transform;
        }

        .header-mobile-logo > span:first-child {
          animation: header-logo-ring 8s linear infinite;
        }

        .header-mobile-feature,
        .header-mobile-nav-link {
          opacity: 0;
          transform: translateX(24px);
          transition:
            opacity 650ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 500ms ease,
            background-color 500ms ease,
            box-shadow 500ms ease;
          transition-delay: var(--header-mobile-delay, 0ms);
        }

        .header-mobile-feature--visible,
        .header-mobile-nav-link--visible {
          opacity: 1;
          transform: translateX(0);
        }

        .header-mobile-cart::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(255, 255, 255, 0.55),
            transparent 72%
          );
          transform: translateX(130%);
          transition: transform 900ms ease;
        }

        .header-mobile-cart:hover::after {
          transform: translateX(-130%);
        }

        @keyframes header-announcement-orb {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }

          to {
            transform: translate3d(-45px, 24px, 0) scale(1.14);
          }
        }

        @keyframes header-announcement-swap {
          from {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes header-sparkle-float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }

          50% {
            transform: translateY(-4px) rotate(-6deg);
          }
        }

        @keyframes header-logo-ring {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes header-shine {
          from {
            transform: translateX(0) skewX(-12deg);
          }

          to {
            transform: translateX(600%) skewX(-12deg);
          }
        }

        @keyframes header-studio-badge {
          0%,
          100% {
            transform: translateY(0);
            box-shadow: 0 10px 22px -18px rgba(149, 99, 33, 0.75);
          }

          50% {
            transform: translateY(-2px);
            box-shadow: 0 14px 26px -18px rgba(149, 99, 33, 0.9);
          }
        }

        @keyframes header-active-line {
          0%,
          100% {
            opacity: 0.55;
            transform: scaleX(0.55);
          }

          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes header-cart-count {
          0%,
          100% {
            transform: scale(1);
          }

          15% {
            transform: scale(1.12);
          }

          30% {
            transform: scale(1);
          }
        }

        @keyframes header-mobile-action-ring {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 639px) {
          .header-root .header-announcement {
            min-height: 54px;
          }

          .header-pointer-light {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .header-root *,
          .header-root *::before,
          .header-root *::after,
          .header-mobile-drawer *,
          .header-mobile-drawer *::before,
          .header-mobile-drawer *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }

          .header-mobile-feature,
          .header-mobile-nav-link,
          .header-account-link {
            opacity: 1 !important;
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

function BellIcon(props: IconProps) {
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
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
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
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
      <path d="m6 9 6 6 6-6" />
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

function MenuIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 6 12 12M18 6 6 18" />
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

function StoreIcon(props: IconProps) {
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
      <path d="M3 9h18l-2-5H5L3 9Z" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
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

function SearchIcon(props: IconProps) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
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
