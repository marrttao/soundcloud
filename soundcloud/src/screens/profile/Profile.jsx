import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import SideBar from "./SideBar.jsx";
import Banner from "./Banner.jsx";
import ProfileSetupModal from "../main/ProfileSetupModal";
import { fetchProfile, fetchProfileByUsername } from "../../api/profile";

const Profile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

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
      const data = username 
        ? await fetchProfileByUsername(username)
        : await fetchProfile();
      setProfileData(data);
      setError("");
    } catch (err) {
      setError(err?.response?.data ?? err?.message ?? "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Проверка является ли это своим профилем
  const isOwnProfile = !username || (currentUserProfile && profileData?.profile?.username === currentUserProfile?.username);

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
          />
        </div>
        <div style={{ width: "100%", maxWidth: 1240, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 360 }}>
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
    </div>
  );
};

export default Profile;
