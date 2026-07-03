"use client";

import Image from "next/image";
import Link from "next/link";

import { siteInfo } from "@/lib/site-info";

const CONTACT_HERO_IMAGE = "/contact/contact-hero.webp";

export default function ContactHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#E3DED5] bg-[#F2EEE6]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="contact-grid absolute inset-0 opacity-60" />
        <span className="contact-orb-one absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-[#D2AD70]/20 blur-[110px]" />
        <span className="contact-orb-two absolute -bottom-56 -left-32 h-[500px] w-[500px] rounded-full bg-white/75 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid min-h-[700px] max-w-[1760px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)] lg:items-center lg:px-12 lg:py-24">
        <div className="contact-enter-right max-w-5xl">
          <div className="inline-flex min-h-[56px] items-center gap-3 rounded-full border border-[#D8C39F] bg-white/75 px-6 text-[20px] font-black text-[#8A5B20] shadow-[0_16px_35px_-28px_rgba(91,63,27,0.45)] backdrop-blur-xl">
            <MessageIcon className="h-7 w-7" />
            تماس با چاپی چاپ
          </div>

          <h1 className="mt-7 max-w-5xl text-[42px] font-black leading-[1.55] text-[#2D2925] sm:text-[52px] lg:text-[62px] xl:text-[70px]">
            برای ساختن سفارش بعدی،
            <span className="relative mx-3 inline-block text-[#A87431]">
              با ما در ارتباط باش.
              <span className="absolute inset-x-0 bottom-2 -z-10 h-4 rounded-full bg-[#D2AD70]/18" />
            </span>
          </h1>

          <p className="mt-6 max-w-4xl text-[21px] font-medium leading-[2.05] text-[#6F6861] sm:text-[23px]">
            برای سفارش محصول، طراحی اختصاصی، پیگیری سفارش یا دریافت مشاوره
            می‌توانی از فرم تماس یا راه‌های ارتباط مستقیم استفاده کنی.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a
              href={`tel:${siteInfo.phone}`}
              className="contact-shine group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] bg-[#302C28] px-8 text-[20px] font-black text-white shadow-[0_24px_48px_-28px_rgba(48,44,40,0.75)] transition-all duration-500 hover:-translate-y-1 hover:bg-[#A87431]"
            >
              <PhoneIcon className="relative h-7 w-7" />
              <span className="relative">{siteInfo.phoneDisplay}</span>
            </a>

            <Link
              href="/design-request"
              className="inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] border border-[#D6C8B4] bg-white/80 px-8 text-[20px] font-black text-[#403A34] transition-all duration-500 hover:-translate-y-1 hover:border-[#C99A52] hover:bg-white hover:text-[#895A22]"
            >
              <PaletteIcon className="h-7 w-7 text-[#A87431]" />
              ثبت درخواست طراحی
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              ["پاسخ‌گویی مستقیم", "پیام شما بدون مسیرهای پیچیده بررسی می‌شود."],
              ["مشاوره قبل از سفارش", "برای انتخاب محصول و روش چاپ راهنمایی می‌شوی."],
              ["پیگیری شفاف", "برای سفارش ثبت‌شده مسیر پیگیری مشخص داری."],
            ].map(([title, description], index) => (
              <article
                key={title}
                className="contact-hover-card h-full rounded-[22px] border border-white/80 bg-white/65 p-4 shadow-[0_20px_45px_-36px_rgba(62,50,37,0.42)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D2AD70]/70 hover:bg-white"
                style={{ animationDelay: `${140 + index * 90}ms` }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#F3E8D7] text-[20px] font-black text-[#98672B]">
                  {(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
                </span>
                <h2 className="mt-4 text-[21px] font-black leading-8 text-[#302B27]">
                  {title}
                </h2>
                <p className="mt-2 text-[20px] font-medium leading-[1.8] text-[#7A726A]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="contact-enter-left contact-float relative mx-auto w-full max-w-[690px]">
          <div className="group relative overflow-hidden rounded-[38px] border border-white/80 bg-white/70 p-3 shadow-[0_45px_100px_-58px_rgba(42,35,28,0.9)] backdrop-blur-sm sm:p-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[30px]">
              {CONTACT_HERO_IMAGE ? (
                <Image
                  src={CONTACT_HERO_IMAGE}
                  alt="ارتباط با مشتریان و سفارش‌های چاپی چاپ"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,#EEE5D8,#FAF7F1)] p-8 text-center">
                  <div className="max-w-md">
                    <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-[#D2AD70]/45 bg-white/75 text-[#9A682B] shadow-[0_20px_45px_-30px_rgba(83,57,26,0.5)]">
                      <ImageIcon className="h-12 w-12" />
                    </span>
                    <p className="mt-6 text-[28px] font-black text-[#3E3730]">
                      جای تصویر اختصاصی تماس با ما
                    </p>
                    <p className="mt-3 text-[20px] font-medium leading-[1.9] text-[#7D746A]">
                      یک تصویر گرم از بسته‌بندی سفارش، میز طراحی یا ارتباط با
                      مشتری در این قاب قرار می‌گیرد.
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#211D19]/78 via-transparent to-white/10" />
              <span className="pointer-events-none absolute inset-4 rounded-[24px] border border-white/35" />


            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .contact-grid {
          background-image:
            linear-gradient(rgba(112, 82, 46, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(112, 82, 46, 0.07) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, black, transparent 96%);
        }

        .contact-orb-one {
          animation: contact-orb-one 15s ease-in-out infinite alternate;
        }

        .contact-orb-two {
          animation: contact-orb-two 18s ease-in-out infinite alternate;
        }

        .contact-enter-right {
          animation: contact-enter-right 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .contact-enter-left {
          animation: contact-enter-left 950ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .contact-hover-card {
          animation: contact-enter-up 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .contact-float {
          animation:
            contact-enter-left 950ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both,
            contact-float 6s 1.2s ease-in-out infinite;
        }

        .contact-shine {
          position: relative;
          overflow: hidden;
        }

        .contact-shine::after {
          content: "";
          position: absolute;
          inset-y: 0;
          left: -45%;
          width: 28%;
          transform: skewX(-18deg);
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.36), transparent);
        }

        .contact-shine:hover::after {
          animation: contact-button-shine 850ms ease-out;
        }

        @keyframes contact-enter-right {
          from {
            opacity: 0;
            filter: blur(6px);
            transform: translate3d(42px, 0, 0);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes contact-enter-left {
          from {
            opacity: 0;
            filter: blur(6px);
            transform: translate3d(-42px, 0, 0);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes contact-enter-up {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes contact-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes contact-orb-one {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(-60px, 48px, 0) scale(1.12);
          }
        }

        @keyframes contact-orb-two {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(56px, -42px, 0) scale(1.1);
          }
        }

        @keyframes contact-button-shine {
          from {
            transform: translateX(0) skewX(-18deg);
          }
          to {
            transform: translateX(620%) skewX(-18deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-orb-one,
          .contact-orb-two,
          .contact-enter-right,
          .contact-enter-left,
          .contact-hover-card,
          .contact-float {
            animation: none !important;
          }

          .contact-shine::after {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

function BaseIcon({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
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
      {children}
    </svg>
  );
}

function MessageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </BaseIcon>
  );
}

function PhoneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.4 1.7.6 2.6.7a2 2 0 0 1 2 2.3Z" />
    </BaseIcon>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

function ImageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4-4L5 21" />
    </BaseIcon>
  );
}
