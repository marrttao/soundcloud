import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cover from './Cover';
import { fetchHomeSidebar } from '../../api/home';
import { usePlayer } from '../../context/PlayerContext';
import useBreakpoint from '../../hooks/useBreakpoint';

const toCamelKey = (key) => key
  .replace(/[_-](\w)/g, (_, char) => char.toUpperCase())
  .replace(/^[A-Z]/, (char) => char.toLowerCase());

const FALLBACK_AVATAR = 'https://i.imgur.com/6unG5jv.png';

const deepCamel = (input) => {
  if (Array.isArray(input)) {
    return input.map(deepCamel);
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  return Object.entries(input).reduce((acc, [key, value]) => {
    const camelKey = typeof key === 'string' ? toCamelKey(key) : key;
    acc[camelKey] = deepCamel(value);
    return acc;
  }, {});
};

const normalizeRelativeTime = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
};

const coerceNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalizeHistoryEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const trackId = entry.trackId ?? entry.track_id ?? entry.TrackId ?? entry.Track_id ?? null;
  const playlistId = entry.playlistId ?? entry.playlist_id ?? entry.PlaylistId ?? entry.Playlist_id ?? null;

  if (trackId) {
    const artistName = entry.artist ?? entry.Artist ?? '';
    const playedAt = entry.playedAt ?? entry.played_at ?? entry.PlayedAt ?? entry.Played_at ?? null;
    return {
      id: trackId,
      type: 'track',
      title: entry.title ?? entry.Title ?? 'Untitled track',
      subtitle: [artistName, normalizeRelativeTime(playedAt)].filter(Boolean).join(' • '),
      badge: 'Track',
      imageUrl: entry.coverUrl ?? entry.cover_url ?? entry.CoverUrl ?? entry.Cover_url ?? entry.artistAvatar ?? entry.artist_avatar ?? entry.ArtistAvatar ?? entry.Artist_avatar ?? null,
      playedAt,
      descriptor: {
        id: trackId,
        title: entry.title ?? entry.Title ?? 'Untitled track',
        artistName,
        artistId: entry.artistId ?? entry.artist_id ?? entry.ArtistId ?? entry.Artist_id ?? null,
        durationSeconds: entry.durationSeconds ?? entry.duration_seconds ?? entry.DurationSeconds ?? entry.Duration_seconds ?? null,
        coverUrl: entry.coverUrl ?? entry.cover_url ?? entry.CoverUrl ?? entry.Cover_url ?? entry.artistAvatar ?? entry.artist_avatar ?? entry.ArtistAvatar ?? entry.Artist_avatar ?? null,
        audioUrl: entry.audioUrl ?? entry.audio_url ?? entry.AudioUrl ?? entry.Audio_url ?? null,
        plays: coerceNumber(entry.plays ?? entry.playsCount ?? entry.plays_count ?? entry.Plays ?? entry.PlaysCount ?? entry.Plays_count, 0),
        likes: coerceNumber(entry.likes ?? entry.likesCount ?? entry.likes_count ?? entry.Likes ?? entry.LikesCount ?? entry.Likes_count, 0)
      }
    };
  }

  if (playlistId) {
    const owner = entry.owner ?? entry.Owner ?? '';
    const playedAt = entry.playedAt ?? entry.played_at ?? entry.PlayedAt ?? entry.Played_at ?? null;
    return {
      id: playlistId,
      type: 'playlist',
      title: entry.title ?? entry.Title ?? 'Untitled playlist',
      subtitle: [owner, normalizeRelativeTime(playedAt)].filter(Boolean).join(' • '),
      badge: 'Playlist',
      imageUrl: entry.coverUrl ?? entry.cover_url ?? entry.CoverUrl ?? entry.Cover_url ?? null,
      playedAt,
      descriptor: {
        id: playlistId
      }
    };
  }

  return null;
};

const formatCount = (value = 0) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toString();
};

const normalizeCustomTrack = (track = {}) => {
  const id = track.trackId ?? track.id ?? track.track_id ?? null;
  if (!id) {
    return null;
  }
  const artistName = track.artist ?? track.artist_name ?? track.artistName ?? 'Unknown artist';
  const cover = track.coverUrl ?? track.cover_url ?? track.artistAvatar ?? track.artist_avatar ?? FALLBACK_AVATAR;
  const plays = coerceNumber(track.plays ?? track.playsCount ?? track.plays_count ?? track.likes ?? 0, 0);
  return {
    id,
    type: 'track',
    title: track.title ?? 'Untitled track',
    subtitle: `${artistName} • ${formatCount(plays)} plays`,
    badge: 'Liked Track',
    imageUrl: cover,
    descriptor: {
      id,
      title: track.title ?? 'Untitled track',
      artistName,
      artistId: track.artistId ?? track.artist_id ?? null,
      durationSeconds: track.duration ?? track.durationSeconds ?? track.duration_seconds ?? null,
      coverUrl: cover,
      audioUrl: track.audioUrl ?? track.audio_url ?? null
    }
  };
};

const normalizeCustomArtist = (artist = {}) => {
  const identifier = artist.username ?? artist.Username ?? artist.id ?? artist.Id ?? null;
  if (!identifier) {
    return null;
  }
  return {
    id: identifier,
    type: 'artist',
    title: artist.displayName ?? artist.display_name ?? artist.username ?? artist.Username ?? 'Artist',
    username: artist.username ?? artist.Username ?? artist.handle ?? null,
    subtitle: `${formatCount(artist.followers ?? artist.Followers ?? 0)} followers • ${formatCount(artist.tracks ?? artist.Tracks ?? 0)} tracks`,
    badge: 'Artist',
    imageUrl: artist.avatarUrl ?? artist.avatar_url ?? FALLBACK_AVATAR
  };
};

const buildCustomItems = (tracks = [], artists = []) => {
  const artistItems = (artists ?? []).map(normalizeCustomArtist).filter(Boolean);
  const trackItems = (tracks ?? []).map(normalizeCustomTrack).filter(Boolean);
  return [...artistItems, ...trackItems];
};

const Choice = ({
  title = 'Recently Played',
  dataSource = 'home',
  customTracks,
  customArtists,
  customLoading = false
}) => {
  const carouselRef = React.useRef(null);
  const navigate = useNavigate();
  const player = usePlayer();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const isMobile = useBreakpoint(640);
  const usingCustomData = dataSource === 'custom';

  React.useEffect(() => {
    if (!usingCustomData) {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        try {
          const rawData = await fetchHomeSidebar();
          const data = deepCamel(rawData ?? {});
          const history = Array.isArray(data?.history) ? data.history : [];
          const normalized = history
            .map(normalizeHistoryEntry)
            .filter((item) => item && (item.id || item.descriptor?.id));
          if (mounted) {
            setItems(normalized);
          }
        } catch (error) {
          console.error('Failed to load recently played items', error);
          if (mounted) {
            setItems([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      load();
      return () => {
        mounted = false;
      };
    }
    return undefined;
  }, [usingCustomData]);

  React.useEffect(() => {
    if (!usingCustomData) {
      return;
    }
    if (customLoading) {
      setLoading(true);
      return;
    }
    const mapped = buildCustomItems(customTracks ?? [], customArtists ?? []);
    setItems(mapped);
    setLoading(false);
  }, [usingCustomData, customTracks, customArtists, customLoading]);

  const queueDescriptors = React.useMemo(() => (
    items.filter((item) => item.type === 'track' && item.descriptor?.id).map((item) => ({
      id: item.descriptor.id,
      title: item.descriptor.title,
      artistName: item.descriptor.artistName,
      artistId: item.descriptor.artistId,
      durationSeconds: item.descriptor.durationSeconds,
      coverUrl: item.descriptor.coverUrl,
      audioUrl: item.descriptor.audioUrl
    }))
  ), [items]);

  const handleItemAction = React.useCallback((item) => async () => {
    if (!item) {
      return;
    }
    if (item.type === 'track' && item.descriptor?.id) {
      const fallbackNavigate = () => navigate(`/tracks/${item.descriptor.id}`);
      if (player?.playTrack && item.descriptor.audioUrl) {
        const trackIndex = queueDescriptors.findIndex((track) => track.id === item.descriptor.id);
        const startIndex = trackIndex >= 0 ? trackIndex : 0;
        try {
          await player.playTrack({
            id: item.descriptor.id,
            title: item.descriptor.title,
            artistName: item.descriptor.artistName,
            artistId: item.descriptor.artistId,
            audioUrl: item.descriptor.audioUrl,
            coverUrl: item.descriptor.coverUrl,
            durationSeconds: item.descriptor.durationSeconds
          }, {
            queue: queueDescriptors,
            startIndex
          });
          return;
        } catch (error) {
          console.error('Failed to start playback from carousel', error);
        }
      }
      fallbackNavigate();
      return;
    }

    if (item.type === 'playlist' && item.id) {
      navigate(`/playlists/${item.id}`);
    }

    if (item.type === 'artist') {
      const username = item.username ?? item.id;
      if (username) {
        navigate(`/profile/${encodeURIComponent(username)}`);
      }
    }
  }, [navigate, player, queueDescriptors]);

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const itemWidth = 192 + 16;
    const visibleItems = Math.floor(container.clientWidth / itemWidth) || 1;
    const scrollDistance = itemWidth * Math.max(1, visibleItems - 1);
    const target = Math.max(0, container.scrollLeft - scrollDistance);
    container.scrollTo({ left: target, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const itemWidth = 192 + 16;
    const visibleItems = Math.floor(container.clientWidth / itemWidth) || 1;
    const scrollDistance = itemWidth * Math.max(1, visibleItems - 1);
    const maxScroll = container.scrollWidth - container.clientWidth;
    const target = Math.min(maxScroll, container.scrollLeft + scrollDistance);
    container.scrollTo({ left: target, behavior: 'smooth' });
  };

  const hasItems = items.length > 0;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '8px' : '12px'
    }}>
      <p style={{
        color: '#fff',
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: 'bold',
        margin: 0,
        paddingLeft: 0,
        textAlign: isMobile ? 'center' : 'left'
      }}>{title}</p>
      <div style={{
        width: '100%',
        minHeight: isMobile ? '220px' : '264px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <button
          onClick={scrollLeft}
          disabled={!hasItems}
          style={{
            position: 'absolute',
            left: '10px',
            zIndex: 10,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            border: 'none',
            color: '#fff',
            cursor: hasItems ? 'pointer' : 'not-allowed',
            fontSize: '18px',
            opacity: hasItems ? 1 : 0.4,
            display: isMobile ? 'none' : 'flex'
          }}
          type="button"
        >
          ‹
        </button>

        <div
          ref={carouselRef}
          style={{
            display: 'flex',
            gap: isMobile ? '12px' : '16px',
            paddingLeft: isMobile ? '8px' : '0px',
            paddingRight: isMobile ? '8px' : '16px',
            overflowX: 'scroll',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: isMobile ? 'x mandatory' : 'none',
            justifyContent: !isMobile ? 'center' : 'flex-start'
          }}
          className="carousel-container"
        >
          {loading ? (
            <div style={{ color: '#bbb', fontSize: '14px' }}>Loading…</div>
          ) : hasItems ? (
            (() => {
              // 880px width, item 192px + 16px gap, 4 items visible (4*192+3*16=832, fits with padding)
              const maxDesktopItems = isMobile ? items.length : 4;
              const filled = items.slice(0, maxDesktopItems);
              const emptyCount = isMobile ? 0 : Math.max(0, 4 - filled.length);
              return [
                ...filled.map((item) => (
                  <Cover
                    key={`${item.type}-${item.id ?? 'unknown'}-${item.playedAt ?? 'na'}`}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    subtitle={item.subtitle}
                    badge={item.badge}
                    onClick={handleItemAction(item)}
                  />
                )),
                ...Array.from({ length: emptyCount }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      width: 192,
                      height: 208,
                      borderRadius: 12,
                      background: '#202020',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#444',
                      fontSize: 13,
                      fontWeight: 400,
                      border: '1.5px dashed #292929',
                      flexShrink: 0,
                      opacity: 0.7,
                      boxSizing: 'border-box',
                      padding: '16px'
                    }}
                  >
                    <div style={{
                      width: 160,
                      height: 160,
                      borderRadius: 8,
                      background: '#232323',
                      marginBottom: 12,
                    }} />
                    <span style={{textAlign:'center',lineHeight:1.3}}>Not played yet</span>
                  </div>
                ))
              ];
            })()
          ) : (
            <div style={{ color: '#777', fontSize: '14px' }}>You have not played anything yet.</div>
          )}
        </div>

        <button
          onClick={scrollRight}
          disabled={!hasItems}
          style={{
            position: 'absolute',
            right: '10px',
            zIndex: 10,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            border: 'none',
            color: '#fff',
            cursor: hasItems ? 'pointer' : 'not-allowed',
            fontSize: '18px',
            opacity: hasItems ? 1 : 0.4,
            display: isMobile ? 'none' : 'flex'
          }}
          type="button"
        >
          ›
        </button>
      </div>
      <style>{`
        .carousel-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Choice;