"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiClock, FiScissors } from "react-icons/fi";

interface VideoTrimmerProps {
  videoSrc: string;
  duration: number;
  startTime: number;
  endTime: number;
  onTrimChange: (start: number, end: number) => void;
  maxAllowedDuration?: number; // Defaults to 60 seconds
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoTrimmer({
  videoSrc,
  duration,
  startTime,
  endTime,
  onTrimChange,
  maxAllowedDuration = 60,
  videoRef,
}: VideoTrimmerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);

  // Format seconds to mm:ss.s format
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const remainingSecs = (secs % 60).toFixed(1);
    const padSecs = parseFloat(remainingSecs) < 10 ? `0${remainingSecs}` : remainingSecs;
    const padMins = minutes < 10 ? `0${minutes}` : minutes;
    return `${padMins}:${padSecs}`;
  };

  // Video timeupdate listener to loop within trim boundaries
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Loop playback when reaching end of selected trim
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        if (!video.paused) {
          video.play().catch(() => {});
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoRef, startTime, endTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (video.currentTime < startTime || video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle timeline dragging
  const handlePointerDown = (handle: "start" | "end") => (e: React.PointerEvent) => {
    e.preventDefault();
    setActiveHandle(handle);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current || duration <= 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      let newTime = percentage * duration;

      if (handle === "start") {
        newTime = Math.max(0, Math.min(newTime, endTime - 1)); // min 1s duration
        if (endTime - newTime > maxAllowedDuration) {
          onTrimChange(newTime, newTime + maxAllowedDuration);
        } else {
          onTrimChange(newTime, endTime);
        }
        if (videoRef.current) {
          videoRef.current.currentTime = newTime;
        }
      } else {
        newTime = Math.min(duration, Math.max(newTime, startTime + 1)); // min 1s duration
        if (newTime - startTime > maxAllowedDuration) {
          onTrimChange(newTime - maxAllowedDuration, newTime);
        } else {
          onTrimChange(startTime, newTime);
        }
        if (videoRef.current) {
          videoRef.current.currentTime = newTime;
        }
      }
    };

    const onPointerUp = () => {
      setActiveHandle(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const currentTrimDuration = (endTime - startTime).toFixed(1);
  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full space-y-4">
      {/* Video Preview Player */}
      <div className="relative w-full aspect-[9/16] max-h-[320px] mx-auto rounded-2xl overflow-hidden bg-black border border-[var(--border-color)] shadow-xl flex items-center justify-center group">
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          className="w-full h-full object-contain"
          onEnded={() => setIsPlaying(false)}
        />

        {/* Video Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-90 transition-opacity flex flex-col justify-between p-3.5">
          {/* Top Info Badge */}
          <div className="flex justify-between items-center text-xs font-bold text-white/90">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <FiScissors className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              Trimmed: {currentTrimDuration}s / {maxAllowedDuration}s max
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:scale-110 transition-transform cursor-pointer"
            >
              {isMuted ? <FiVolumeX className="w-4 h-4 text-rose-400" /> : <FiVolume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="self-center p-4 rounded-full bg-black/50 border border-white/20 text-white backdrop-blur-md hover:scale-110 hover:bg-black/70 transition-all cursor-pointer shadow-lg"
          >
            {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6 ml-0.5" />}
          </button>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" />
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <span className="text-[11px] text-white/70">
              Range: {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Range Timeline Slider */}
      <div className="space-y-2 px-1">
        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)]">
          <span>Start: {formatTime(startTime)}</span>
          <span className="text-[var(--accent-primary)] font-extrabold">
            Duration: {currentTrimDuration}s
          </span>
          <span>End: {formatTime(endTime)}</span>
        </div>

        {/* Custom Track Container */}
        <div
          ref={trackRef}
          className="relative h-10 w-full rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center px-1 select-none touch-none"
        >
          {/* Dimmed Outside Left */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-black/40 rounded-l-xl"
            style={{ width: `${startPercent}%` }}
          />

          {/* Active Trim Selection Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-[var(--accent-primary)]/20 border-y-2 border-[var(--accent-primary)]"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          {/* Dimmed Outside Right */}
          <div
            className="absolute top-0 bottom-0 right-0 bg-black/40 rounded-r-xl"
            style={{ width: `${100 - endPercent}%` }}
          />

          {/* Current Playhead Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none shadow-md"
            style={{ left: `${currentPercent}%` }}
          />

          {/* Start Handle */}
          <div
            onPointerDown={handlePointerDown("start")}
            style={{ left: `${startPercent}%` }}
            className={`absolute top-0 bottom-0 w-4 bg-[var(--accent-primary)] rounded-l-lg cursor-ew-resize z-20 flex items-center justify-center border border-white/40 shadow-md hover:scale-110 transition-transform ${
              activeHandle === "start" ? "ring-2 ring-white scale-110" : ""
            }`}
          >
            <div className="w-0.5 h-4 bg-white/80 rounded-full" />
          </div>

          {/* End Handle */}
          <div
            onPointerDown={handlePointerDown("end")}
            style={{ left: `calc(${endPercent}% - 16px)` }}
            className={`absolute top-0 bottom-0 w-4 bg-[var(--accent-primary)] rounded-r-lg cursor-ew-resize z-20 flex items-center justify-center border border-white/40 shadow-md hover:scale-110 transition-transform ${
              activeHandle === "end" ? "ring-2 ring-white scale-110" : ""
            }`}
          >
            <div className="w-0.5 h-4 bg-white/80 rounded-full" />
          </div>
        </div>

        <p className="text-[11px] font-medium text-[var(--text-muted)] text-center">
          Drag the handles to trim video duration (max {maxAllowedDuration} seconds)
        </p>
      </div>
    </div>
  );
}
