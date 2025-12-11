import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cover from './Cover';
import { fetchHomeSidebar } from '../../api/home';
import { usePlayer } from '../../context/PlayerContext';

const toCamelKey = (key) => key
  .replace(/[_-](\w)/g, (_, char) => char.toUpperCase())
  .replace(/^[A-Z]/, (char) => char.toLowerCase());

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

const Choice = () => {
  const carouselRef = React.useRef(null);
  const navigate = useNavigate();
  const player = usePlayer();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
  }, []);

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
      gap: '12px'
    }}>
      <p style={{
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0,
        paddingLeft: '16px'
      }}>Recently Played</p>
      <div style={{
        width: '100%',
        minHeight: '264px',
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
            opacity: hasItems ? 1 : 0.4
          }}
          type="button"
        >
          ‹
        </button>

        <div
          ref={carouselRef}
          style={{
            display: 'flex',
            gap: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
            overflowX: 'scroll',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="carousel-container"
        >
          {loading ? (
            <div style={{ color: '#bbb', fontSize: '14px' }}>Loading…</div>
          ) : hasItems ? (
            items.map((item) => (
              <Cover
                key={`${item.type}-${item.id ?? 'unknown'}-${item.playedAt ?? 'na'}`}
                imageUrl={item.imageUrl}
                title={item.title}
                subtitle={item.subtitle}
                badge={item.badge}
                onClick={handleItemAction(item)}
              />
            ))
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
            opacity: hasItems ? 1 : 0.4
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