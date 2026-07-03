import type { ReactNode, SVGProps } from "react";

export type AboutIconProps = SVGProps<SVGSVGElement>;

function BaseIcon({
  children,
  ...props
}: AboutIconProps & { children: ReactNode }) {
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

export function SparklesIcon(props: AboutIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />
      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
    </BaseIcon>
  );
}

export function PaletteIcon(props: AboutIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function GalleryIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-5L5 20" /></BaseIcon>;
}

export function SearchCheckIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M8 10.5l1.5 1.5L13 8.5" /></BaseIcon>;
}

export function HeadsetIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M18 19h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2v7h1ZM6 19H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2v7H6Z" /><path d="M18 19c0 1.1-.9 2-2 2h-3" /></BaseIcon>;
}

export function LightbulbIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M9 18h6M10 22h4" /><path d="M8.4 15.5A7 7 0 1 1 15.6 15.5C14.6 16.3 14 17 14 18h-4c0-1-.6-1.7-1.6-2.5Z" /></BaseIcon>;
}

export function PrintIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M7 8V3h10v5" /><path d="M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></BaseIcon>;
}

export function GiftIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M3 9h18v4H3zM5 13h14v8H5zM12 9v12" /><path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9ZM12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" /></BaseIcon>;
}

export function BuildingIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M4 21V5l8-3v19M12 8h8v13M2 21h20" /><path d="M7 7h2M7 11h2M7 15h2M15 12h2M15 16h2" /></BaseIcon>;
}

export function MessageIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 9h8M8 13h5" /></BaseIcon>;
}

export function EyeIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></BaseIcon>;
}

export function TargetIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></BaseIcon>;
}

export function HeartIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></BaseIcon>;
}

export function PackageIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" /></BaseIcon>;
}

export function CompassIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-5 2 2-5 5-2Z" /></BaseIcon>;
}

export function LayersIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></BaseIcon>;
}

export function ShieldCheckIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></BaseIcon>;
}

export function ArrowLeftIcon(props: AboutIconProps) {
  return <BaseIcon {...props}><path d="M19 12H5M11 18l-6-6 6-6" /></BaseIcon>;
}
