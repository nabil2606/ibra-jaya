import Image from "next/image";

type LogoVariant = "main" | "dark";

type LogoProps = {
  /** "main" = putih+merah (untuk latar gelap), "dark" = hitam+merah (untuk latar terang) */
  variant?: LogoVariant;
  /** Tinggi logo dalam piksel (lebar otomatis proporsional) */
  height?: number;
  /** Tambahkan priority untuk above-the-fold (navbar) */
  priority?: boolean;
  className?: string;
};

const SRC: Record<LogoVariant, string> = {
  main: "/assets/brand/logo-main-v2.png",
  dark: "/assets/brand/logo-dark-v2.png",
};

// Aspect ratio logo ≈ 2.11:1 (1600x758 source)
const ASPECT = 1600 / 758;

export function Logo({ variant = "main", height = 44, priority = false, className }: LogoProps) {
  const w = Math.round(height * ASPECT);
  return (
    <Image
      src={SRC[variant]}
      alt="Ibra Jaya Trans"
      width={w}
      height={height}
      priority={priority}
      className={className}
      style={{ height: `${height}px`, width: "auto" }}
    />
  );
}
