import Link from "next/link";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <BookX className="mx-auto size-12 text-accent" />
        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Page not found</p>
        <h1 className="font-display mt-3 text-5xl font-semibold">This page left the shelf.</h1>
        <Button asChild className="mt-7"><Link href="/">Return home</Link></Button>
      </div>
    </div>
  );
}
