import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPlaylistDetail, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist, updatePlaylist } from "../../api/playlist";
import { searchTracks } from "../../api/search";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { usePlayer } from "../../context/PlayerContext";
import pauseIcon from "../../assets/icons/pause.png";
import playIcon from "../../assets/icons/play.png";
import "./playlist.css";

const FALLBACK_PLAYLIST_COVER = "https://i.imgur.com/6unG5jv.png";
const MIN_SEARCH_LENGTH = 2;

const formatClock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--:--";
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatRuntime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0 min";
  }
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const pieces = [];
  if (hours) {
    pieces.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  }
  if (minutes || !pieces.length) {
    pieces.push(`${minutes} min`);
  }
  return pieces.join(" ");
};

const formatRelativeDate = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return "";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) {
    return "just now";
  }
  if (diffMs < hour) {
    const minutes = Math.round(diffMs / minute);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffMs < day) {
    const hours = Math.round(diffMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diffMs < week) {
    const days = Math.round(diffMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (diffMs < month) {
    const weeks = Math.round(diffMs / week);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  if (diffMs < year) {
    const months = Math.round(diffMs / month);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.round(diffMs / year);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

const formatCount = (value = 0) => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
};

const normalizeSearchTrack = (result) => {
  if (!result || typeof result !== "object") {
    return null;
  }

  const id = result.id ?? result.trackId ?? result.track_id ?? result.slug ?? null;
  const title = result.title ?? result.name ?? result.trackTitle ?? result.TrackTitle ?? "";

  if (!id || !title) {
    return null;
  }

  const artist = result.artist ?? result.artistName ?? result.artist_name ?? result.user?.full_name ?? result.user?.username ?? "";

  return {
    id,
    title,
    artist: artist || ""
  };
};

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const searchContainerRefs = useRef({ main: null, modal: null });
  const setMainSearchRef = useCallback((node) => {
    searchContainerRefs.current.main = node;
  }, []);
  const setModalSearchRef = useCallback((node) => {
    searchContainerRefs.current.modal = node;
  }, []);

  const [playlist, setPlaylist] = useState(null);
  const [owner, setOwner] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [trackSearchTerm, setTrackSearchTerm] = useState("");
  const [trackSearchResults, setTrackSearchResults] = useState([]);
  const [searchingTracks, setSearchingTracks] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [addingTrackId, setAddingTrackId] = useState(null);
  const [removingTrackIds, setRemovingTrackIds] = useState(() => new Set());
  const [deletingPlaylist, setDeletingPlaylist] = useState(false);
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [detailsDirty, setDetailsDirty] = useState(false);

  const { playTrack, currentTrack, togglePlay, isPlaying } = usePlayer();

  const existingTrackIds = useMemo(() => {
    if (!Array.isArray(tracks)) {
      return new Set();
    }
    const ids = tracks
      .map((track) => track.trackId)
      .filter((id) => typeof id === "number" || typeof id === "string");
    return new Set(ids);
  }, [tracks]);

  const applyDetail = useCallback((detail, options = {}) => {
    const summary = detail?.playlist ?? null;
    setPlaylist(summary);
    setOwner(detail?.owner ?? null);
    setTracks(Array.isArray(detail?.tracks) ? detail.tracks : []);
    setIsOwner(Boolean(detail?.isOwner));
    if (options.force || !detailsDirty) {
      setEditTitle((summary?.title ?? "").trim());
      setEditDescription(summary?.description ?? "");
      setDetailsDirty(false);
    }
  }, [detailsDirty]);

  useEffect(() => {
    if (!playlistId) {
      setError("Playlist not found");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setActionError("");
      setActionMessage("");
      try {
        const detail = await fetchPlaylistDetail(playlistId);
        if (!cancelled) {
          applyDetail(detail);
        }
      } catch (err) {
        console.error("Failed to fetch playlist", err);
        if (!cancelled) {
          setError(err?.response?.data ?? err?.message ?? "Unable to load playlist");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSearchOpen(false);
    setSearchAnchor(null);
    setDetailsDirty(false);
    setEditTitle((playlist?.title ?? "").trim());
    setEditDescription(playlist?.description ?? "");
  }, [playlist]);

  const computeDetailsDirty = useCallback((nextTitle, nextDescription) => {
    const normalizedTitle = (nextTitle ?? "").trim();
    const normalizedDescription = nextDescription ?? "";
    const baseTitle = (playlist?.title ?? "").trim();
    const baseDescription = playlist?.description ?? "";
    return normalizedTitle !== baseTitle || normalizedDescription !== baseDescription;
  }, [playlist]);

  const handleEditTitleChange = useCallback((value) => {
    setEditTitle(value);
    setDetailsDirty(computeDetailsDirty(value, editDescription));
  }, [computeDetailsDirty, editDescription]);

  const handleEditDescriptionChange = useCallback((value) => {
    setEditDescription(value);
    setDetailsDirty(computeDetailsDirty(editTitle, value));
  }, [computeDetailsDirty, editTitle]);

  useEffect(() => {
    if (!showEditModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseEditModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showEditModal, handleCloseEditModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const containers = Object.values(searchContainerRefs.current).filter(Boolean);
      if (!containers.length) {
        return;
      }
      const inside = containers.some((node) => node.contains(event.target));
      if (!inside) {
        setSearchOpen(false);
        setSearchAnchor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = trackSearchTerm.trim();

    if (!trimmed) {
      setTrackSearchResults([]);
      setSearchError("");
      setSearchingTracks(false);
      setSearchOpen(false);
      setSearchAnchor(null);
      return undefined;
    }

    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setTrackSearchResults([]);
      setSearchError("");
      setSearchingTracks(false);
      setSearchOpen(Boolean(searchAnchor));
      return undefined;
    }

    let cancelled = false;
    setSearchingTracks(true);
    setSearchError("");

    const handle = setTimeout(async () => {
      try {
        const rawResults = await searchTracks(trimmed);
        if (cancelled) {
          return;
        }
        const seen = new Set();
        const normalized = rawResults
          .map((track) => normalizeSearchTrack(track))
          .filter((option) => {
            if (!option) {
              return false;
            }
            if (existingTrackIds.has(option.id)) {
              return false;
            }
            if (seen.has(option.id)) {
              return false;
            }
            seen.add(option.id);
            return true;
          });
        setTrackSearchResults(normalized);
        setSearchOpen(Boolean(searchAnchor));
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to search for tracks", err);
          setTrackSearchResults([]);
          setSearchError(err?.message ?? "Unable to search tracks.");
        }
      } finally {
        if (!cancelled) {
          setSearchingTracks(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [trackSearchTerm, existingTrackIds, searchAnchor]);

  const handleToggleEditModal = () => {
    if (!isOwner) {
      return;
    }
    const trimmed = trackSearchTerm.trim();
    if (trimmed) {
      setSearchAnchor("modal");
      setSearchOpen(true);
    } else {
      setSearchAnchor(null);
      setSearchOpen(false);
    }
    setDetailsDirty(computeDetailsDirty(editTitle, editDescription));
    setShowEditModal(true);
  };

  const handleSaveDetails = useCallback(async () => {
    if (!playlistId) {
      return;
    }

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setActionError("Playlist title is required.");
      setActionMessage("");
      return;
    }

    setActionError("");
    setActionMessage("");
    setUpdatingDetails(true);

    try {
      const normalizedDescription = editDescription.trim();
      const payload = {
        title: trimmedTitle,
        description: normalizedDescription.length ? normalizedDescription : null
      };
      await updatePlaylist(playlistId, payload);
      const detail = await fetchPlaylistDetail(playlistId);
      applyDetail(detail, { force: true });
      setActionMessage("Playlist details updated.");
    } catch (err) {
      console.error("Failed to update playlist", err);
      const serverMessage = err?.response?.data?.title ?? err?.response?.data?.detail ?? err?.response?.data;
      setActionError(typeof serverMessage === "string" && serverMessage.trim().length ? serverMessage : err?.message ?? "Unable to update playlist.");
    } finally {
      setUpdatingDetails(false);
    }
  }, [playlistId, editTitle, editDescription, applyDetail]);

  const addRemovingFlag = useCallback((trackId) => {
    setRemovingTrackIds((prev) => {
      const next = new Set(prev);
      next.add(trackId);
      return next;
    });
  }, []);

  const removeRemovingFlag = useCallback((trackId) => {
    setRemovingTrackIds((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
  }, []);

  const handleRemoveTrackFromPlaylist = async (trackId) => {
    if (!playlistId || !trackId) {
      return;
    }

    setActionError("");
    setActionMessage("");
    addRemovingFlag(trackId);

    try {
      await removeTrackFromPlaylist(playlistId, trackId);
      const detail = await fetchPlaylistDetail(playlistId);
      applyDetail(detail);
      setActionMessage("Track removed.");
    } catch (err) {
      console.error("Failed to remove track from playlist", err);
      const serverMessage = err?.response?.data?.title ?? err?.response?.data?.detail ?? err?.response?.data;
      setActionError(typeof serverMessage === "string" && serverMessage.trim().length ? serverMessage : err?.message ?? "Unable to remove track.");
    } finally {
      removeRemovingFlag(trackId);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistId) {
      return;
    }

    setActionError("");
    setActionMessage("");
    setDeletingPlaylist(true);

    try {
      await deletePlaylist(playlistId);
      setActionMessage("Playlist deleted.");
      handleCloseEditModal();
      navigate("/profile?tab=playlists");
    } catch (err) {
      console.error("Failed to delete playlist", err);
      const serverMessage = err?.response?.data?.title ?? err?.response?.data?.detail ?? err?.response?.data;
      setActionError(typeof serverMessage === "string" && serverMessage.trim().length ? serverMessage : err?.message ?? "Unable to delete playlist.");
    } finally {
      setDeletingPlaylist(false);
    }
  };


  const queue = useMemo(() => {
    if (!Array.isArray(tracks)) {
      return [];
    }
    return tracks
      .filter((track) => typeof track.trackId === "number")
      .map((track) => ({
        id: track.trackId,
        title: track.title,
        artistName: track.artist,
        artistId: track.artistId ?? null,
        audioUrl: track.audioUrl ?? null,
        coverUrl: track.coverUrl ?? null,
        durationSeconds: track.durationSeconds ?? null
      }));
  }, [tracks]);

  const playlistTitle = playlist?.title ?? "Untitled playlist";
  const playlistCover = (tracks[0]?.coverUrl) || playlist?.coverUrl || FALLBACK_PLAYLIST_COVER;
  const playlistIsPrivate = playlist?.isPrivate ?? false;
  const totalDurationSeconds = useMemo(
    () => tracks.reduce((total, track) => total + (Number(track.durationSeconds) || 0), 0),
    [tracks]
  );
  const updatedLabel = formatRelativeDate(playlist?.createdAt);
  const isQueueEmpty = queue.length === 0;
  const trimmedSearchTerm = trackSearchTerm.trim();
  const trimmedTitleForEdit = editTitle.trim();
  const showSearchHint = trimmedSearchTerm.length > 0 && trimmedSearchTerm.length < MIN_SEARCH_LENGTH;
  const showNoResults = trimmedSearchTerm.length >= MIN_SEARCH_LENGTH && !searchingTracks && !searchError && trackSearchResults.length === 0;
  const canSaveDetails = detailsDirty && trimmedTitleForEdit.length > 0 && !updatingDetails;

  const isCurrentTrackInPlaylist = useMemo(
    () => Boolean(currentTrack && tracks.some((track) => track.trackId === currentTrack.id)),
    [currentTrack, tracks]
  );
  const isPlaylistPlaying = isCurrentTrackInPlaylist && isPlaying;

  const handlePlayAll = async () => {
    if (isCurrentTrackInPlaylist) {
      try {
        await togglePlay();
        setActionMessage(isPlaylistPlaying ? "Paused." : "Playing playlist.");
      } catch (err) {
        console.error("Failed to toggle playlist playback", err);
        setActionError(err?.message ?? "Unable to control playback");
      }
      return;
    }

    if (!queue.length) {
      return;
    }

    setActionError("");
    setActionMessage("");

    try {
      await playTrack(queue[0], { queue });
      setActionMessage(`Playing ${playlistTitle}.`);
    } catch (err) {
      console.error("Failed to play playlist", err);
      setActionError(err?.message ?? "Unable to start playlist playback");
    }
  };

  const handlePlayTrack = async (trackSummary) => {
    if (!trackSummary) {
      return;
    }

    setActionError("");
    setActionMessage("");

    const descriptor = {
      id: trackSummary.trackId,
      title: trackSummary.title,
      artistName: trackSummary.artist,
      artistId: trackSummary.artistId ?? null,
      audioUrl: trackSummary.audioUrl ?? null,
      coverUrl: trackSummary.coverUrl ?? null,
      durationSeconds: trackSummary.durationSeconds ?? null
    };

    if (currentTrack && currentTrack.id === descriptor.id) {
      try {
        await togglePlay();
      } catch (err) {
        console.error("Failed to toggle playback", err);
        setActionError(err?.message ?? "Unable to control playback");
      }
      return;
    }

    try {
      const fallbackQueue = queue.length ? queue : [descriptor];
      await playTrack(descriptor, { queue: fallbackQueue });
      setActionMessage(`Playing ${trackSummary.title}.`);
    } catch (err) {
      console.error("Failed to play track", err);
      setActionError(err?.message ?? "Unable to play track");
    }
  };

  const handleAddTrackToPlaylist = async (trackOption) => {
    if (!playlistId || !trackOption || !trackOption.id) {
      return;
    }

    setActionError("");
    setActionMessage("");
    setAddingTrackId(trackOption.id);

    try {
      await addTrackToPlaylist(playlistId, trackOption.id);
      const detail = await fetchPlaylistDetail(playlistId);
      applyDetail(detail);
      setActionMessage(`Added "${trackOption.title}" to the playlist.`);
      setTrackSearchTerm("");
      setTrackSearchResults([]);
      setSearchOpen(false);
      setSearchAnchor(null);
    } catch (err) {
      console.error("Failed to add track to playlist", err);
      setActionError(err?.message ?? "Unable to add track to playlist.");
    } finally {
      setAddingTrackId(null);
    }
  };

  return (
    <div className="playlist-page">
      <Header />
      <main className="playlist-page__main">
        <div className="playlist-page__container">
          {loading && (
            <div style={{ color: "#bbb" }}>Loading playlist…</div>
          )}
          {!loading && error && (
            <div style={{ color: "#ff8a8a", marginBottom: 16 }}>{error}</div>
          )}
          {!loading && !error && playlist && (
            <div className="playlist-layout">
              <section className="playlist-hero">
                <div className="playlist-hero__art">
                  <img
                    src={playlistCover}
                    alt="Playlist cover"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="playlist-hero__meta">
                  <div>
                    <div className="playlist-hero__label">Playlist</div>
                    <h1 className="playlist-hero__title">{playlistTitle}</h1>
                    <div className="playlist-hero__stats">
                      <span>{playlist.trackCount ?? tracks.length} tracks</span>
                      <span>•</span>
                      <span>{formatRuntime(totalDurationSeconds)}</span>
                      {updatedLabel && (
                        <>
                          <span>•</span>
                          <span>Updated {updatedLabel}</span>
                        </>
                      )}
                      {playlistIsPrivate && (
                        <>
                          <span>•</span>
                          <span className="playlist-hero__private">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  {owner && (
                    <div className="playlist-owner">
                      <div className="playlist-owner__avatar">
                        <img
                          src={owner.avatar_url || FALLBACK_PLAYLIST_COVER}
                          alt="Owner avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <button
                        type="button"
                        className="playlist-owner__link"
                        onClick={() => navigate(`/profile/${owner.username}`)}
                      >
                        {owner.full_name ?? owner.username}
                      </button>
                    </div>
                  )}
                  <div className="playlist-hero__controls">
                    <button
                      type="button"
                      onClick={handlePlayAll}
                      disabled={isQueueEmpty}
                      className={`playlist-hero__play${isPlaylistPlaying ? " playlist-hero__play--active" : ""}`}
                      aria-label={isPlaylistPlaying ? "Pause playlist" : "Play playlist"}
                      title={isPlaylistPlaying ? "Pause playlist" : "Play playlist"}
                    >
                      <img
                        src={isPlaylistPlaying ? playIcon : pauseIcon}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={handleToggleEditModal}
                        className="playlist-hero__edit"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {playlist.description && (
                <section className="playlist-description">
                  <div className="playlist-section__label">Description</div>
                  <p>{playlist.description}</p>
                </section>
              )}

              <section className="playlist-tracklist">
                <div className="playlist-tracklist__surface">
                  <header className="playlist-tracklist__header">
                    <span>#</span>
                    <span>Title</span>
                    <span>Artist</span>
                    <div className="playlist-tracklist__header-stats">
                      <span>Plays</span>
                      <span>Time</span>
                    </div>
                  </header>
                  <div className="playlist-tracklist__body">
                    {tracks.map((trackSummary, idx) => {
                      const isCurrent = currentTrack?.id === trackSummary.trackId;
                      return (
                        <button
                          key={trackSummary.trackId ?? `${trackSummary.title}-${idx}`}
                          type="button"
                          onClick={() => handlePlayTrack(trackSummary)}
                          className={`playlist-tracklist__row${isCurrent ? " playlist-tracklist__row--current" : ""}`}
                        >
                          <span className="playlist-tracklist__index">{idx + 1}</span>
                          <div className="playlist-tracklist__titleBlock">
                            <div className="playlist-tracklist__cover">
                              <img
                                src={trackSummary.coverUrl || playlistCover}
                                alt="Track cover"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                            <div className="playlist-tracklist__text">
                              <span className="playlist-tracklist__trackTitle">{trackSummary.title}</span>
                              <span className="playlist-tracklist__artistMobile">{trackSummary.artist ?? "Unknown"}</span>
                            </div>
                          </div>
                          <span className="playlist-tracklist__artistCol">{trackSummary.artist ?? "Unknown"}</span>
                          <div className="playlist-tracklist__stats">
                            <span className="playlist-tracklist__plays">{formatCount(trackSummary.plays)}</span>
                            <span className="playlist-tracklist__duration">{formatClock(trackSummary.durationSeconds)}</span>
                          </div>
                        </button>
                      );
                    })}
                    {!tracks.length && (
                      <div className="playlist-empty">
                        {isOwner ? (
                          <div className="playlist-empty__panel">
                            <div>
                              <div className="playlist-empty__title">Add tracks to start this playlist</div>
                              <div className="playlist-empty__copy">Search the catalog for public tracks and add them instantly.</div>
                            </div>
                            <div ref={setMainSearchRef} className="playlist-empty__search">
                              <input
                                type="text"
                                value={trackSearchTerm}
                                onChange={(event) => setTrackSearchTerm(event.target.value)}
                                onFocus={() => {
                                  setSearchAnchor("main");
                                  if (trimmedSearchTerm.length > 0) {
                                    setSearchOpen(true);
                                  }
                                }}
                                placeholder="Search for tracks"
                                className="playlist-searchInput"
                                disabled={addingTrackId !== null}
                              />
                              {searchOpen && searchAnchor === "main" && (
                                <div className="playlist-searchResults">
                                  {showSearchHint && (
                                    <div className="playlist-searchResults__hint">
                                      Type at least {MIN_SEARCH_LENGTH} characters to search.
                                    </div>
                                  )}
                                  {searchingTracks && (
                                    <div className="playlist-searchResults__hint">Searching…</div>
                                  )}
                                  {searchError && (
                                    <div className="playlist-searchResults__error">{searchError}</div>
                                  )}
                                  {!showSearchHint && !searchingTracks && !searchError && trackSearchResults.map((option) => (
                                    <div
                                      key={`search-track-${option.id}`}
                                      className="playlist-searchResults__row"
                                    >
                                      <div>
                                        <span className="playlist-searchResults__title">{option.title}</span>
                                        {option.artist && (
                                          <span className="playlist-searchResults__artist">{option.artist}</span>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleAddTrackToPlaylist(option)}
                                        disabled={addingTrackId === option.id}
                                        className="playlist-searchResults__add"
                                      >
                                        {addingTrackId === option.id ? "Adding…" : "Add"}
                                      </button>
                                    </div>
                                  ))}
                                  {showNoResults && searchAnchor === "main" && (
                                    <div className="playlist-searchResults__hint">
                                      No public tracks found for "{trimmedSearchTerm}".
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="playlist-empty__hint">
                              Tracks you already added will disappear from these results.
                            </div>
                          </div>
                        ) : (
                          <div className="playlist-empty__message">
                            This playlist does not have any tracks yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {actionMessage && (
                <div style={{ color: "#66e0a3" }}>{actionMessage}</div>
              )}
              {actionError && (
                <div style={{ color: "#ff8a8a" }}>{actionError}</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {showEditModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3000,
          padding: 24
        }}>
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#1b1b1b",
              border: "1px solid #2a2a2a",
              borderRadius: 18,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              color: "#f5f5f5"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Manage playlist</h2>
              <button
                type="button"
                onClick={handleCloseEditModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#b5b5b5",
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1.6, color: "#9d9d9d", marginBottom: 8 }}>Playlist details</div>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>Title</span>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => handleEditTitleChange(event.target.value)}
                      placeholder="Playlist title"
                      maxLength={120}
                      disabled={updatingDetails || deletingPlaylist}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #2d2d2d",
                        background: "#151515",
                        color: "#f5f5f5",
                        fontSize: 14
                      }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}>Description</span>
                    <textarea
                      value={editDescription}
                      onChange={(event) => handleEditDescriptionChange(event.target.value)}
                      placeholder="Add some context for listeners"
                      rows={4}
                      maxLength={500}
                      disabled={updatingDetails || deletingPlaylist}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #2d2d2d",
                        background: "#151515",
                        color: "#f5f5f5",
                        fontSize: 14,
                        resize: "vertical"
                      }}
                    />
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    disabled={!canSaveDetails}
                    style={{
                      background: canSaveDetails ? "#ff5500" : "#3a3a3a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 999,
                      padding: "8px 22px",
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      cursor: canSaveDetails ? "pointer" : "not-allowed"
                    }}
                  >
                    {updatingDetails ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1.6, color: "#9d9d9d", marginBottom: 8 }}>Add tracks</div>
                <div ref={setModalSearchRef} style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={trackSearchTerm}
                    onChange={(event) => setTrackSearchTerm(event.target.value)}
                    onFocus={() => {
                      setSearchAnchor("modal");
                      if (trimmedSearchTerm.length > 0) {
                        setSearchOpen(true);
                      }
                    }}
                    placeholder="Search for tracks"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #2d2d2d",
                      background: "#151515",
                      color: "#f5f5f5",
                      fontSize: 14
                    }}
                    disabled={addingTrackId !== null}
                  />
                  {searchOpen && searchAnchor === "modal" && (
                    <div style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "#121212",
                      border: "1px solid #2d2d2d",
                      borderRadius: 12,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      maxHeight: 280,
                      overflowY: "auto",
                      zIndex: 3200
                    }}>
                      {showSearchHint && (
                        <div style={{ fontSize: 12, color: "#9d9d9d" }}>
                          Type at least {MIN_SEARCH_LENGTH} characters to search.
                        </div>
                      )}
                      {searchingTracks && (
                        <div style={{ fontSize: 12, color: "#9d9d9d" }}>Searching…</div>
                      )}
                      {searchError && (
                        <div style={{ fontSize: 12, color: "#ff9090" }}>{searchError}</div>
                      )}
                      {!showSearchHint && !searchingTracks && !searchError && trackSearchResults.length > 0 && trackSearchResults.map((option) => (
                        <div
                          key={`modal-search-track-${option.id}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#181818",
                            border: "1px solid #2c2c2c"
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 14, color: "#f5f5f5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{option.title}</span>
                            {option.artist && (
                              <span style={{ fontSize: 12, color: "#a3a3a3" }}>{option.artist}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddTrackToPlaylist(option)}
                            disabled={addingTrackId === option.id}
                            style={{
                              background: addingTrackId === option.id ? "#3a3a3a" : "#ff5500",
                              color: "#fff",
                              border: "none",
                              borderRadius: 999,
                              padding: "6px 18px",
                              fontWeight: 600,
                              cursor: addingTrackId === option.id ? "default" : "pointer"
                            }}
                          >
                            {addingTrackId === option.id ? "Adding…" : "Add"}
                          </button>
                        </div>
                      ))}
                      {!showSearchHint && !searchingTracks && !searchError && searchAnchor === "modal" && !trimmedSearchTerm.length && (
                        <div style={{ fontSize: 12, color: "#9d9d9d" }}>Start typing to search.</div>
                      )}
                      {showNoResults && searchAnchor === "modal" && (
                        <div style={{ fontSize: 12, color: "#8d8d8d" }}>No public tracks found for "{trimmedSearchTerm}".</div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#8d8d8d" }}>
                  Tracks you already added will disappear from these results.
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 320, overflowY: "auto" }}>
                {tracks.length ? (
                  tracks.map((track, index) => {
                    const removing = removingTrackIds.has(track.trackId);
                    return (
                      <div
                        key={`manage-track-${track.trackId}-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 14px",
                          border: "1px solid #2d2d2d",
                          borderRadius: 12,
                          background: "#181818"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                          <span style={{ color: "#8d8d8d", fontSize: 13, width: 24 }}>{index + 1}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                            <span style={{ color: "#f5f5f5", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.title}</span>
                            <span style={{ color: "#a7a7a7", fontSize: 12 }}>{track.artist ?? "Unknown"}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrackFromPlaylist(track.trackId)}
                          disabled={removing || deletingPlaylist}
                          style={{
                            background: removing ? "#3a3a3a" : "#ff7a7a",
                            border: "none",
                            color: "#fff",
                            borderRadius: 999,
                            padding: "6px 18px",
                            fontWeight: 600,
                            cursor: removing || deletingPlaylist ? "not-allowed" : "pointer"
                          }}
                        >
                          {removing ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: "#9c9c9c", fontSize: 14 }}>This playlist does not have any tracks yet.</div>
                )}
              </div>
            </div>
            {(actionError || actionMessage) && (
              <div style={{ fontSize: 13, color: actionError ? "#ff8a8a" : "#66e0a3" }}>
                {actionError || actionMessage}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleDeletePlaylist}
                disabled={deletingPlaylist}
                style={{
                  background: deletingPlaylist ? "#3a3a3a" : "#ff3b3b",
                  border: "none",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "10px 22px",
                  fontWeight: 600,
                  cursor: deletingPlaylist ? "not-allowed" : "pointer"
                }}
              >
                {deletingPlaylist ? "Deleting…" : "Delete playlist"}
              </button>
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={deletingPlaylist}
                style={{
                  background: "transparent",
                  border: "1px solid #363636",
                  color: "#f5f5f5",
                  borderRadius: 999,
                  padding: "8px 20px",
                  fontWeight: 600,
                  cursor: deletingPlaylist ? "not-allowed" : "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
