"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { closeUploadModal } from "../../redux/slices/uiSlice";
import { useUploadShortMutation } from "../../redux/api/shortsApi";
import { useGetAudiosQuery } from "../../redux/api/soundsApi";
import { MAIN_STATIC_HASHTAGS } from "../../constants/hashtags";
import { Sound } from "../../types";
import VideoTrimmer from "./VideoTrimmer";
import CoverPicker from "./CoverPicker";
import {
  FiX,
  FiUploadCloud,
  FiFilm,
  FiHash,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiScissors,
  FiImage,
  FiMusic,
  FiSearch,
  FiPlay,
  FiPause,
  FiDisc,
} from "react-icons/fi";

export default function UploadModal() {
  const dispatch = useAppDispatch();
  const isUploadOpen = useAppSelector((state) => state.ui.isUploadOpen);
  const preselectedSound = useAppSelector((state) => state.ui.preselectedSound);
  const [uploadShort, { isLoading: uploading }] = useUploadShortMutation();

  // Wizard Step State (1: Select File, 2: Trim & Cover, 3: Details & Publish)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Trimming State
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(60);

  // Thumbnail / Cover State
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Sound Selector State
  const [selectedSound, setSelectedSound] = useState<Sound | null>(preselectedSound || null);
  const [soundSearch, setSoundSearch] = useState("");
  const [isSoundSelectorOpen, setIsSoundSelectorOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const { data: audiosData, isLoading: isAudiosLoading } = useGetAudiosQuery(
    { search: soundSearch, limit: 10 },
    { skip: !isSoundSelectorOpen }
  );

  // Update selectedSound if preselectedSound changes
  useEffect(() => {
    if (preselectedSound) {
      setSelectedSound(preselectedSound);
    }
  }, [preselectedSound]);

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  const handleToggleAudioPreview = (sound: Sound) => {
    if (playingAudioId === sound._id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(sound.audioUrl);
      audioPreviewRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlayingAudioId(null);
      setPlayingAudioId(sound._id);
    }
  };

  // Metadata State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">("public");
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isUploadOpen) return null;

  const handleVideoSelect = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrorMsg("Please select a valid video file (MP4, WebM, MOV)");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg("File size exceeds maximum 100MB limit");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreview(objectUrl);
    setErrorMsg("");

    // Load video metadata to extract total duration
    const tempVideo = document.createElement("video");
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration || 60;
      setVideoDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(60, dur));
      setStep(2); // Automatically advance to Trimming & Cover step
    };
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVideoSelect(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleVideoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleCoverSelected = (coverBlob: Blob | null, file: File | null) => {
    setCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setErrorMsg("Video file is required");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }

    setErrorMsg("");

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setPlayingAudioId(null);
    }

    const calculatedDuration = Math.max(1, endTime - startTime);

    const formData = new FormData();
    formData.append("video", videoFile);
    if (coverFile) {
      formData.append("thumbnail", coverFile);
    }
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("privacy", privacy);
    formData.append("startTime", startTime.toString());
    formData.append("duration", calculatedDuration.toString());
    if (selectedSound) {
      formData.append("audioId", selectedSound._id);
      formData.append("soundId", selectedSound._id);
    }

    try {
      await uploadShort(formData).unwrap();
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to upload video short");
    }
  };

  const handleClose = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setPlayingAudioId(null);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDuration(0);
    setStartTime(0);
    setEndTime(60);
    setCoverFile(null);
    setSelectedSound(null);
    setIsSoundSelectorOpen(false);
    setTitle("");
    setDescription("");
    setErrorMsg("");
    setStep(1);
    dispatch(closeUploadModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-elevated)]/40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold">
              <FiFilm className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[var(--text-primary)] leading-none">
                Upload & Trim Short Video
              </h3>
              <p className="text-[11px] font-semibold text-[var(--text-secondary)] leading-tight pt-0.5">
                Step {step} of 3: {step === 1 ? "Select Video" : step === 2 ? "Trim & Pick Cover" : "Video Details"}
              </p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)]/30"
                    : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-color)]"
                }`}
              >
                {step > s ? <FiCheck className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold animate-in fade-in duration-150">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Video Selector / Drag & Drop */}
          {step === 1 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="py-4 space-y-4"
            >
              <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)] rounded-3xl cursor-pointer bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]/70 transition-all duration-200 p-6 text-center group">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiUploadCloud className="w-8 h-8" />
                </div>
                <p className="font-extrabold text-base text-[var(--text-primary)]">
                  Click or Drag & Drop video file to upload
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium max-w-sm">
                  MP4, WebM or MOV videos up to 100MB. You will be able to trim and select cover thumbnail in the next step.
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* STEP 2: Trimming & Cover Selection */}
          {step === 2 && videoPreview && (
            <div className="space-y-6">
              {/* Timeline Video Trimmer Component */}
              <VideoTrimmer
                videoSrc={videoPreview}
                duration={videoDuration}
                startTime={startTime}
                endTime={endTime}
                onTrimChange={handleTrimChange}
                maxAllowedDuration={60}
                videoRef={videoRef}
              />

              <hr className="border-[var(--border-color)]" />

              {/* Cover Frame Picker Component */}
              <CoverPicker
                videoRef={videoRef}
                duration={videoDuration}
                startTime={startTime}
                endTime={endTime}
                onCoverSelected={handleCoverSelected}
              />

              {/* Step Navigation Buttons */}
              <div className="pt-2 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 h-11 rounded-xl border border-[var(--border-color)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Choose Other Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 h-11 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Next: Video Details</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Details & Publishing */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Give your short a catchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
                />
              </div>

              {/* Sound / Music Selector Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FiMusic className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    Background Sound / Music
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-normal">Optional</span>
                </label>

                {selectedSound ? (
                  <div className="p-3 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white shrink-0 overflow-hidden relative group">
                        {selectedSound.coverImage ? (
                          <img src={selectedSound.coverImage} alt={selectedSound.title} className="w-full h-full object-cover" />
                        ) : (
                          <FiDisc className="w-5 h-5 animate-spin-slow" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleAudioPreview(selectedSound)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {playingAudioId === selectedSound._id ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 fill-current translate-x-0.5" />}
                        </button>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{selectedSound.title}</p>
                        <p className="text-[10px] font-semibold text-[var(--text-secondary)] truncate">{selectedSound.artist || "Original Sound"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAudioPreview(selectedSound)}
                        className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors"
                        title="Preview Audio"
                      >
                        {playingAudioId === selectedSound._id ? <FiPause className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> : <FiPlay className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSound(null);
                          if (playingAudioId === selectedSound._id && audioPreviewRef.current) {
                            audioPreviewRef.current.pause();
                            setPlayingAudioId(null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-bold hover:bg-rose-500/10 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSoundSelectorOpen(!isSoundSelectorOpen)}
                    className="w-full h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <FiMusic className="w-4 h-4 text-[var(--accent-primary)]" />
                      Add Music Track / Trending Sound
                    </span>
                    <span className="text-[11px] font-extrabold text-[var(--accent-primary)]">
                      {isSoundSelectorOpen ? "Close Library" : "Browse Sounds →"}
                    </span>
                  </button>
                )}

                {/* Sound Library Search Drawer */}
                {isSoundSelectorOpen && !selectedSound && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 animate-in fade-in duration-150">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search music by title or artist..."
                        value={soundSearch}
                        onChange={(e) => setSoundSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                      />
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {isAudiosLoading ? (
                        <div className="py-6 text-center text-xs font-semibold text-[var(--text-muted)] flex items-center justify-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                          Fetching sound library...
                        </div>
                      ) : audiosData?.audios && audiosData.audios.length > 0 ? (
                        audiosData.audios.map((audioTrack) => (
                          <div
                            key={audioTrack._id}
                            className="p-2 rounded-xl bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] flex items-center justify-between gap-3 transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleAudioPreview(audioTrack)}
                                className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                              >
                                {playingAudioId === audioTrack._id ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5 fill-current translate-x-0.5" />}
                              </button>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{audioTrack.title}</p>
                                <p className="text-[10px] text-[var(--text-muted)] truncate">{audioTrack.artist || "Original Sound"}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSound(audioTrack);
                                setIsSoundSelectorOpen(false);
                                if (audioPreviewRef.current) {
                                  audioPreviewRef.current.pause();
                                  setPlayingAudioId(null);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-[11px] font-bold hover:scale-105 transition-transform shrink-0"
                            >
                              Select
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs font-semibold text-[var(--text-muted)]">
                          No audio tracks found matching "{soundSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description & Hashtags */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center justify-between">
                  <span>Description & Hashtags</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-normal">Click a hashtag below to add</span>
                </label>
                <textarea
                  placeholder="Describe your short... Use #hashtags to increase reach!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all resize-none"
                />
                {/* Quick Main Hashtags Bar */}
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
                    <FiHash className="w-3 h-3 text-[var(--accent-primary)]" />
                    Quick Hashtags:
                  </span>
                  {MAIN_STATIC_HASHTAGS.slice(0, 10).map((tag) => (
                    <button
                      type="button"
                      key={tag.name}
                      onClick={() => {
                        const tagToAdd = `#${tag.name}`;
                        if (!description.includes(tagToAdd)) {
                          setDescription((prev) => (prev ? `${prev.trim()} ${tagToAdd}` : tagToAdd));
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--text-secondary)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {tag.icon} {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy & Summary Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Privacy Settings
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="w-full h-11 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
                  >
                    <option value="public">Public (Everyone can see)</option>
                    <option value="unlisted">Unlisted (Anyone with link)</option>
                    <option value="private">Private (Only me)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-color)] flex flex-col justify-center space-y-1">
                  <span className="text-[11px] font-extrabold text-[var(--text-secondary)]">Pipeline Summary</span>
                  <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-primary)]">
                    <span className="flex items-center gap-1">
                      <FiScissors className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      {(endTime - startTime).toFixed(1)}s trim
                    </span>
                    <span className="flex items-center gap-1">
                      <FiImage className="w-3.5 h-3.5 text-emerald-400" />
                      {coverFile ? "Custom Cover" : "Auto Frame"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons & Upload Feedback */}
              <div className="pt-3 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={uploading}
                  className="px-4 h-11 rounded-xl border border-[var(--border-color)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back to Trimming</span>
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 h-11 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white text-sm font-bold shadow-md shadow-[var(--accent-primary)]/20 hover:shadow-lg hover:shadow-[var(--accent-primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Processing & Uploading...</span>
                    </>
                  ) : (
                    <span>Publish Short Video</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
