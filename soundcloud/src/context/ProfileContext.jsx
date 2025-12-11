import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchProfile } from "../api/profile";

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const activeRequestRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadProfile = useCallback(async ({ force = false } = {}) => {
    if (!force) {
      if (profileData && hasLoadedOnce && !activeRequestRef.current) {
        return profileData;
      }
      if (activeRequestRef.current) {
        return activeRequestRef.current;
      }
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError("");

    const requestPromise = (async () => {
      try {
        const response = await fetchProfile();
        setProfileData(response ?? null);
        return response ?? null;
      } catch (err) {
        console.error("Failed to load current profile", err);
        setProfileData(null);
        setError(err?.message ?? "Unable to load profile.");
        throw err;
      } finally {
        setHasLoadedOnce(true);
        if (requestIdRef.current === requestId) {
          setLoading(false);
          activeRequestRef.current = null;
        }
      }
    })();

    activeRequestRef.current = requestPromise;
    return requestPromise;
  }, [hasLoadedOnce, profileData]);

  useEffect(() => {
    loadProfile().catch(() => {
      /* intentionally swallowed: consumer already notified via error state */
    });
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile({ force: true }), [loadProfile]);

  const value = useMemo(() => ({
    profile: profileData?.profile ?? null,
    profileData,
    loading,
    error,
    ensureProfile: loadProfile,
    refreshProfile
  }), [profileData, loading, error, loadProfile, refreshProfile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useCurrentProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useCurrentProfile must be used within a ProfileProvider");
  }
  return context;
};
