import Image from "next/image";

/**
 * The school logo, from project/assets (copied to web/public/teja_logo.jpeg).
 * The file has a black background. Screen blending drops the black, so only the white logo shows on the dark page.
 */
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <Image
      src="/teja_logo.jpeg"
      alt="Teja International High School"
      width={904}
      height={904}
      className={`shrink-0 object-contain ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
