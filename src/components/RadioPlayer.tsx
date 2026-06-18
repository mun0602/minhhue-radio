"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

interface Track {
  title: string;
  url: string;
  category: string;
  originalIndex?: number;
}

interface Category {
  id: string;
  name: string;
  path: string;
  group: "minh-hue" | "tu-kiem";
}

const CATEGORIES: Category[] = [
  { id: "all", name: "Tất cả phát thanh", path: "#", group: "minh-hue" },
  { id: "tru-bo-chap-truoc-vao-dien-thoai", name: "Trừ bỏ chấp trước vào điện thoại", path: "/news/category/tru-bo-chap-truoc-vao-dien-thoai", group: "minh-hue" },
  { id: "ngay-phap-luan-dai-phap-the-gioi-radio", name: "Ngày Pháp Luân Đại Pháp Thế giới", path: "/news/category/ngay-phap-luan-dai-phap-the-gioi", group: "minh-hue" },
  { id: "phap-hoi-trung-quoc-radio", name: "Pháp hội Trung Quốc", path: "/news/category/phap-hoi-trung-quoc", group: "minh-hue" },
  { id: "tin-tuc-tai-dai-luc", name: "Tin tức tại Đại Lục", path: "/news/category/tin-tuc-tai-dai-luc", group: "minh-hue" },
  { id: "tin-tuc-tren-the-gioi", name: "Tin tức trên thế giới", path: "/news/category/tin-tuc-tren-the-gioi", group: "minh-hue" },
  { id: "thien-am-tinh-nhac", name: "Thiên Âm Tịnh Nhạc", path: "/news/category/thien-am-tinh-nhac", group: "minh-hue" },
  { id: "kien-tri-hoc-thuoc-phap", name: "Kiên trì học thuộc Pháp", path: "/news/category/kien-tri-hoc-thuoc-phap", group: "minh-hue" },
  { id: "tin-tuc-tong-hop", name: "Tin tức tổng hợp", path: "/news/category/tin-tuc", group: "minh-hue" },
  { id: "cau-chuyen-tu-luyen", name: "Câu chuyện tu luyện", path: "/news/category/cau-chuyen-tu-luyen", group: "minh-hue" },
  { id: "giai-the-van-hoa-dang", name: "Giải thể văn hóa đảng (Số 25)", path: "/news/category/giai-the-van-hoa-dang", group: "minh-hue" },
  
  // Nhóm Tứ kiếm
  { id: "all-tu-kiem", name: "Tất cả sách Tứ kiếm", path: "#", group: "tu-kiem" },
  { id: "cuu-binh", name: "Cửu Bình - Chín bài bình luận về ĐCS", path: "/news/category/cuu-binh", group: "tu-kiem" },
  { id: "giai-the-van-hoa-dang-sach", name: "Giải thể văn hóa đảng (Sách)", path: "/news/category/giai-the-van-hoa-dang-sach", group: "tu-kiem" },
  { id: "muc-dich-cuoi-cung-cua-chu-nghia-cong-san", name: "Mục đích cuối cùng của CNCS", path: "/news/category/muc-dich-cuoi-cung-cua-chu-nghia-cong-san", group: "tu-kiem" },
  { id: "ma-quy-dang-thong-tri-the-gioi-cua-chung-ta", name: "Ma quỷ đang thống trị thế giới của chúng ta", path: "/news/category/ma-quy-dang-thong-tri-the-gioi-cua-chung-ta", group: "tu-kiem" },
  
  { id: "radio-hoi-uc-ve-su-phu", name: "Hồi ức về Sư Phụ", path: "/news/category/radio-hoi-uc-ve-su-phu", group: "minh-hue" },
  { id: "tuyen-tap-bai-chia-se-cua-tieu-de-tu-dai-phap", name: "Tiểu đệ tử Đại Pháp", path: "/news/category/tuyen-tap-bai-chia-se-cua-tieu-de-tu-dai-phap", group: "minh-hue" },
  { id: "tuyen-tap-cac-bai-chia-se-cua-de-tu-dai-phap-tre-tuoi", name: "Đệ tử Đại Pháp trẻ tuổi", path: "/news/category/tuyen-tap-cac-bai-chia-se-cua-de-tu-dai-phap-tre-tuoi", group: "minh-hue" },
  { id: "tuyen-tap-cac-bai-chia-se-tu-luyen-chinh-phap", name: "Tu luyện Chính Pháp", path: "/news/category/tuyen-tap-cac-bai-chia-se-tu-luyen-chinh-phap", group: "minh-hue" },
  { id: "dot-pha-gia-tuong-nghiep-benh", name: "Đột phá giả tướng nghiệp bệnh", path: "/news/category/dot-pha-gia-tuong-nghiep-benh", group: "minh-hue" },
  { id: "mot-niem-giua-thien-va-ac", name: "Một niệm giữa thiện và ác", path: "/news/category/mot-niem-giua-thien-va-ac", group: "minh-hue" },
  { id: "cuoc-song-va-hy-vong-da-quay-tro-lai", name: "Cuộc sống và hy vọng đã quay trở lại", path: "/news/category/cuoc-song-va-hy-vong-da-quay-tro-lai", group: "minh-hue" },
  { id: "bai-chia-se-co-loi-binh-cua-su-phu", name: "Bài chia sẻ có lời bình của Sư phụ", path: "/news/category/bai-chia-se-co-loi-binh-cua-su-phu", group: "minh-hue" }
];

const SPEEDS = [1.0, 1.25, 1.5, 2.0, 0.75];
const ITEM_HEIGHT = 52;
const BUFFER = 10;

function removeTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .toLowerCase();
}

function cleanTitle(title: string) {
  return title
    .replace(/\[\d{2}-\d{2}-\d{4}\]/g, "")
    .replace(/Phát thanh Minh Huệ:\s*/g, "")
    .replace(/Phát thanh Minh Huệ\s*\(.*?\):\s*/g, "")
    .trim();
}

const formatTime = (secs: number) => {
  if (isNaN(secs) || !isFinite(secs)) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getRandomIndex = (length: number) => {
  return Math.floor(Math.random() * length);
};

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

  // Playlist options
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"minh-hue" | "tu-kiem">("minh-hue");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isReverted, setIsReverted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [listenedTracks, setListenedTracks] = useState<string[]>([]);

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

    audioRef.current.src = track.url;
    audioRef.current.playbackRate = SPEEDS[speedIndex];
    audioRef.current.load();

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Autoplay blocked or failed:", error);
      });
    }

    setCurrentTrack(track);
    setIsPlaying(true);

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

    if (isRandomMode && filteredAndOrderedTracks.length > 0) {
      const randomIdx = getRandomIndex(filteredAndOrderedTracks.length);
      playTrack(filteredAndOrderedTracks[randomIdx]);
      return;
    }

    const idx = filteredAndOrderedTracks.findIndex(t => t.url === currentTrack.url);
    if (idx >= 0 && idx < filteredAndOrderedTracks.length - 1) {
      playTrack(filteredAndOrderedTracks[idx + 1]);
    } else if (filteredAndOrderedTracks.length > 0) {
      playTrack(filteredAndOrderedTracks[0]);
    }
  }, [stopAtTrackEnd, isRandomMode, filteredAndOrderedTracks, currentTrack, playTrack]);

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
    const handlePlay = () => setIsPlaying(true);
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
  }, [speedIndex]);

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
      <div className="mobile-bottom-bar">
        <div className="mobile-top-row">
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
          <div className="mobile-track-info">
            <span className="mobile-track-title">{cleanTitle(currentTrack.title)}</span>
            <span className="mobile-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="mobile-right-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={changeSpeed}
              className="mobile-speed-btn"
              title="Tốc độ phát"
              aria-label={`Tốc độ phát ${SPEEDS[speedIndex]}x`}
            >
              <span>{SPEEDS[speedIndex]}x</span>
            </button>

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
          </div>
        </div>
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
      </div>

      {/* Desktop Main Player Panel */}
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
            <h2 className="current-track-title" style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>{currentTrack.title}</h2>
          </div>

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
                <button onClick={changeSpeed} className="utility-btn speed-btn" title="Tốc độ phát" aria-label={`Tốc độ phát ${SPEEDS[speedIndex]}x`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: "middle" }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span style={{ verticalAlign: "middle" }}>{SPEEDS[speedIndex]}x</span>
                </button>

                <div className="sleep-timer-container">
                  <button
                    onClick={() => setSleepDropdownOpen(!sleepDropdownOpen)}
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
        </div>
      </div>

      {/* Playlist Panel */}
      <div className="emdash-playlist-card-premium">
        <div className="radio-glow-border"></div>
        <div className="radio-right-panel-premium">
          <div className="playlist-section">
            <div className="playlist-tabs-row">
              <div className="playlist-tabs">
                <button
                  className={`playlist-tab-btn ${activeTab === "minh-hue" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("minh-hue");
                    setSelectedCategory("all");
                    localStorage.setItem("minhhue_selected_category", "all");
                    setScrollTop(0);
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTop = 0;
                    }
                  }}
                >
                  Phát thanh Minh Huệ
                </button>
                <button
                  className={`playlist-tab-btn ${activeTab === "tu-kiem" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("tu-kiem");
                    setSelectedCategory("all-tu-kiem");
                    localStorage.setItem("minhhue_selected_category", "all-tu-kiem");
                    setScrollTop(0);
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTop = 0;
                    }
                  }}
                >
                  Tứ kiếm
                </button>
              </div>
            </div>

            <div className="playlist-sub-header">
              {/* Categories filter selector */}
              <div className="categories-filter-wrapper" style={{ flex: 1, marginBottom: 0 }}>
                <div
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className={`sub-categories-nav-toggle ${categoryDropdownOpen ? "open" : ""}`}
                  role="button"
                  aria-haspopup="listbox"
                  aria-expanded={categoryDropdownOpen}
                  aria-label="Chọn chuyên mục phát thanh"
                >
                  <span>{currentCategoryName}</span>
                  <i className="sub-categories-nav-icon"></i>
                </div>

                {categoryDropdownOpen && (
                  <>
                    <div className="category-dropdown-backdrop" onClick={() => setCategoryDropdownOpen(false)}></div>
                    <div className="sub-categories-nav-items">
                      <div className="bottom-sheet-handle"></div>
                      <div className="bottom-sheet-header">
                        <h3>Chọn chuyên mục</h3>
                        <button className="bottom-sheet-close" onClick={() => setCategoryDropdownOpen(false)} aria-label="Đóng bảng chọn">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      <ul>
                        {CATEGORIES.filter(cat => cat.group === activeTab).map((cat) => (
                          <li
                            key={cat.id}
                            onClick={() => selectCategoryFilter(cat.id)}
                            className={`sub-category-nav-item ${selectedCategory === cat.id ? "active-category" : ""}`}
                          >
                            <div>
                              <a href="#" onClick={(e) => e.preventDefault()}>
                                {cat.name}
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Playlist Actions */}
              <div className="playlist-actions">
                <button
                  onClick={() => {
                    if (filteredAndOrderedTracks.length > 0) {
                      const randomIdx = getRandomIndex(filteredAndOrderedTracks.length);
                      playTrack(filteredAndOrderedTracks[randomIdx]);
                    }
                  }}
                  className="action-btn random-action-btn"
                  title="Phát bài ngẫu nhiên ngay"
                  aria-label="Phát bài ngẫu nhiên ngay"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  <span className="random-btn-text">Ngẫu nhiên</span>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (isSearchOpen) setSearchQuery("");
                  }}
                  className={`action-btn ${isSearchOpen ? "active-mode" : ""}`}
                  title="Tìm kiếm phát thanh"
                  aria-label="Tìm kiếm phát thanh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span className="search-btn-text">Tìm kiếm</span>
                </button>
              </div>
            </div>

            {/* Search Input Box */}
            {isSearchOpen && (
              <div className="search-bar-wrapper">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Tìm kiếm trong 3,400+ phát thanh..."
                    className="playlist-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    aria-label="Nhập từ khóa tìm kiếm bài"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="clear-search-btn" aria-label="Xóa ô tìm kiếm">
                      &times;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Playlist Scroll Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="playlist-scroll-container"
            >
              {isLoadingPlaylist ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0", fontSize: 13, fontWeight: 600 }}>
                  <span className="status-dot playing" style={{ display: "inline-block", marginRight: 8, width: 6, height: 6 }}></span>
                  Đang tải 3,400+ phát thanh...
                </div>
              ) : filteredAndOrderedTracks.length === 0 ? (
                <p className="empty-playlist-msg" style={{ display: "block" }}>
                  Không có phát thanh nào thuộc chuyên mục này.
                </p>
              ) : (
                <div style={{ position: "relative", height: totalHeight }}>
                  <ul id="playlist">
                    {filteredAndOrderedTracks.slice(startIdx, endIdx).map((track, relativeIdx) => {
                      const idx = startIdx + relativeIdx;
                      const originalIdx = track.originalIndex ?? idx;
                      const num = String(originalIdx + 1).padStart(2, "0");
                      const isActive = track.url === currentTrack.url;
                      const isListened = listenedTracks.includes(track.url);
                      const cssClass = `${isActive ? "active" : ""} ${isListened ? "listened" : ""}`.trim();

                      return (
                        <li
                          key={track.url}
                          onClick={() => playTrack(track)}
                          style={{
                            position: "absolute",
                            top: idx * ITEM_HEIGHT,
                            left: 0,
                            right: 0,
                            height: ITEM_HEIGHT
                          }}
                          className={cssClass}
                        >
                          <span className="track-number">{num}</span>
                          <span className="track-name" title={track.title}>
                            {cleanTitle(track.title)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
