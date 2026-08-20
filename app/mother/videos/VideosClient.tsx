"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayIcon, XIcon } from "@/components/ui/icons";
import Tabs from "@/components/ui/Tabs";
import { FEATURED_VIDEO, VIDEOS, CATEGORIES, youtubeThumbnail, youtubeEmbedUrl, type VideoItem } from "./videos-data";

export default function VideosClient({
  currentWeek,
  extraVideos,
}: {
  currentWeek: number;
  extraVideos: VideoItem[];
}) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [playing, setPlaying] = useState<VideoItem | null>(null);
  const allVideos = [...extraVideos, ...VIDEOS];
  const videos = category === "All" ? allVideos : allVideos.filter((v) => v.category === category);

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-5">
      <button
        type="button"
        onClick={() => setPlaying(FEATURED_VIDEO)}
        className="overflow-hidden rounded-card bg-white text-left shadow-card lg:flex lg:items-stretch"
      >
        <div className="relative flex h-[200px] items-center justify-center bg-lilac-light lg:h-auto lg:w-[30%] lg:shrink-0">
          <Image
            src={youtubeThumbnail(FEATURED_VIDEO.url)}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 30vw, 100vw"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex size-14 items-center justify-center rounded-badge bg-white">
            <PlayIcon className="ml-0.5 size-[22px] text-lilac-deeper" />
          </div>
          <span className="absolute left-3 top-3 rounded-badge bg-primary px-2.5 py-1 font-body text-xs font-medium text-white">
            Week {currentWeek}
          </span>
        </div>
        <div className="p-4 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:p-10">
          <p className="hidden font-body text-xs font-bold uppercase tracking-wide text-lilac-deeper lg:block">
            Featured
          </p>
          <p className="font-heading text-base font-bold text-text-primary lg:mt-2 lg:text-2xl">
            {FEATURED_VIDEO.title}
          </p>
          <p className="mt-1 font-body text-xs text-text-secondary lg:mt-2 lg:text-sm">
            {FEATURED_VIDEO.duration ? `${FEATURED_VIDEO.duration} · ` : ""}
            {FEATURED_VIDEO.source}
          </p>
          <p className="mt-2 font-body text-[13px] font-medium text-pink-deep lg:hidden">Watch now →</p>
          <span className="mt-5 hidden w-fit rounded-button bg-lilac-mid px-6 py-3 font-heading text-sm font-bold text-lilac-deeper lg:block">
            Watch now →
          </span>
        </div>
      </button>

      <Tabs
        style="pill"
        tabs={CATEGORIES.map((c) => ({ key: c, label: c }))}
        activeKey={category}
        onChange={(key) => setCategory(key as (typeof CATEGORIES)[number])}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setPlaying(video)}
            className="overflow-hidden rounded-card bg-white text-left shadow-card"
          >
            <div className="relative flex h-[120px] items-center justify-center bg-lilac-light">
              <Image src={youtubeThumbnail(video.url)} alt="" fill className="object-cover" sizes="50vw" />
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex size-8 items-center justify-center rounded-badge bg-white">
                <PlayIcon className="ml-0.5 size-3 text-lilac-deeper" />
              </div>
            </div>
            <div className="p-2.5">
              <p className="font-heading text-[13px] font-bold leading-tight text-text-primary">{video.title}</p>
              <p className="mt-1 font-body text-[11px] text-text-secondary">
                {video.duration ? `${video.duration} · ` : ""}
                {video.source}
              </p>
            </div>
          </button>
        ))}
        {videos.length === 0 && (
          <p className="col-span-2 font-body text-sm text-text-secondary">No videos in this category yet.</p>
        )}
      </div>

      {playing && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center bg-black/95 px-4 py-6">
          <button
            type="button"
            onClick={() => setPlaying(null)}
            aria-label="Close video"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-badge bg-white/10 text-white"
          >
            <XIcon className="size-5" />
          </button>
          <div className="mx-auto w-full max-w-3xl">
            <div className="aspect-video w-full overflow-hidden rounded-card bg-black">
              <iframe
                src={youtubeEmbedUrl(playing.url)}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
            <p className="mt-3 font-heading text-base font-bold text-white">{playing.title}</p>
            <p className="mt-1 font-body text-xs text-white/70">
              {playing.duration ? `${playing.duration} · ` : ""}
              {playing.source}
            </p>
            <p className="mt-2 font-body text-xs text-white/50">
              Video not loading?{" "}
              <a href={playing.url} target="_blank" rel="noopener noreferrer" className="underline">
                Watch on YouTube ↗
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
