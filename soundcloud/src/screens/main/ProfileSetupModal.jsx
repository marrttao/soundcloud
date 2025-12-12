import React, { useEffect, useMemo, useState } from "react";
import { completeProfile, checkUsernameAvailability } from "../../api/profile";
import { useCurrentProfile } from "../../context/ProfileContext";

const defaultValues = {
  username: "",
  fullName: "",
  bio: "",
  avatarUrl: "",
  bannerUrl: ""
};

const ProfileSetupModal = ({
  onClose,
  onSuccess,
  initialValues = defaultValues,
  title = "Finish setting up your profile",
  submitLabel = "Save profile",
  showSkip = true
}) => {
  const [values, setValues] = useState(defaultValues);
  const mergedInitialValues = useMemo(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues]
  );

  useEffect(() => {
    setValues(mergedInitialValues);
  }, [mergedInitialValues]);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [saving, setSaving] = useState(false);
  const { refreshProfile } = useCurrentProfile();

  const handleChange = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = (field) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setValues((prev) => ({ ...prev, [field]: dataUrl }));
    } catch (error) {
      console.error("Failed to read file", error);
    }
  };

  const handleSave = async () => {
    const trimmedUsername = values.username.trim();
    if (!trimmedUsername) {
      setStatus({ message: "Username is required", type: "error" });
      return;
    }

    const initialUsername = mergedInitialValues.username?.trim().toLowerCase() ?? "";
    const currentUsername = trimmedUsername.toLowerCase();
    const usernameChanged = initialUsername !== currentUsername;

    setSaving(true);
    setStatus({ message: "", type: "" });
    try {
      if (usernameChanged) {
        const availability = await checkUsernameAvailability(trimmedUsername);
        if (!availability?.available) {
          setStatus({ message: "That username is already taken", type: "error" });
          return;
        }
      }

      const payload = { ...values, username: trimmedUsername };
      await completeProfile(payload);
      try {
        await refreshProfile?.();
      } catch (err) {
        // don't block success path if context refresh fails
        console.warn("Failed to refresh global profile from modal", err);
      }
      setStatus({ message: "Profile saved", type: "success" });
      onSuccess?.(payload);
    } catch (error) {
      setStatus({
        message:
          error?.response?.data ?? error?.message ?? "Failed to save profile",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2100
    },
    card: {
      background: "#111",
      borderRadius: 16,
      padding: "32px",
      width: "min(460px, 90vw)",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: 12
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    inputs: {
      background: "#1e1e1e",
      border: "1px solid #333",
      borderRadius: 8,
      padding: "10px 12px",
      color: "#fff",
      fontSize: 14
    },
    button: {
      background: "#ff5500",
      border: "none",
      borderRadius: 10,
      padding: "10px 18px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      color: "#fff"
    },
    secondary: {
      background: "transparent",
      border: "1px solid #333",
      color: "#fff"
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h3 style={{ margin: 0 }}>Finish setting up your profile</h3>
            <p style={{ margin: "2px 0 0", color: "#bbb", fontSize: 13 }}>
              Add a username, avatar, banner, and a short bio.
            </p>
          </div>
          <button
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              fontSize: 18,
              cursor: "pointer"
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Username</span>
          <input
            type="text"
            value={values.username}
            onChange={handleChange("username")}
            placeholder="choose a nickname"
            style={styles.inputs}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Display name</span>
          <input
            type="text"
            value={values.fullName}
            onChange={handleChange("fullName")}
            placeholder="Your full name"
            style={styles.inputs}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Avatar</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange("avatarUrl")}
            style={styles.inputs}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Banner image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange("bannerUrl")}
            style={styles.inputs}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>Bio</span>
          <textarea
            rows={3}
            value={values.bio}
            onChange={handleChange("bio")}
            placeholder="Tell fans about your sound"
            style={{
              ...styles.inputs,
              resize: "vertical",
              minHeight: 80
            }}
          />
        </label>
        {status.message && (
          <div style={{ color: status.type === "error" ? "#ff7a7a" : "#7af16f", fontSize: 13 }}>
            {status.message}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          {values.avatarUrl && (
            <img
              src={values.avatarUrl}
              alt="Avatar preview"
              style={{ width: 64, height: 64, borderRadius: 999, objectFit: "cover", border: "1px solid #333" }}
            />
          )}
          {values.bannerUrl && (
            <img
              src={values.bannerUrl}
              alt="Banner preview"
              style={{ flex: 1, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid #333" }}
            />
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          {showSkip && (
            <button
              style={{ ...styles.button, ...styles.secondary, flex: 1 }}
              type="button"
              onClick={onClose}
            >
              Skip for now
            </button>
          )}
          <button
            style={{ ...styles.button, flex: 1 }}
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
