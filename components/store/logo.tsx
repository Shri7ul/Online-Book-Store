import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  imageUrl,
  className
}: {
  compact?: boolean;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Mini Book Cottage home"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          width={42}
          height={42}
          alt="Mini Book Cottage"
          className="size-10 rounded-xl object-contain"
        />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <BookOpen className="size-5" strokeWidth={1.8} />
        </span>
      )}
      {!compact && (
        <span className="leading-none">
          <span className="font-display block text-[20px] font-semibold">
            Mini Book
          </span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Cottage
          </span>
        </span>
      )}
    </Link>
  );
}
