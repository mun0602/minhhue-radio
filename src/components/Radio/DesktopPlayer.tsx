import React from "react";
import { Track } from "../../types/radio";
import { formatTime, getYoutubeId, SPEEDS } from "../../utils/radioUtils";
import { MarqueeTitle } from "./MarqueeTitle";

interface DesktopPlayerProps {
  isYouTubeTrack: boolean;
  isMobile: boolean;
  currentTrack: Track;
  progressPct: number;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  duration: number;
  rewind10s: () => void;
  togglePlay: () => void;
  isPlaying: boolean;
  forward30s: () => void;
  changeSpeed: () => void;
  speedIndex: number;
  sleepDropdownOpen: boolean;
  setSleepDropdownOpen: (open: boolean) => void;
  timerActive: boolean;
  sleepText: string;
  handleSleepTimerSelect: (val: string) => void;
}

export const DesktopPlayer = ({
  isYouTubeTrack,
  isMobile,
  currentTrack,
  progressPct,
  handleSeek,
  currentTime,
  duration,
  rewind10s,
  togglePlay,
  isPlaying,
  forward30s,
  changeSpeed,
  speedIndex,
  sleepDropdownOpen,
  setSleepDropdownOpen,
  timerActive,
  sleepText,
  handleSleepTimerSelect
}: DesktopPlayerProps) => {
  return (
    <div className="emdash-player-card-premium">
      <div className="radio-glow-border"></div>
      <div className="radio-left-panel-premium">
        <header className="radio-header">
          <div className="radio-live-tag">
            <span className="live-pulse"></span>
            RADIO
          </div>
          <h1 className="radio-main-title">Phát Thanh Minh Huệ</h1>
        </header>

        <div className="now-playing-box">
          <span className="now-playing-label">Đang phát:</span>
          <MarqueeTitle title={currentTrack.title} className="current-track-title-marquee" />
        </div>

        {isYouTubeTrack ? (
          !isMobile && (
            <div className="desktop-youtube-player" style={{ width: "100%", marginTop: "16px", aspectRatio: "16/9", overflow: "hidden", borderRadius: "12px", background: "#000" }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYoutubeId(currentTrack.url)}?autoplay=1`}
                title={currentTrack.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )
        ) : (
          <div className="custom-player-premium">
            {/* Progress Slider */}
            <div className="custom-progress-area">
              <input
                type="range"
                className="custom-seek-slider"
                min="0"
                max="100"
                value={progressPct}
                onChange={handleSeek}
                step="0.1"
                aria-label="Thanh trượt tiến trình"
                style={{
                  background: `linear-gradient(to right, var(--color-accent) ${progressPct}%, rgba(148, 163, 184, 0.2) ${progressPct}%)`
                }}
              />
              <div className="custom-time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="custom-controls-row">
              <div className="custom-center-controls">
                <button onClick={rewind10s} className="custom-player-btn control-secondary-btn" title="Lùi 10 giây" aria-label="Lùi 10 giây">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="16 19 6 12 16 5" />
                  </svg>
                </button>

                <button onClick={togglePlay} className={`custom-play-main-btn ${isPlaying ? "playing" : ""}`} title="Phát / Tạm dừng" aria-label={isPlaying ? "Tạm dừng" : "Phát nhạc"}>
                  {!isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  )}
                </button>

                <button onClick={forward30s} className="custom-player-btn control-secondary-btn" title="Tiến 30 giây" aria-label="Tiến 30 giây">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="8 19 18 12 8 5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Speed, timer status */}
            <div className="custom-utilities-row">
              <div className="custom-status-indicator">
                <span className={`status-dot ${isPlaying ? "playing" : ""}`}></span>
                <span className="status-text">{isPlaying ? "Đang phát" : "Đang dừng"}</span>
              </div>

              <div className="custom-utilities-right" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div className="speed-dropdown-container">
                  <button
                    onClick={changeSpeed}
                    className="utility-btn speed-btn"
                    title="Tốc độ phát"
                    aria-label={`Tốc độ phát ${SPEEDS[speedIndex]}x`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: "middle" }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span style={{ verticalAlign: "middle" }}>{SPEEDS[speedIndex]}x</span>
                  </button>
                </div>

                <div className="sleep-timer-container">
                  <button
                    onClick={() => {
                      setSleepDropdownOpen(!sleepDropdownOpen);
                    }}
                    className={`utility-btn sleep-btn ${timerActive ? "active-timer" : ""}`}
                    title="Hẹn giờ tắt"
                    aria-label="Hẹn giờ tắt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: "middle" }}>
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    <span style={{ verticalAlign: "middle" }}>{sleepText}</span>
                  </button>
                  {sleepDropdownOpen && (
                    <div className="sleep-timer-dropdown">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
