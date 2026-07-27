"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookPreview } from "@/lib/types";

export function PreviewDialog({ previews }: { previews: BookPreview[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (!previews.length) return null;
  const preview = previews[index];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="mt-3 w-full sm:w-auto">
          <BookOpen className="size-4" /> Read sample
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-xl bg-background shadow-lift outline-none sm:inset-8 lg:inset-x-[12vw]"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="flex h-16 items-center justify-between border-b px-5">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">
                Book preview
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground">
                Sample page {index + 1} of {previews.length}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close preview">
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="relative flex-1 overflow-hidden bg-muted p-4">
            {preview.type === "pdf" ? (
              <iframe
                src={`/api/preview/${preview.id}#toolbar=0&navpanes=0`}
                className="size-full border-0"
                title="Book PDF preview"
              />
            ) : preview.url ? (
              <div className="relative size-full select-none">
                <Image
                  src={preview.url}
                  alt={`Preview page ${preview.page_number ?? index + 1}`}
                  fill
                  sizes="90vw"
                  className="pointer-events-none object-contain"
                />
              </div>
            ) : null}
            {previews.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-6 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setIndex((value) =>
                      value === 0 ? previews.length - 1 : value - 1
                    )
                  }
                  aria-label="Previous sample page"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setIndex((value) => (value + 1) % previews.length)
                  }
                  aria-label="Next sample page"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            )}
          </div>
          <p className="border-t px-5 py-3 text-center text-[11px] text-muted-foreground">
            Preview access is provided for evaluation only. Download controls
            are disabled.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
