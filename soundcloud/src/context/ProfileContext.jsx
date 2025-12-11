import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchProfile } from "../api/profile";

export const PROFILE_CACHE_KEY = "sc_profile_cache_v1";

const readCachedProfile = () => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to read cached profile", err);
    return null;
  }
};

const writeCachedProfile = (payload) => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  try {
    if (!payload) {
      window.sessionStorage.removeItem(PROFILE_CACHE_KEY);
      return;
    }
    window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to cache profile", err);
  }
};

export const clearProfileCache = () => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  try {
    window.sessionStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (err) {
    console.warn("Failed to clear cached profile", err);
  }
};

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const initialCache = useMemo(() => readCachedProfile(), []);
  const [profileData, setProfileData] = useState(initialCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(Boolean(initialCache));
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
        const nextProfile = response ?? null;
        setProfileData(nextProfile);
        writeCachedProfile(nextProfile);
        return nextProfile;
      } catch (err) {
        console.error("Failed to load current profile", err);
        setProfileData(null);
        clearProfileCache();
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
