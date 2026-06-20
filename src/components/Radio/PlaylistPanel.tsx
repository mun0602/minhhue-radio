import React from "react";
import { Track } from "../../types/radio";
import { CATEGORIES, cleanTitle, getYoutubeId, ITEM_HEIGHT } from "../../utils/radioUtils";
import { MarqueeTitle } from "./MarqueeTitle";

interface PlaylistPanelProps {
  isYouTubeTrack: boolean;
  isMobile: boolean;
  currentTrack: Track;
  activeTab: "minh-hue" | "tu-kiem";
  setActiveTab: (tab: "minh-hue" | "tu-kiem") => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setScrollTop: (val: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  currentCategoryName: string;
  categoryDropdownOpen: boolean;
  setCategoryDropdownOpen: (open: boolean) => void;
  selectCategoryFilter: (cat: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoadingPlaylist: boolean;
  filteredAndOrderedTracks: Track[];
  startIdx: number;
  endIdx: number;
  listenedTracks: string[];
  playTrack: (track: Track) => void;
  totalHeight: number;
}

export const PlaylistPanel = ({
  isYouTubeTrack,
  isMobile,
  currentTrack,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  setScrollTop,
  scrollContainerRef,
  currentCategoryName,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  selectCategoryFilter,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  handleScroll,
  isLoadingPlaylist,
  filteredAndOrderedTracks,
  startIdx,
  endIdx,
  listenedTracks,
  playTrack,
  totalHeight
}: PlaylistPanelProps) => {
  return (
    <div className="emdash-playlist-card-premium">
      <div className="radio-glow-border"></div>
      <div className="radio-right-panel-premium">
        <div className="playlist-section">
          {isYouTubeTrack && isMobile && (
            <div className="mobile-youtube-player" style={{ marginBottom: "16px", aspectRatio: "16/9", overflow: "hidden", borderRadius: "12px", background: "#000" }}>
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
          )}
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
                        key={originalIdx}
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
                        {isActive ? (
                          <MarqueeTitle title={track.title} className="track-name" />
                        ) : (
                          <span className="track-name" title={track.title}>
                            {cleanTitle(track.title)}
                          </span>
                        )}
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
  );
};
