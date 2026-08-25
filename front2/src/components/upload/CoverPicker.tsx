"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiImage, FiCheck, FiRefreshCw } from "react-icons/fi";

interface CoverPickerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  duration: number;
  startTime: number;
  endTime: number;
  onCoverSelected: (coverBlob: Blob | null, coverFile: File | null) => void;
}

export default function CoverPicker({
  videoRef,
  duration,
  startTime,
  endTime,
  onCoverSelected,
}: CoverPickerProps) {
  const [scrubTime, setScrubTime] = useState(startTime);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync scrubTime when startTime changes
  useEffect(() => {
    setScrubTime(startTime);
    captureFrameAt(startTime);
  }, [startTime]);

  const captureFrameAt = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;

    const handleSeeked = () => {
      video.removeEventListener("seeked", handleSeeked);
      generateSnapshot();
    };

    video.addEventListener("seeked", handleSeeked, { once: true });
  };

  const generateSnapshot = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    try {
      setIsCapturing(true);
      const canvas = canvasRef.current || document.createElement("canvas");
      const width = video.videoWidth || 720;
      const height = video.videoHeight || 1280;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCoverPreview(dataUrl);

        canvas.toBlob(
          (blob) => {
            setIsCapturing(false);
            if (blob) {
              const file = new File([blob], `cover-${Date.now()}.jpg`, { type: "image/jpeg" });
              onCoverSelected(blob, file);
            }
          },
          "image/jpeg",
          0.9
        );
      }
    } catch (e) {
      console.warn("Could not capture cover thumbnail from video canvas:", e);
      setIsCapturing(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setScrubTime(newTime);
    setCustomFile(null);
    captureFrameAt(newTime);
  };

  const handleCustomImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setCoverPreview(URL.createObjectURL(file));
      onCoverSelected(null, file);
    }
  };

  return (
    <div className="w-full space-y-4 pt-2">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
          Select Cover Thumbnail
        </label>
        <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
          Scrub frame or upload image
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Cover Preview Box */}
        <div className="relative w-full aspect-[9/16] max-h-[160px] rounded-xl overflow-hidden bg-black border border-[var(--border-color)] shadow-md flex items-center justify-center mx-auto">
          {coverPreview ? (
            <img src={coverPreview} alt="Selected cover" className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-[var(--text-muted)] font-medium">No cover frame</div>
          )}

          {isCapturing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <FiRefreshCw className="w-5 h-5 text-white animate-spin" />
            </div>
          )}

          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-extrabold text-white">
            COVER
          </div>
        </div>

        {/* Scrub Controls */}
        <div className="sm:col-span-2 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>Scrub Frame</span>
              <span>{scrubTime.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={startTime}
              max={endTime}
              step={0.1}
              value={scrubTime}
              onChange={handleSliderChange}
              className="w-full h-2 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="flex items-center justify-center gap-2 h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-all">
              <FiImage className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="truncate">
                {customFile ? customFile.name : "Upload Custom Image"}
              </span>
              <input type="file" accept="image/*" onChange={handleCustomImageSelect} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
