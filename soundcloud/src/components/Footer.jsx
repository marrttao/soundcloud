import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import likeIcon from "../assets/icons/like.png";
import nextIcon from "../assets/icons/next.png";
import prevIcon from "../assets/icons/prev.png";
import pauseIcon from "../assets/icons/pause.png";
import playIcon from "../assets/icons/play.png";
import shuffleIcon from "../assets/icons/shuffle.png";
import repeatIcon from "../assets/icons/repeat.png";
import subscribeIcon from "../assets/icons/subscribe.png";
import { usePlayer } from "../context/PlayerContext";
import AddToPlaylistModal from "./AddToPlaylistModal.jsx";
import useBreakpoint from "../hooks/useBreakpoint";

const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const Footer = () => {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        next,
        previous,
        shuffle,
        toggleShuffle,
        repeatMode,
        cycleRepeat,
        progress,
        duration,
        seek,
        likeCurrentTrack,
        followCurrentArtist,
        likeInFlight,
        followInFlight,
        volume,
        setVolume
    } = usePlayer();
    const isMobile = useBreakpoint(640);

    const [menuOpen, setMenuOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [volumeOpen, setVolumeOpen] = useState(false);
    const menuRef = useRef(null);
    const volumeRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!volumeOpen) {
            return;
        }

        const handleClickOutside = (event) => {
            if (volumeRef.current && !volumeRef.current.contains(event.target)) {
                setVolumeOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setVolumeOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [volumeOpen]);

    useEffect(() => {
        if (!currentTrack) {
            setVolumeOpen(false);
        }
    }, [currentTrack]);

    const hasTrack = Boolean(currentTrack);
    const navigate = useNavigate();
    const progressSeconds = hasTrack ? Math.min(progress ?? 0, duration ?? 0) : 0;
    const formattedProgress = formatTime(progressSeconds);
    const formattedDuration = formatTime(duration ?? 0);
    const artistName = currentTrack?.artist?.displayName
        ?? currentTrack?.artist?.fullName
        ?? currentTrack?.artist?.username
        ?? "";

    const artworkUrl = currentTrack?.coverUrl
        ?? currentTrack?.artworkUrl
        ?? currentTrack?.artist?.avatarUrl
        ?? null;

    const handleSeek = (event) => {
        if (!hasTrack) return;
        const value = Number(event.target.value);
        if (Number.isFinite(value)) {
            seek(value);
        }
    };

    const handleToggleLike = async () => {
        if (!hasTrack || likeInFlight) return;
        try {
            await likeCurrentTrack();
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const handleToggleFollow = async () => {
        if (!hasTrack || followInFlight) return;
        try {
            await followCurrentArtist();
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    const repeatLabel = repeatMode === "one" ? "1" : repeatMode === "all" ? "A" : "";

    const toggleMenu = () => {
        if (!hasTrack) return;
        setMenuOpen((prev) => !prev);
    };

    const openAddToPlaylist = () => {
        if (!hasTrack) return;
        setShowAddModal(true);
        setMenuOpen(false);
    };

    const handleVolumeChange = (event) => {
        const value = Number(event.target.value);
        if (Number.isFinite(value)) {
            const normalized = Math.min(Math.max(1 - value, 0), 1);
            setVolume(normalized);
        }
    };

    const toggleVolumePanel = () => {
        if (!hasTrack) return;
        setVolumeOpen((prev) => !prev);
    };

    const volumePercent = Math.round((volume ?? 1) * 100);
    const volumeIcon = useMemo(() => {
        const level = volume ?? 1;
        const isMuted = level <= 0.001;
        const moderate = level > 0.001 && level <= 0.6;
        const baseOpacity = hasTrack ? 1 : 0.4;

        return (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
            >
                <path
                    d="M4 9V15H7.5L12 19V5L7.5 9H4Z"
                    fill="#ffffff"
                    fillOpacity={baseOpacity}
                />
                {!isMuted && (
                    <path
                        d="M15 9.5C15.9 10.4 16.5 11.6 16.5 13C16.5 14.4 15.9 15.6 15 16.5"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeOpacity={baseOpacity}
                        fill="none"
                    />
                )}
                {!isMuted && !moderate && (
                    <path
                        d="M18 7C19.5 8.5 20.4 10.6 20.4 13C20.4 15.4 19.5 17.5 18 19"
                        stroke="#ff5500"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeOpacity={baseOpacity}
                        fill="none"
                    />
                )}
            </svg>
        );
    }, [hasTrack, volume]);

    const renderPlaybackControls = (styleOverrides = {}) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "16px" : "12px",
                flexWrap: "nowrap",
                ...styleOverrides
            }}
        >
            <button
                type="button"
                onClick={previous}
                disabled={!hasTrack}
                style={{ background: "none", border: "none", padding: 4, cursor: hasTrack ? "pointer" : "not-allowed" }}
            >
                <img src={prevIcon} alt="Previous" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", opacity: hasTrack ? 1 : 0.4 }} />
            </button>
            <button
                type="button"
                onClick={togglePlay}
                disabled={!hasTrack}
                style={{ background: "none", border: "none", padding: 4, cursor: hasTrack ? "pointer" : "not-allowed" }}
            >
                <img src={isPlaying ? playIcon : pauseIcon} alt={isPlaying ? "Pause" : "Play"} style={{ width: 20, height: 20, filter: "invert(1) brightness(2)", opacity: hasTrack ? 1 : 0.4 }} />
            </button>
            <button
                type="button"
                onClick={next}
                disabled={!hasTrack}
                style={{ background: "none", border: "none", padding: 4, cursor: hasTrack ? "pointer" : "not-allowed" }}
            >
                <img src={nextIcon} alt="Next" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", opacity: hasTrack ? 1 : 0.4 }} />
            </button>
            <button
                type="button"
                onClick={toggleShuffle}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}
            >
                <img
                    src={shuffleIcon}
                    alt="Shuffle"
                    style={{
                        width: 16,
                        height: 16,
                        filter: shuffle ? "invert(44%) sepia(61%) saturate(3529%) hue-rotate(349deg) brightness(100%) contrast(101%)" : "invert(1) brightness(2)",
                        opacity: hasTrack ? 1 : 0.4
                    }}
                />
            </button>
            <button
                type="button"
                onClick={cycleRepeat}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", position: "relative" }}
            >
                <img
                    src={repeatIcon}
                    alt="Repeat"
                    style={{
                        width: 16,
                        height: 16,
                        filter: repeatMode === "off" ? "invert(1) brightness(2)" : "invert(44%) sepia(61%) saturate(3529%) hue-rotate(349deg) brightness(100%) contrast(101%)",
                        opacity: hasTrack ? 1 : 0.4
                    }}
                />
                {repeatLabel && (
                    <span style={{ position: "absolute", top: -6, right: -6, fontSize: 10, color: "#ff5500" }}>{repeatLabel}</span>
                )}
            </button>
        </div>
    );

    const renderTimeline = (styleOverrides = {}) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 160,
                ...styleOverrides
            }}
        >
            <span style={{ color: "#fff", fontSize: 12, width: 40, textAlign: "right" }}>{formattedProgress}</span>
            <input
                type="range"
                min={0}
                max={Math.max(duration ?? 0, progress ?? 0)}
                step={0.5}
                value={progressSeconds}
                onChange={handleSeek}
                disabled={!hasTrack}
                style={{ flex: 1 }}
            />
            <span style={{ color: "#fff", fontSize: 12, width: 40 }}>{formattedDuration}</span>
        </div>
    );

    const renderTrackInfo = (styleOverrides = {}) => (
        <div
            role={hasTrack ? "link" : undefined}
            tabIndex={hasTrack ? 0 : -1}
            onKeyDown={(e) => {
                if (!hasTrack) return;
                if (e.key === "Enter" || e.key === " ") {
                    navigate(`/tracks/${currentTrack?.id}`);
                }
            }}
            onClick={() => {
                if (!hasTrack) return;
                navigate(`/tracks/${currentTrack?.id}`);
            }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
                cursor: hasTrack ? "pointer" : "default",
                ...styleOverrides
            }}
        >
            <div
                style={{
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56,
                    borderRadius: 10,
                    background: "#262626",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {artworkUrl ? (
                    <img
                        src={artworkUrl}
                        alt={currentTrack?.title ?? "Artwork"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span style={{ color: "#777", fontSize: 18 }}>♪</span>
                )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {hasTrack ? currentTrack.title : "Nothing playing"}
                </span>
                <span style={{ color: "#ccc", fontSize: 12, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{artistName}</span>
            </div>
        </div>
    );

    const renderVolumeControl = (styleOverrides = {}) => (
        <div
            ref={volumeRef}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...styleOverrides
            }}
        >
            <button
                type="button"
                onClick={toggleVolumePanel}
                disabled={!hasTrack}
                style={{
                    background: "#242424",
                    border: "1px solid #444",
                    borderRadius: 999,
                    padding: "6px 12px",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 40,
                    cursor: hasTrack ? "pointer" : "not-allowed",
                    opacity: hasTrack ? 1 : 0.4
                }}
                aria-haspopup="true"
                aria-expanded={volumeOpen}
                aria-label={`Volume ${volumePercent}%`}
            >
                {volumeIcon}
            </button>
            {volumeOpen && hasTrack && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 10px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(24,24,24,0.9)",
                        borderRadius: 999,
                        padding: "30px 14px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 18px 30px rgba(0,0,0,0.4)"
                    }}
                >
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={1 - (volume ?? 1)}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        orient="vertical"
                        className="volume-slider"
                        style={{
                            writingMode: "vertical-rl",
                            WebkitAppearance: "slider-vertical",
                            width: 10,
                            height: 140,
                            padding: 0,
                            margin: 0,
                            // dynamic background: orange fill from bottom up based on volumePercent
                            background: `linear-gradient(to top, #ff5500 ${volumePercent}%, rgba(255,255,255,0.12) ${volumePercent}%)`
                        }}
                    />
                </div>
            )}
        </div>
    );

    const renderActionButtons = (styleOverrides = {}) => (
        <div
            ref={menuRef}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 16 : 12,
                ...styleOverrides
            }}
        >
            <button
                type="button"
                onClick={handleToggleLike}
                disabled={!hasTrack}
                style={{ background: "none", border: "none", padding: 4, cursor: hasTrack ? "pointer" : "not-allowed" }}
            >
                <img
                    src={likeIcon}
                    alt="Like"
                    style={{
                        width: 16,
                        height: 16,
                        filter: currentTrack?.isLiked ? "invert(44%) sepia(61%) saturate(3529%) hue-rotate(349deg) brightness(100%) contrast(101%)" : "invert(1) brightness(2)",
                        opacity: hasTrack ? 1 : 0.4
                    }}
                />
            </button>
            <button
                type="button"
                onClick={handleToggleFollow}
                disabled={!hasTrack}
                style={{ background: "none", border: "none", padding: 4, cursor: hasTrack ? "pointer" : "not-allowed" }}
            >
                <img
                    src={subscribeIcon}
                    alt="Follow"
                    style={{
                        width: 16,
                        height: 16,
                        filter: currentTrack?.isFollowing ? "invert(44%) sepia(61%) saturate(3529%) hue-rotate(349deg) brightness(100%) contrast(101%)" : "invert(1) brightness(2)",
                        opacity: hasTrack ? 1 : 0.4
                    }}
                />
            </button>
            <button
                type="button"
                onClick={toggleMenu}
                disabled={!hasTrack}
                style={{
                    background: "none",
                    border: "none",
                    padding: 4,
                    cursor: hasTrack ? "pointer" : "not-allowed",
                    color: "#fff",
                    fontSize: 18,
                    opacity: hasTrack ? 1 : 0.4,
                    lineHeight: 1
                }}
                aria-haspopup="true"
                aria-expanded={menuOpen}
            >
                ⋮
            </button>
            {menuOpen && hasTrack && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        right: 0,
                        background: "#1f1f1f",
                        border: "1px solid #303030",
                        borderRadius: 10,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        minWidth: 180,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.35)"
                    }}
                >
                    <button
                        type="button"
                        onClick={openAddToPlaylist}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#f5f5f5",
                            textAlign: "left",
                            padding: "10px 12px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 14
                        }}
                    >
                        Add to playlist
                    </button>
                </div>
            )}
        </div>
    );

    const desktopContent = (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: 1240,
                gap: 28,
                margin: "0 auto"
            }}
        >
            {renderTrackInfo({ flex: "0 0 auto" })}
            {renderPlaybackControls({ flex: "0 0 auto" })}
            {renderTimeline({ flex: 1 })}
            {renderVolumeControl()}
            {renderActionButtons()}
        </div>
    );

    const mobileContent = (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {renderTrackInfo({ flex: 1 })}
                {renderActionButtons({ marginLeft: "auto" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {renderPlaybackControls({ flex: 1, justifyContent: "space-between" })}
                {renderVolumeControl({ flex: "0 0 auto" })}
            </div>
            {renderTimeline({ width: "100%" })}
        </div>
    );

    return (
        <>
        <footer
            style={{
                background: "#181818",
                padding: isMobile ? "12px 16px 18px" : "0 32px",
                height: isMobile ? "auto" : "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                zIndex: 1000,
                borderTop: "1px solid #222"
            }}
        >
            {isMobile ? mobileContent : desktopContent}
            <AddToPlaylistModal
                open={showAddModal && hasTrack}
                trackId={currentTrack?.id}
                onClose={() => setShowAddModal(false)}
                onAdded={() => setShowAddModal(false)}
            />
        </footer>
        <style>{`
            .volume-slider {
                -webkit-appearance: slider-vertical;
                appearance: slider-vertical;
                background: transparent;
            }
            .volume-slider::-webkit-slider-runnable-track {
                width: 10px;
                background: rgba(255,255,255,0.12);
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.04);
            }
            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #ff5500;
                border: 2px solid #ffffff;
                margin-top: -3px;
            }
            .volume-slider::-moz-range-track {
                width: 10px;
                background: rgba(255,255,255,0.12);
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.04);
            }
            .volume-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #ff5500;
                border: 2px solid #ffffff;
            }
        `}</style>
        </>
    );
};

export default Footer;
