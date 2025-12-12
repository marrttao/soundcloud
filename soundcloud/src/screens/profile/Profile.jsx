import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import SideBar from "./SideBar.jsx";
import Banner from "./Banner.jsx";
import ProfileSetupModal from "../main/ProfileSetupModal";
import CreatePlaylistModal from "./CreatePlaylistModal.jsx";
import { fetchProfile, fetchProfileByUsername } from "../../api/profile";
import UserTracks from "./UserTracks.jsx";
import UserPlaylists from "./UserPlaylists.jsx";
import { useCurrentProfile } from "../../context/ProfileContext";
import { followArtist, unfollowArtist } from "../../api/track";
import Choice from "../main/Choice.jsx";
import useBreakpoint from "../../hooks/useBreakpoint";

const Profile = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const tabWhitelist = useMemo(() => new Set(["popular", "tracks", "playlists", "likes", "following"]), []);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tabParam = (searchParams.get("tab") ?? "").toLowerCase();
  const activeTab = tabWhitelist.has(tabParam) ? tabParam : "all";
  const normalizedUsername = useMemo(() => (username ?? "").toLowerCase(), [username]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [lastFetchedKey, setLastFetchedKey] = useState(null);
  const [followBusy, setFollowBusy] = useState(false);
  const { profile: currentUserProfile, refreshProfile: refreshGlobalProfile } = useCurrentProfile();
  const isMobile = useBreakpoint(768);
  const showSidebar = !isMobile;
  const headerOffset = isMobile ? 64 : 56;

  useEffect(() => {
    if (!username) {
      return;
    }
    if (tabWhitelist.has(normalizedUsername)) {
      const canonical = normalizedUsername === "all" ? "/profile" : `/profile?tab=${normalizedUsername}`;
      navigate(canonical, { replace: true });
    }
  }, [navigate, normalizedUsername, tabWhitelist, username]);

  const loadProfileData = useCallback(async ({ force = false } = {}) => {
    const profileKey = normalizedUsername || "__self__";

    if (username && tabWhitelist.has(normalizedUsername)) {
      return;
    }

    if (!force && lastFetchedKey === profileKey && profileData) {
      return;
    }

    if (lastFetchedKey !== profileKey) {
      setProfileData(null);
    }

    setLoading(true);
    setError("");
    try {
      let data;
      if (username) {
        data = await fetchProfileByUsername(username);
      } else {
        data = await fetchProfile();
      }

      setProfileData(data);
      setError("");
      setLastFetchedKey(profileKey);
    } catch (err) {
      console.error("Failed to load profile data", err);
      setError(err?.response?.data ?? err?.message ?? "Unable to load profile.");
      setLastFetchedKey(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchProfileByUsername, lastFetchedKey, normalizedUsername, profileData, tabWhitelist, username]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const refreshProfile = useCallback(() => loadProfileData({ force: true }), [loadProfileData]);

  // Проверка является ли это своим профилем
  const isOwnProfile = !username || (currentUserProfile && profileData?.profile?.username === currentUserProfile?.username);
  const tracks = profileData?.tracks ?? [];
  const playlists = profileData?.playlists ?? [];
  const likedTracks = profileData?.likes ?? [];
  const likedPlaylists = profileData?.liked_playlists ?? [];
  const targetProfileId = profileData?.profile?.id ?? null;
  const isFollowing = Boolean(profileData?.profile?.is_following);

  const renderMainContent = () => {
    switch (activeTab) {
      case "tracks":
        return <UserTracks tracks={tracks} loading={loading} title="Tracks" />;
      case "popular":
        return <UserTracks tracks={tracks} loading={loading} title="Popular Tracks" />;
      case "playlists":
        return (
          <UserPlaylists
            playlists={playlists}
            loading={loading}
            title="Playlists"
            isOwnProfile={isOwnProfile}
            onCreate={() => setShowCreatePlaylistModal(true)}
            onPlaylistClick={(playlistId) => navigate(`/playlists/${playlistId}`)}
          />
        );
      case "likes":
        return (
          <>
            <UserTracks tracks={likedTracks} loading={loading} title="Liked Tracks" />
            <UserPlaylists
              playlists={likedPlaylists}
              loading={loading}
              title="Liked Playlists"
              isOwnProfile={false}
              emptyMessage="This user has not liked playlists yet."
              onPlaylistClick={(playlistId) => navigate(`/playlists/${playlistId}`)}
            />
          </>
        );
      case "following":
        return (
          <section
            style={{
              width: "100%",
              maxWidth: 880,
              background: "#141414",
              borderRadius: 12,
              border: "1px solid #222",
              padding: 24,
              boxSizing: "border-box",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              marginBottom: 24,
              color: "#ccc",
              fontSize: 14
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 16, fontSize: 20, fontWeight: 700, color: "#fff" }}>Following</h2>
            <p style={{ margin: 0 }}>Check the sidebar to explore creators this user follows.</p>
          </section>
        );
      default:
        return (
          <>
            <UserTracks tracks={tracks} loading={loading} title="Tracks" />
            <UserPlaylists
              playlists={playlists}
              loading={loading}
              title="Playlists"
              isOwnProfile={isOwnProfile}
              onCreate={() => setShowCreatePlaylistModal(true)}
              onPlaylistClick={(playlistId) => navigate(`/playlists/${playlistId}`)}
            />
          </>
        );
    }
  };

  const handleToggleFollow = useCallback(async () => {
    if (!targetProfileId || isOwnProfile || followBusy) {
      return;
    }

    setFollowBusy(true);
    setError("");
    const shouldFollow = !isFollowing;

    try {
      if (shouldFollow) {
        await followArtist(String(targetProfileId));
      } else {
        await unfollowArtist(String(targetProfileId));
      }

      setProfileData((prev) => {
        if (!prev || !prev.profile) {
          return prev;
        }

        const baseFollowers = typeof prev?.stats?.followers === "number" ? prev.stats.followers : 0;
        const followerDelta = shouldFollow ? 1 : -1;
        const nextFollowers = Math.max(0, baseFollowers + followerDelta);

        return {
          ...prev,
          profile: { ...prev.profile, is_following: shouldFollow },
          stats: prev.stats ? { ...prev.stats, followers: nextFollowers } : prev.stats
        };
      });
    } catch (err) {
      console.error("Failed to toggle follow status", err);
      setError(err?.response?.data ?? err?.message ?? "Unable to update follow status.");
    } finally {
      setFollowBusy(false);
    }
  }, [followBusy, followArtist, unfollowArtist, isFollowing, isOwnProfile, setProfileData, targetProfileId]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#141414",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden"
    }}>
      <Header />
      <div style={{
        marginTop: headerOffset,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isMobile ? "20px 16px 120px" : "28px 16px",
        boxSizing: "border-box",
        gap: isMobile ? 24 : 32
      }}>
        {loading && !profileData && (
          <div style={{ color: "#ddd", fontSize: 14 }}>Loading profile…</div>
        )}
        {error && (
          <div style={{ color: "#ff8a8a", fontSize: 14 }}>{error}</div>
        )}
        <div style={{ width: "100%", maxWidth: 1240 }}>
          <Banner 
            profile={profileData?.profile} 
            loading={loading} 
            onEdit={() => setShowEditModal(true)} 
            isOwnProfile={isOwnProfile}
            activeTab={activeTab}
            onToggleFollow={handleToggleFollow}
            followBusy={followBusy}
            isFollowing={isFollowing}
          />
        </div>
        <div style={{
          width: "100%",
          maxWidth: 1240,
          display: "flex",
          alignItems: "flex-start",
          gap: isMobile ? 24 : 32,
          flexDirection: isMobile ? "column" : "row"
        }}>
          <div style={{ width: "100%", maxWidth: showSidebar ? 880 : "100%", flexShrink: 0 }}>
            {renderMainContent()}
          </div>
          {showSidebar ? (
            <div style={{ width: 360, flexShrink: 0 }}>
              <SideBar
                stats={profileData?.stats}
                likes={profileData?.likes}
                following={profileData?.following}
                loading={loading}
                profileRouteBase={username ? `/profile/${encodeURIComponent(username)}` : "/profile"}
              />
            </div>
          ) : (
            <div style={{ width: "100%" }}>
              <Choice
                title="Artists & tracks you might like"
                dataSource="custom"
                customTracks={profileData?.likes}
                customArtists={profileData?.following}
                customLoading={loading}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showEditModal && (
        <ProfileSetupModal
          initialValues={{
            username: profileData?.profile?.username ?? "",
            fullName: profileData?.profile?.full_name ?? "",
            bio: profileData?.profile?.bio ?? "",
            avatarUrl: profileData?.profile?.avatar_url ?? "",
            bannerUrl: profileData?.profile?.banner_url ?? ""
          }}
          title="Edit your profile"
          submitLabel="Save changes"
          showSkip={false}
          onClose={() => setShowEditModal(false)}
          onSuccess={async () => {
            setShowEditModal(false);
            await refreshProfile();
            try {
              await refreshGlobalProfile?.();
            } catch (err) {
              console.warn("Failed to refresh global profile", err);
            }
          }}
        />
      )}
      {showCreatePlaylistModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreatePlaylistModal(false)}
          onSuccess={async () => {
            setShowCreatePlaylistModal(false);
            await refreshProfile();
          }}
        />
      )}
    </div>
  );
};

export default Profile;
