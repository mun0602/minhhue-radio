import React from "react";
import { Track } from "../../types/radio";
import { formatTime, SPEEDS } from "../../utils/radioUtils";
import { MarqueeTitle } from "./MarqueeTitle";

interface MobilePlayerProps {
  isYouTubeTrack: boolean;
  isPlaying: boolean;
  togglePlay: () => void;
  currentTrack: Track;
  currentTime: number;
  duration: number;
  changeSpeed: () => void;
  speedIndex: number;
  mobileSleepDropdownOpen: boolean;
  setMobileSleepDropdownOpen: (open: boolean) => void;
  timerActive: boolean;
  sleepText: string;
  handleSleepTimerSelect: (val: string) => void;
  progressPct: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MobilePlayer = ({
  isYouTubeTrack,
  isPlaying,
  togglePlay,
  currentTrack,
  currentTime,
  duration,
  changeSpeed,
  speedIndex,
  mobileSleepDropdownOpen,
  setMobileSleepDropdownOpen,
  timerActive,
  sleepText,
  handleSleepTimerSelect,
  progressPct,
  handleSeek
}: MobilePlayerProps) => {
  return (
    <div className="mobile-bottom-bar">
      <div className="mobile-top-row">
        {!isYouTubeTrack && (
          <button onClick={togglePlay} className="mobile-play-btn" aria-label={isPlaying ? "Tạm dừng" : "Phát nhạc"}>
            {!isPlaying ? (
              <svg className="mobile-play-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="mobile-pause-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
        )}
        <div className="mobile-track-info" style={{ marginLeft: isYouTubeTrack ? 0 : undefined, overflow: "hidden" }}>
          <MarqueeTitle title={currentTrack.title} className="mobile-track-title-marquee" />
          {!isYouTubeTrack && (
            <span className="mobile-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
        </div>
        <div className="mobile-right-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!isYouTubeTrack && (
            <>
              <div className="mobile-speed-timer-container">
                <button
                  onClick={changeSpeed}
                  className="mobile-speed-btn"
                  title="Tốc độ phát"
                  aria-label={`Tốc độ phát ${SPEEDS[speedIndex]}x`}
                >
                  <span>{SPEEDS[speedIndex]}x</span>
                </button>
              </div>

              <div className="mobile-sleep-timer-container">
                <button
                  onClick={() => setMobileSleepDropdownOpen(!mobileSleepDropdownOpen)}
                  className={`mobile-sleep-btn ${timerActive ? "active-timer" : ""}`}
                  aria-label="Hẹn giờ tắt"
                  title={sleepText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </button>
                {mobileSleepDropdownOpen && (
                  <div className="mobile-sleep-dropdown">
                    <ul>
                      <li onClick={() => handleSleepTimerSelect("0")}>Tắt hẹn giờ</li>
                      <li onClick={() => handleSleepTimerSelect("15")}>15 phút</li>
                      <li onClick={() => handleSleepTimerSelect("30")}>30 phút</li>
                      <li onClick={() => handleSleepTimerSelect("45")}>45 phút</li>
                      <li onClick={() => handleSleepTimerSelect("60")}>60 phút</li>
                      <li onClick={() => handleSleepTimerSelect("end")}>Hết bài</li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {!isYouTubeTrack && (
        <div className="mobile-progress-row">
          <input
            type="range"
            className="mobile-seek-slider"
            min="0"
            max="100"
            value={progressPct}
            onChange={handleSeek}
            step="0.1"
            aria-label="Thanh trượt tiến trình di động"
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${progressPct}%, rgba(148, 163, 184, 0.2) ${progressPct}%)`
            }}
          />
        </div>
      )}
    </div>
  );
};
