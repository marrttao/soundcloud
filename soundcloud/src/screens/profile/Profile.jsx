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

const Profile = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const tabWhitelist = useMemo(() => new Set(["popular", "tracks", "playlists", "likes", "following"]), []);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tabParam = (searchParams.get("tab") ?? "").toLowerCase();
  const activeTab = tabWhitelist.has(tabParam) ? tabParam : "all";
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

  // Получить профиль текущего пользователя для сравнения
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const data = await fetchProfile();
        setCurrentUserProfile(data?.profile);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setError(err?.message ?? "Unable to load profile.");
      }
    };
    getCurrentUser();
  }, []);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (username) {
        try {
          data = await fetchProfileByUsername(username);
        } catch (err) {
          const normalized = username.toLowerCase();
          const status = err?.response?.status;
          if (status === 404 && tabWhitelist.has(normalized)) {
            data = await fetchProfile();
            if (!location.search) {
              const canonical = normalized === "all" ? "/profile" : `/profile?tab=${normalized}`;
              navigate(canonical, { replace: true });
            }
          } else {
            throw err;
          }
        }
      } else {
        data = await fetchProfile();
      }

      setProfileData(data);
      setError("");
    } catch (err) {
      setError(err?.response?.data ?? err?.message ?? "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [location.search, navigate, tabWhitelist, username]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Проверка является ли это своим профилем
  const isOwnProfile = !username || (currentUserProfile && profileData?.profile?.username === currentUserProfile?.username);
  const tracks = profileData?.tracks ?? [];
  const playlists = profileData?.playlists ?? [];
  const likedTracks = profileData?.likes ?? [];

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
        return <UserTracks tracks={likedTracks} loading={loading} title="Liked Tracks" />;
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#141414",
      display: "flex",
      flexDirection: "column"
    }}>
      <Header avatarUrl={currentUserProfile?.avatar_url} />
      <div style={{
        marginTop: 56,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 16px",
        boxSizing: "border-box",
        gap: 32
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
          />
        </div>
        <div style={{ width: "100%", maxWidth: 1240, display: "flex", alignItems: "flex-start", gap: 32 }}>
          <div style={{ width: "100%", maxWidth: 880, flexShrink: 0 }}>
            {renderMainContent()}
          </div>
          <div style={{ width: 360, flexShrink: 0 }}>
            <SideBar
              stats={profileData?.stats}
              likes={profileData?.likes}
              following={profileData?.following}
              loading={loading}
            />
          </div>
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
          availableTracks={tracks}
        />
      )}
    </div>
  );
};

export default Profile;
