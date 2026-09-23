export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:22px_22px]"
      style={{
        maskImage:
          "radial-gradient(ellipse 90% 100% at 50% 35%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 100% at 50% 35%, black 55%, transparent 100%)",
      }}
    />
  );
}
