"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import type { Book } from "@/types/book";
import { cn } from "@/lib/utils";

function hashTone(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 6;
  }
  return hash + 1;
}

interface BookCoverProps {
  book: Book;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function BookCover({
  book,
  className,
  priority = false,
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw",
}: BookCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = book.coverImage;
  const showImage = Boolean(imageSrc && failedSrc !== imageSrc);

  if (imageSrc && showImage) {
    return (
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted",
          className,
        )}
      >
        <Image
          src={imageSrc}
          alt={`Cover of ${book.title}`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          onError={() => setFailedSrc(imageSrc)}
        />
      </div>
    );
  }

  const tone = book.coverTone ?? hashTone(book.id);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-md text-on-brand shadow-sm",
        `book-cover-tone-${tone}`,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-cover-overlay" />
      <div className="absolute inset-y-0 left-0 w-2 bg-book-spine" />
      <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full border border-on-brand/15" />
      <div className="pointer-events-none absolute top-10 -right-3 size-12 rounded-full border border-on-brand/15" />
      <div className="pointer-events-none absolute bottom-8 -left-6 size-16 rounded-full border border-on-brand/10" />

      <div className="flex h-full flex-col justify-between p-3 pl-5">
        <p className="text-[9px] font-medium tracking-[0.18em] uppercase opacity-75">
          {book.publisher ?? "BookHand"}
        </p>

        <div className="space-y-2">
          <p className="line-clamp-3 font-serif text-sm leading-snug font-semibold sm:text-base">
            {book.title}
          </p>
          <div className="h-px w-8 bg-on-brand/40" />
          <p className="line-clamp-2 text-[10px] leading-snug opacity-80">
            {book.author}
          </p>
        </div>

        <div className="flex items-center gap-1.5 opacity-70">
          <BookOpen className="size-3" aria-hidden="true" />
          <span className="text-[8px] font-medium tracking-[0.16em] uppercase">
            BookHand
          </span>
        </div>
      </div>
    </div>
  );
}
