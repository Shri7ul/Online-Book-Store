import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  return (
    <div className="container grid min-h-[55vh] place-items-center py-16 text-center">
      <div>
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-muted">
          <Heart className="size-8 text-muted-foreground" />
        </span>
        <h1 className="font-display mt-6 text-4xl font-semibold">Your wishlist.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to keep favourite books synced across devices.
        </p>
        <Button asChild className="mt-7"><Link href="/shop">Browse books</Link></Button>
      </div>
    </div>
  );
}
