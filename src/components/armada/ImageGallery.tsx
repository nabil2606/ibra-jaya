"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CarFront } from "lucide-react";

export function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-navy-50">
        <div className="grid h-full place-items-center text-navy-600/30" role="img" aria-label={`Foto ${name} belum tersedia`}>
          <CarFront size={72} strokeWidth={1.2} />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-navy-50">
        <Image src={images[idx]} alt={`Foto ${name} ${idx + 1}`} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" priority={idx === 0} />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
              aria-label="Foto sebelumnya"
            ><ChevronLeft size={20} /></button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
              aria-label="Foto berikutnya"
            ><ChevronRight size={20} /></button>
            <span className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">{idx + 1}/{images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => setIdx(i)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === idx ? "border-navy-600" : "border-transparent"}`}>
              <Image src={src} alt={`Thumbnail ${i + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
