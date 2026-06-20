"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { Track } from "../types/radio";
import { 
  CATEGORIES, 
  SPEEDS, 
  ITEM_HEIGHT, 
  BUFFER, 
  removeTones, 
  cleanTitle, 
  formatTime, 
  getYoutubeId 
} from "../utils/radioUtils";
import { MarqueeTitle } from "./Radio/MarqueeTitle";
import { MobilePlayer } from "./Radio/MobilePlayer";
import { DesktopPlayer } from "./Radio/DesktopPlayer";
import { PlaylistPanel } from "./Radio/PlaylistPanel";

export default function RadioPlayer() {
  "use no memo";
  const [isMounted, setIsMounted] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: "Phát thanh Minh Huệ: Trừ bỏ chấp trước vào điện thoại – Tìm về trạng thái tu luyện như thuở đầu (Số 3)",
    url: "https://vi.minghui.org/radio/20250926-TDTH.mp3",
    category: "tru-bo-chap-truoc-vao-dien-thoai",
    originalIndex: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const speedIndexRef = useRef(speedIndex);
  useEffect(() => {
    speedIndexRef.current = speedIndex;
  }, [speedIndex]);

  // Playlist options
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"minh-hue" | "tu-kiem">("minh-hue");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isReverted, setIsReverted] = useState(false);
  const [listenedTracks, setListenedTracks] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Sleep Timer state
  const [sleepDropdownOpen, setSleepDropdownOpen] = useState(false);
  const [mobileSleepDropdownOpen, setMobileSleepDropdownOpen] = useState(false);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(0);
  const [stopAtTrackEnd, setStopAtTrackEnd] = useState(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);



  // Restore state flags
  const [pendingRestoreTime, setPendingRestoreTime] = useState<number | null>(null);
  const [isRestoreCompleted, setIsRestoreCompleted] = useState(false);
  const pendingRestoreTimeRef = useRef<number | null>(null);

  // Sync ref with state
  useEffect(() => {
    pendingRestoreTimeRef.current = pendingRestoreTime;
  }, [pendingRestoreTime]);

  // Virtual Scrolling state
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(380);

  // Track filtering & ordering
  const filteredAndOrderedTracks = useMemo(() => {
    let list = [...allTracks];

    // 1. Filter by category
    if (selectedCategory !== "all" && selectedCategory !== "all-tu-kiem") {
      list = list.filter(t => {
        let match = t.category === selectedCategory;
        if (!match && selectedCategory === "ngay-phap-luan-dai-phap-the-gioi-radio") {
          match = t.category?.startsWith("ngay-phap-luan-dai-phap-the-gioi") ?? false;
        }
        if (!match && selectedCategory === "phap-hoi-trung-quoc-radio") {
          match = t.category?.startsWith("phap-hoi-trung-quoc") ?? false;
        }
        return match;
      });
    } else if (selectedCategory === "all") {
      const tuKiemIds = CATEGORIES.filter(c => c.group === "tu-kiem" && c.id !== "all-tu-kiem").map(c => c.id);
      list = list.filter(t => !tuKiemIds.includes(t.category));
    } else if (selectedCategory === "all-tu-kiem") {
      const tuKiemIds = CATEGORIES.filter(c => c.group === "tu-kiem" && c.id !== "all-tu-kiem").map(c => c.id);
      list = list.filter(t => tuKiemIds.includes(t.category));
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = removeTones(searchQuery.toLowerCase().trim());
      const keywords = q.split(/\s+/).filter(Boolean);
      list = list.filter(t => {
        const titleNormalized = removeTones(t.title.toLowerCase());
        return keywords.every(kw => titleNormalized.includes(kw));
      });
    }

    // 3. Revert order
    const finalList = isReverted ? [...list].reverse() : list;

    return finalList;
  }, [allTracks, selectedCategory, searchQuery, isReverted]);

  const scrollToActiveTrack = useCallback((trackToScroll?: Track) => {
    const track = trackToScroll || currentTrack;
    const idx = filteredAndOrderedTracks.findIndex(t => t.url === track.url);
    if (idx >= 0 && scrollContainerRef.current) {
      const targetTop = idx * ITEM_HEIGHT - containerHeight / 2 + ITEM_HEIGHT / 2;
      scrollContainerRef.current.scrollTop = Math.max(0, targetTop);
    }
  }, [currentTrack, filteredAndOrderedTracks, containerHeight]);

  const playTrack = useCallback((track: Track) => {
    if (!audioRef.current) return;

    const isYT = track.url.includes("youtube.com") || track.url.includes("youtu.be");

    if (isYT) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = track.url;
      audioRef.current.playbackRate = SPEEDS[speedIndex];
      audioRef.current.load();

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay blocked or failed:", error);
        });
      }
      setIsPlaying(true);
    }

    setCurrentTrack(track);

    if (!listenedTracks.includes(track.url)) {
      const updated = [...listenedTracks, track.url];
      setListenedTracks(updated);
      localStorage.setItem("minhhue_listened_tracks", JSON.stringify(updated));
    }

    setTimeout(() => {
      scrollToActiveTrack(track);
    }, 50);
  }, [listenedTracks, speedIndex, scrollToActiveTrack]);

  const handleTrackEnded = useCallback(() => {
    if (!audioRef.current) return;

    if (stopAtTrackEnd) {
      audioRef.current.pause();
      setStopAtTrackEnd(false);
      setSleepTimeRemaining(0);
      return;
    }

    const idx = filteredAndOrderedTracks.findIndex(t => t.url === currentTrack.url);
    if (idx >= 0 && idx < filteredAndOrderedTracks.length - 1) {
      playTrack(filteredAndOrderedTracks[idx + 1]);
    } else if (filteredAndOrderedTracks.length > 0) {
      playTrack(filteredAndOrderedTracks[0]);
    }
  }, [stopAtTrackEnd, filteredAndOrderedTracks, currentTrack, playTrack]);

  // Đăng ký Service Worker kích hoạt PWA
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
          .catch((err) => console.error("PWA Service Worker registration failed:", err));
      });
    }
  }, []);

  // Mounted effect & fetch data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);

      // Copyright check
      const accepted = localStorage.getItem("minhhue_copyright_accepted");
      if (!accepted) {
        setShowCopyright(true);
      }

      // Load listened tracks
      try {
        const savedListened = localStorage.getItem("minhhue_listened_tracks");
        if (savedListened) {
          setListenedTracks(JSON.parse(savedListened));
        }
      } catch (e) {
        console.error(e);
      }

      // Load category preference
      const savedCat = localStorage.getItem("minhhue_selected_category");
      if (savedCat) {
        const catObj = CATEGORIES.find(c => c.id === savedCat);
        if (catObj) {
          setSelectedCategory(savedCat);
          setActiveTab(catObj.group as "minh-hue" | "tu-kiem");
        }
      }

      // Load speed preference
      const savedSpeed = localStorage.getItem("minhhue_speed_index");
      if (savedSpeed) {
        const idx = parseInt(savedSpeed, 10);
        if (idx >= 0 && idx < SPEEDS.length) {
          setSpeedIndex(idx);
        }
      }
    }, 0);

    // Fetch radio playlist asynchronously (keeps JS bundle extremely lightweight)
    fetch("/radio-playlist.json?v=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        const tracks = (data as Track[]).map((t, idx) => ({ ...t, originalIndex: idx }));
        setAllTracks(tracks);
        setIsLoadingPlaylist(false);

        // Restore play state
        try {
          const savedStateStr = localStorage.getItem("minhhue_radio_state");
          if (savedStateStr) {
            const s = JSON.parse(savedStateStr);
            if (s.url && s.title) {
              let track = tracks.find(t => t.url === s.url);
              if (!track) {
                // Fallback to title matching in case of URL changes (like R2 migration)
                track = tracks.find(t => t.title === s.title);
              }

              if (track) {
                setCurrentTrack(track);
                // Automatically activate correct category and tab so the track is rendered and scrolled to
                const catObj = CATEGORIES.find(c => c.id === track.category);
                if (catObj) {
                  setSelectedCategory(track.category);
                  setActiveTab(catObj.group as "minh-hue" | "tu-kiem");
                  localStorage.setItem("minhhue_selected_category", track.category);
                }
              } else {
                setCurrentTrack({ title: s.title, url: s.url, category: s.category || "", originalIndex: 0 });
              }

              if (s.time) {
                setPendingRestoreTime(s.time);
                setCurrentTime(s.time);
                if (s.duration) setDuration(s.duration);
              } else {
                setIsRestoreCompleted(true);
              }
            } else {
              setIsRestoreCompleted(true);
            }
          } else {
            if (tracks.length > 0) {
              setCurrentTrack(tracks[0]);
            }
            setIsRestoreCompleted(true);
          }
        } catch (e) {
          console.error(e);
          setIsRestoreCompleted(true);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải playlist phát thanh:", err);
        setIsLoadingPlaylist(false);
      });

    return () => clearTimeout(timer);
  }, []);

  // Audio setup after mount
  useEffect(() => {
    if (!isMounted) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    // Set initial source
    audio.src = currentTrack.url;

    // Event listeners
    const handlePlay = () => {
      setIsPlaying(true);
      // Ensure playbackRate is preserved on iOS/Android after play starts
      if (audio.playbackRate !== SPEEDS[speedIndexRef.current]) {
        audio.playbackRate = SPEEDS[speedIndexRef.current];
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      // Chỉ cập nhật currentTime khi không có tiến trình chờ khôi phục để tránh việc ghi đè thời gian 0s
      if (pendingRestoreTimeRef.current === null) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleEnded = () => {
      handleTrackEnded();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // Sync track changes to audio ref and restore progress safely
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    const audio = audioRef.current;

    const isYT = currentTrack.url.includes("youtube.com") || currentTrack.url.includes("youtu.be");
    if (isYT) {
      audio.pause();
      setPendingRestoreTime(null);
      setIsRestoreCompleted(true);
      return;
    }

    // Nếu source thay đổi
    if (!audio.src.includes(currentTrack.url)) {
      audio.src = currentTrack.url;
      audio.playbackRate = SPEEDS[speedIndex];

      // Khôi phục progress nếu có pendingRestoreTime
      if (pendingRestoreTime !== null) {
        const restoreTime = pendingRestoreTime;
        const setTime = () => {
          if (isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = Math.min(restoreTime, audio.duration);
            audio.removeEventListener("loadedmetadata", setTime);
            setPendingRestoreTime(null);
            setIsRestoreCompleted(true);
          }
        };
        audio.addEventListener("loadedmetadata", setTime);
      }
    } else if (pendingRestoreTime !== null) {
      // Nếu source trùng (lần đầu mount) nhưng cần khôi phục thời gian
      const restoreTime = pendingRestoreTime;
      const setTime = () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          audio.currentTime = Math.min(restoreTime, audio.duration);
          audio.removeEventListener("loadedmetadata", setTime);
          setPendingRestoreTime(null);
          setIsRestoreCompleted(true);
        }
      };
      if (isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = Math.min(restoreTime, audio.duration);
        setPendingRestoreTime(null);
        setIsRestoreCompleted(true);
      } else {
        audio.addEventListener("loadedmetadata", setTime);
      }
    }
  }, [currentTrack, isMounted, pendingRestoreTime, speedIndex]);

  // Sync speed index to audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIndex];
    }
    if (isMounted) {
      localStorage.setItem("minhhue_speed_index", String(speedIndex));
    }
  }, [speedIndex, isMounted]);

  // Save current radio state
  useEffect(() => {
    if (!isMounted || !currentTrack || !isRestoreCompleted || pendingRestoreTime !== null) return;
    const stateObj = {
      url: currentTrack.url,
      title: currentTrack.title,
      category: currentTrack.category,
      time: currentTime,
      duration: duration > 0 ? duration : null
    };
    localStorage.setItem("minhhue_radio_state", JSON.stringify(stateObj));
  }, [currentTrack, currentTime, duration, isMounted, isRestoreCompleted, pendingRestoreTime]);

  const triggerSleepStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let vol = audio.volume;
    const fade = setInterval(() => {
      if (vol > 0.05) {
        vol -= 0.05;
        audio.volume = Math.max(0, vol);
      } else {
        clearInterval(fade);
        audio.pause();
        audio.volume = 1.0;
        setSleepTimeRemaining(0);
        setStopAtTrackEnd(false);
      }
    }, 100);
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimeRemaining > 0 && isPlaying) {
      sleepTimerRef.current = setInterval(() => {
        setSleepTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(sleepTimerRef.current!);
            sleepTimerRef.current = null;
            triggerSleepStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    }

    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
    };
  }, [sleepTimeRemaining, isPlaying, triggerSleepStop]);

  // Virtual scrolling parameters
  const totalHeight = filteredAndOrderedTracks.length * ITEM_HEIGHT;

  const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
  const endIdx = Math.min(
    filteredAndOrderedTracks.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  };

  // ResizeObserver to track container height
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.warn(e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const pct = parseFloat(e.target.value);
    const targetTime = (pct / 100) * duration;
    try {
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
    } catch (err) {
      console.warn("Seek error:", err);
    }
  };

  const rewind10s = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    } catch (e) {
      console.warn(e);
    }
  };

  const forward30s = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = Math.min(duration, audio.currentTime + 30);
    } catch (e) {
      console.warn(e);
    }
  };

  const changeSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEEDS.length);
  };

  const selectCategoryFilter = (catId: string) => {
    setSelectedCategory(catId);
    localStorage.setItem("minhhue_selected_category", catId);
    
    const catObj = CATEGORIES.find(c => c.id === catId);
    if (catObj) {
      setActiveTab(catObj.group as "minh-hue" | "tu-kiem");
    }

    setCategoryDropdownOpen(false);
    setScrollTop(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleSleepTimerSelect = (val: string) => {
    setSleepDropdownOpen(false);
    setMobileSleepDropdownOpen(false);
    setStopAtTrackEnd(false);

    if (val === "0") {
      setSleepTimeRemaining(0);
    } else if (val === "end") {
      setStopAtTrackEnd(true);
    } else {
      setSleepTimeRemaining(parseInt(val, 10) * 60);
    }
  };

  const currentCategoryName = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    return cat ? cat.name : "Danh sách chuyên mục";
  }, [selectedCategory]);

  useEffect(() => {
    if (isMounted && filteredAndOrderedTracks.length > 0) {
      const timer = setTimeout(() => {
        scrollToActiveTrack();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted, filteredAndOrderedTracks.length, scrollToActiveTrack]);

  if (!isMounted) {
    return (
      <div className="emdash-radio-layout-container">
        <div className="emdash-player-card-premium">
          <div className="radio-glow-border"></div>
          <div className="radio-left-panel-premium">
            <header className="radio-header">
              <div className="radio-live-tag">
                <span className="live-pulse"></span>
                RADIO
              </div>
              <h3 className="radio-main-title">Phát Thanh Minh Huệ</h3>
            </header>
            <div className="now-playing-box">
              <span className="now-playing-label">Đang phát:</span>
              <h4 className="current-track-title">{currentTrack.title}</h4>
            </div>
            <div className="custom-player-premium">
              <div className="custom-progress-area">
                <input type="range" className="custom-seek-slider" min="0" max="100" value="0" readOnly aria-label="Thanh trượt tiến trình" />
                <div className="custom-time-display">
                  <span>00:00</span>
                  <span>00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isYouTubeTrack = currentTrack.url.includes("youtube.com") || currentTrack.url.includes("youtu.be");
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const timerActive = sleepTimeRemaining > 0 || stopAtTrackEnd;
  const sleepText = stopAtTrackEnd
    ? "Hết bài"
    : sleepTimeRemaining > 0
      ? `${String(Math.floor(sleepTimeRemaining / 60)).padStart(2, "0")}:${String(sleepTimeRemaining % 60).padStart(2, "0")}`
      : "Hẹn giờ";

  return (
    <div className="emdash-radio-layout-container">
      {/* Copyright Modal */}
      {showCopyright && (
        <div className="copyright-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="copyright-modal-card">
            <div className="copyright-modal-header">
              <div className="copyright-warning-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <h3 className="copyright-modal-title" id="modal-title">Thông báo Bản quyền</h3>
            </div>
            <div className="copyright-modal-body">
              <p>
                Để mọi người thuận tiện tiếp cận và nghe Minh Huệ radio hàng ngày, đồng tu xin tuyển tập lại radio Minh Huệ theo các chủ đề hiện có. Mọi bản quyền thuộc về <strong>Minh Huệ Việt ngữ</strong>.
              </p>
            </div>
            <div className="copyright-modal-footer">
              <button
                onClick={() => {
                  localStorage.setItem("minhhue_copyright_accepted", "true");
                  setShowCopyright(false);
                }}
                className="modal-btn btn-continue"
              >
                Tiếp tục
              </button>
              <a
                href="https://vi.minghui.org/news/category/radio"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-btn btn-original"
              >
                Truy cập trang gốc
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <MobilePlayer
        isYouTubeTrack={isYouTubeTrack}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        currentTrack={currentTrack}
        currentTime={currentTime}
        duration={duration}
        changeSpeed={changeSpeed}
        speedIndex={speedIndex}
        mobileSleepDropdownOpen={mobileSleepDropdownOpen}
        setMobileSleepDropdownOpen={setMobileSleepDropdownOpen}
        timerActive={timerActive}
        sleepText={sleepText}
        handleSleepTimerSelect={handleSleepTimerSelect}
        progressPct={progressPct}
        handleSeek={handleSeek}
      />

      {/* Desktop Main Player Panel */}
      <DesktopPlayer
        isYouTubeTrack={isYouTubeTrack}
        isMobile={isMobile}
        currentTrack={currentTrack}
        progressPct={progressPct}
        handleSeek={handleSeek}
        currentTime={currentTime}
        duration={duration}
        rewind10s={rewind10s}
        togglePlay={togglePlay}
        isPlaying={isPlaying}
        forward30s={forward30s}
        changeSpeed={changeSpeed}
        speedIndex={speedIndex}
        sleepDropdownOpen={sleepDropdownOpen}
        setSleepDropdownOpen={setSleepDropdownOpen}
        timerActive={timerActive}
        sleepText={sleepText}
        handleSleepTimerSelect={handleSleepTimerSelect}
      />

      {/* Playlist Panel */}
      <PlaylistPanel
        isYouTubeTrack={isYouTubeTrack}
        isMobile={isMobile}
        currentTrack={currentTrack}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setScrollTop={setScrollTop}
        scrollContainerRef={scrollContainerRef}
        currentCategoryName={currentCategoryName}
        categoryDropdownOpen={categoryDropdownOpen}
        setCategoryDropdownOpen={setCategoryDropdownOpen}
        selectCategoryFilter={selectCategoryFilter}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleScroll={handleScroll}
        isLoadingPlaylist={isLoadingPlaylist}
        filteredAndOrderedTracks={filteredAndOrderedTracks}
        startIdx={startIdx}
        endIdx={endIdx}
        listenedTracks={listenedTracks}
        playTrack={playTrack}
        totalHeight={totalHeight}
      />
    </div>
  );
}
