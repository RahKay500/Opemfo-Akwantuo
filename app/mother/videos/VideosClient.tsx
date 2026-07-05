"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlayIcon } from "@/components/ui/icons";
import { FEATURED_VIDEO, VIDEOS, CATEGORIES } from "./videos-data";

export default function VideosClient({ currentWeek }: { currentWeek: number }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const videos = category === "All" ? VIDEOS : VIDEOS.filter((v) => v.category === category);

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-5">
      <button type="button" className="overflow-hidden rounded-card bg-white text-left shadow-card">
        <div className="relative flex h-[200px] items-center justify-center bg-lilac-light">
          <div className="flex size-14 items-center justify-center rounded-badge bg-white">
            <PlayIcon className="ml-0.5 size-[22px] text-lilac-deeper" />
          </div>
          <span className="absolute left-3 top-3 rounded-badge bg-primary px-2.5 py-1 font-body text-xs font-medium text-lilac-deeper">
            Week {currentWeek}
          </span>
        </div>
        <div className="p-4">
          <p className="font-heading text-base font-bold text-text-primary">{FEATURED_VIDEO.title}</p>
          <p className="mt-1 font-body text-xs text-text-secondary">
            {FEATURED_VIDEO.duration} · {FEATURED_VIDEO.source}
          </p>
          <p className="mt-2 font-body text-[13px] font-medium text-pink-deep">Watch now →</p>
        </div>
      </button>

      <div className="flex gap-2 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-badge border-[1.5px] px-4 py-1.5 font-body text-xs font-medium",
              category === c ? "border-primary bg-primary text-lilac-deeper" : "border-border-color bg-white text-text-secondary"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {videos.map((video) => (
          <button key={video.id} type="button" className="overflow-hidden rounded-card bg-white text-left shadow-card">
            <div className="flex h-[120px] items-center justify-center bg-lilac-light">
              <div className="flex size-8 items-center justify-center rounded-badge bg-white">
                <PlayIcon className="ml-0.5 size-3 text-lilac-deeper" />
              </div>
            </div>
            <div className="p-2.5">
              <p className="font-heading text-[13px] font-bold leading-tight text-text-primary">{video.title}</p>
              <p className="mt-1 font-body text-[11px] text-text-secondary">
                {video.duration} · {video.source}
              </p>
            </div>
          </button>
        ))}
        {videos.length === 0 && (
          <p className="col-span-2 font-body text-sm text-text-secondary">No videos in this category yet.</p>
        )}
      </div>
    </div>
  );
}
