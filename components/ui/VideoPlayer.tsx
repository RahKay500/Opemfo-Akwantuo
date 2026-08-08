"use client";

import { useRef, useState } from "react";
import { PlayIcon, PauseIcon, VolumeHighIcon, VolumeMuteIcon, Maximize01Icon, Minimize01Icon } from "./icons";

// Base Components → Video players, pulled from the Figma design system
// ("gfgfg" in the Figma MCP), node 9316:559159. Figma specs a large control
// surface — play/pause, fast/skip forward-backward, volume, playback
// speed, subtitles/CC, AirPlay, two maximize/minimize styles, tooltips on
// every button. This app's only video need is educational content (Learn
// & Prepare), so only play/pause, a scrub bar with elapsed/remaining time,
// mute toggle, and fullscreen are implemented — the transport-heavy extras
// (skip/fast forward, playback speed, subtitles, AirPlay) are skipped as
// unnecessary for short instructional clips. Controls bar = bottom
// gradient overlay (transparent → black/30), scrub track = white/30
// backdrop-blur, filled with solid white, matching the Figma
// "_Video actions bar" / "Video progress" styling.
export interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
    } else {
      container.requestFullscreen();
      setFullscreen(true);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className={`group/video relative overflow-hidden rounded-lg bg-black ${className ?? ""}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="aspect-video w-full"
        onClick={togglePlay}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-b from-black/0 to-black/60 px-3 pb-2 pt-8 opacity-0 transition-opacity group-hover/video:opacity-100 group-focus-within/video:opacity-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="flex items-center justify-center rounded-sm p-2 text-white hover:bg-white/10"
          >
            {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex items-center justify-center rounded-sm p-2 text-white hover:bg-white/10"
          >
            {muted ? <VolumeMuteIcon className="size-4" /> : <VolumeHighIcon className="size-4" />}
          </button>
          <div className="flex flex-1 items-center gap-2 px-1">
            <span className="w-9 shrink-0 font-body text-xs font-semibold text-white">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              aria-label="Seek"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={seek}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/30 backdrop-blur-sm [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              style={{ background: `linear-gradient(to right, white ${pct}%, rgba(255,255,255,0.3) ${pct}%)` }}
            />
            <span className="w-9 shrink-0 font-body text-xs font-semibold text-white">
              -{formatTime(duration - currentTime)}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="flex items-center justify-center rounded-sm p-2 text-white hover:bg-white/10"
          >
            {fullscreen ? <Minimize01Icon className="size-4" /> : <Maximize01Icon className="size-4" />}
          </button>
        </div>
      </div>
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-black/50 text-white">
            <PlayIcon className="size-6" />
          </span>
        </button>
      )}
    </div>
  );
}
