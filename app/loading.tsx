import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-[520px] rounded-[28px]" />
      <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="mt-4 h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-2/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
