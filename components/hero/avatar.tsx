import { avatarSrc } from "@/lib/avatar";
import { AvatarView } from "@/components/hero/avatar-view";

/** Server-only convenience wrapper: resolves the avatar file from disk. */
export function Avatar({ size = 56, className }: { size?: number; className?: string }) {
  return <AvatarView src={avatarSrc()} size={size} className={className} />;
}
