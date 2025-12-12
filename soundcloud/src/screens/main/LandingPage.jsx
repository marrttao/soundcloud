import React, { useState, useCallback, useEffect } from "react";
// заменить импорт одной картинки на три разных
import slideImg1 from "../../assets/landing/img/asd1.png";
import slideImg2 from "../../assets/landing/img/asd2.png";
import slideImg3 from "../../assets/landing/img/asd3.png";
import logo from "../../assets/landing/icons/logo.png";
import cross from "../../assets/landing/img/cross.png";
import creators from "../../assets/landing/img/creators.png";
import { signIn, signUp, authErrorMessage } from "../../api/auth";
import { completeProfile } from "../../api/profile";
import { useNavigate } from "react-router-dom";
import {
  setAuthFlag,
  storeAuthTokens,
  readAuthFlag,
  clearAuthTokens
} from "../../utils/authFlag";
import ProfileSetupModal from "./ProfileSetupModal";
import useBreakpoint from "../../hooks/useBreakpoint";
// import Header from "../components/Header.jsx";
// import Footer from "../components/Footer.jsx";
// статичные данные
const slides = [
  {
    id: 0,
    title: "Discover. Get Discovered.",
    text: "Discover your next obsession, or become someone else's. SoundCloud is the only community where fans and artists come together to discover and connect through music.",
    image: slideImg1,
    artist: "DC the Don",
    subtitle: "SoundCloud Artist Pro",
    cta: "Get Started"
  },
  {
    id: 1,
    title: "Share Your Sound.",
      border: "1px solid #fff",
    image: slideImg2,
    artist: "Indie Creator",
    subtitle: "Rising Artist",
    cta: "Upload",
    ctaa: "Explore Artist Pro "
  },
  {
    id: 2,
    title: "Grow Your Audience.",
    text: "Access powerful tools to understand your listeners and promote your music across the globe.",
    image: slideImg3,
    artist: "Global Talent",
    subtitle: "Pro Subscriber",
    cta: "Upload",
    ctaa: "Explore Go+ "
  }
];

const FEATURED_SLIDES = slides.slice(0, 2);
const CTA_EXCLUSIONS = new Set([
  "explore artist pro",
  "for artists",
  "google app",
  "google play",
  "get it on google play",
  "download on the app store",
  "app store",
  "apple store"
]);

// сгруппированные стили
const buttonReset = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  height: 40,
  lineHeight: 1,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: 6,
  transition: "background .2s,border-color .2s,color .2s"
};

const styles = {
  carousel: (bg) => ({
    width: 1240,
    maxWidth: "100%",
    margin: "24px auto",
    position: "relative",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: 12,
    padding: "32px 32px",
    height: 450,
    color: "#fff",
    overflow: "hidden",
    boxSizing: "border-box"
  }),
  // + базовый сброс для кнопок
  topButtons: {
    position: "absolute",
    top: 24,
    right: 32,
    display: "flex",
    gap: 12
  },
  topBtn: (variant) => ({
    ...buttonReset,
    padding: "0 18px",
    border: variant === "primary" ? "none" : "1px solid #fff",
    background: variant === "primary" ? "#fff" : variant === "plain" ? "transparent" : "transparent",
    color: variant === "primary" ? "#000" : "#fff"
  }),
  left: {
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    paddingLeft: 60
  },
  // + новый контейнер контента
  content: {
    paddingTop: 0
  },
  h1: { fontSize: 56, lineHeight: "58px", margin: 0, fontWeight: 700, maxWidth: 600 },
  text: { marginTop: 24, fontSize: 16, lineHeight: "22px", maxWidth: 540 },
  cta: {
    ...buttonReset,
    padding: "0 24px",
    background: "#fff",
    color: "#000",
    border: "none"
  },
  ctaSecondary: {
    ...buttonReset,
    padding: "0 24px",
    background: "transparent",
    color: "#fff",
    border: "1px solid #fff"
  },
  // + новый контейнер для кнопок
  ctaWrap: {
    display: "flex",
    gap: 12,
    marginTop: 80
  },
  artistWrap: {
    position: "absolute",
    bottom: 64,
    right: 48,
    textAlign: "right"
  },
  dots: {
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 12
  },
  dot: (active) => ({
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "none",
    background: active ? "#fff" : "rgba(255,255,255,0.45)",
    cursor: "pointer",
    transition: "background .25s"
  }),
  navSideBtn: (side) => ({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    background: "rgba(0,0,0,0.4)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.35)",
    padding: 0,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1
  }),
  // + стиль для логотипа
  logo: {
    position: "absolute",
    top: 24,
    left: 32,
    height: 32,
    width: "auto"
  },
  trendingSection: {
    width: 1240,
    maxWidth: "100%",
    margin: "40px auto",
    padding: "60px 32px",
    textAlign: "center",
    color: "#fff",
    boxSizing: "border-box"
  },
  trendingTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 40,
    width: 850,
    height: 46,
    margin: "0 auto 40px"
  },
  searchInput: {
    flex: 1,
    width: "100%",
    padding: "0 14px",
    background: "#232323",
    border: "none",
    borderRadius: 4,
    color: "#fff",
    fontSize: 14,
    height: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
    textAlign: "left"
  },
  orText: {
    color: "#999",
    fontSize: 14
  },
  uploadBtn: {
    ...buttonReset,
    padding: "0 24px",
    background: "#fff",
    color: "#000",
    border: "none",
    height: "100%"
  },
  trendingTitle: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 32,
    lineHeight: "34px"
  },
  trendingBtn: {
    ...buttonReset,
    padding: "0 24px",
    background: "#fff",
    color: "#000",
    border: "none"
  },
  pageWrapper: {
    backgroundColor: "#0f0f0f",
    minHeight: "100vh",
    paddingTop: 56,
    paddingBottom: 32 /* внутренний нижний отступ вместо внешнего у последнего блока */
  },
  neverStopSection: {
    width: 1240,
    maxWidth: "100%",
    margin: "60px auto 0",
    padding: "60px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 80,
    backgroundColor: "#f5f5f5",
    backgroundImage: `url(${cross})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left center",
    height: 450,
    color: "#fff",
    paddingRight: 120,
    boxSizing: "border-box"
  },
  neverStopContent: {
    flex: 0,
    width: 650,
    textAlign: "left"
  },
  neverStopTitle: {
    fontSize: 48,
    fontWeight: 700,
    margin: 0,
    marginBottom: 16,
    lineHeight: "56px",
    color: "#000"
  },
  neverStopTitleUnderline: {
    width: 120,
    height: 5,
    background: "linear-gradient(90deg, #9d4edd, #ff006e)",
    marginBottom: 24,
    margin: "0 0 24px 0"
  },
  neverStopText: {
    fontSize: 18,
    lineHeight: "28px",
    marginBottom: 32,
    color: "#333",
    fontWeight: 600
  },
  appStoreButtons: {
    display: "flex",
    gap: 16,
    justifyContent: "flex-start"
  },
  storeBadgeLink: {
    display: "inline-block"
  },
  storeBadgeImage: {
    height: 40
  },
  creatorsSection: {
    width: 1240,
    maxWidth: "100%",
    margin: "0 auto",
    padding: "50px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#000",
    backgroundImage: `url(${creators})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right center",
    height: 350,
    color: "#fff",
    boxSizing: "border-box",
    overflow: "hidden"
  },
  creatorsContent: {
    flex: 0,
    width: 500,
    textAlign: "left"
  },
  creatorsTitle: {
    fontSize: 40,
    fontWeight: 700,
    margin: 0,
    marginBottom: 12,
    lineHeight: "48px",
    color: "#fff"
  },
  creatorsText: {
    fontSize: 16,
    lineHeight: "24px",
    marginBottom: 12,
    color: "#ccc",
    fontWeight: 400
  },
  creatorsBtn: {
    ...buttonReset,
    padding: "0 24px",
    background: "#fff",
    color: "#000",
    border: "none"
  },
  joinSection: {
    width: 1240,
    height: 375,
    margin: "0 auto", // убран нижний margin который показывал фон body
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 28,
    color: "#fff",
    background: "#0f0f0f"
  },
  joinTitle: {
    fontSize: 40,
    lineHeight: "46px",
    fontWeight: 600,
    margin: 0
  },
  joinSubtitle: {
    fontSize: 16,
    lineHeight: "22px",
    fontWeight: 600,
    margin: 0
  },
  joinCreateBtn: {
    ...buttonReset,
    padding: "0 40px",
    background: "#fff",
    color: "#000",
    border: "none",
    height: 46,
    fontSize: 16
  },
  joinLinks: {
    fontSize: 13,
    lineHeight: "18px",
    color: "#bbb",
    display: "flex",
    gap: 6,
    alignItems: "center"
  },
  joinSignIn: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer"
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000
  },
  modalCard: {
    background: "#101010",
    borderRadius: 16,
    padding: "32px",
    width: 360,
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    color: "#fff"
  },
  modalClose: {
    position: "absolute",
    right: 12,
    top: 12,
    background: "transparent",
    border: "none",
    color: "#ccc",
    fontSize: 18,
    cursor: "pointer"
  },
  modalTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 12
  },
  tabButton: (active) => ({
    ...buttonReset,
    borderRadius: 10,
    padding: "10px 0",
    border: active ? "1px solid #ff5500" : "1px solid #444",
    background: active ? "#ff5500" : "#141414",
    color: active ? "#fff" : "#aaa",
    fontSize: 14,
    fontWeight: 600
  }),
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  modalTitle: {
    margin: 0,
    fontSize: 22
  },
  modalText: {
    color: "#aaa",
    margin: 0,
    fontSize: 14
  },
  inputField: {
    padding: "10px 14px",
    borderRadius: 8,
    background: "#181818",
    border: "1px solid #333",
    color: "#fff",
    fontSize: 14,
    outline: "none"
  },
  authMessage: (type) => ({
    color: type === "error" ? "#ff7a7a" : type === "success" ? "#7af16f" : "#bbb",
    fontSize: 13,
    minHeight: 20
  }),
  modalSubmit: {
    ...buttonReset,
    background: "#ff5500",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    fontSize: 14,
    marginTop: 8
  }
};

// функция форматирования заголовка
const formatTitle = (title) =>
  title.split(". ").map((chunk, idx, arr) => (
    <span key={idx}>
      {chunk}.
      {idx < arr.length - 1 && <br />}
    </span>
  ));

const LandingPage = () => {
  const slidesToRender = FEATURED_SLIDES.length > 0 ? FEATURED_SLIDES : slides;
  const totalSlides = slidesToRender.length || 1;
  const isMobile = useBreakpoint(640);

  const [index, setIndex] = useState(0);
  const [modalType, setModalType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileDefaults, setProfileDefaults] = useState(null);

  const resetAuthFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setDisplayName("");
    setAuthMessage("");
    setAuthMessageType("info");
  };

  const openModal = (type) => {
    setModalType(type);
    resetAuthFields();
  };

  const switchModalType = (type) => {
    if (modalType !== type) {
      setModalType(type);
      resetAuthFields();
    }
  };

  const closeModal = () => {
    setModalType("");
    resetAuthFields();
  };

  const isSignIn = modalType === "signin";
  const isSignUp = modalType === "signup";
  const navigate = useNavigate();

  useEffect(() => {
    if (readAuthFlag()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      setAuthMessage("Email and password are required.");
      setAuthMessageType("error");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setAuthMessage("Passwords must match.");
        setAuthMessageType("error");
        return;
      }

      if (!username.trim()) {
        setAuthMessage("Username is required.");
        setAuthMessageType("error");
        return;
      }
    }

    setIsSubmitting(true);
    setAuthMessage("");
    setAuthMessageType("info");
    try {
      const action = isSignIn ? signIn : signUp;
      const response = await action(email, password);
      if (isSignIn) {
        if (response?.access_token) {
          storeAuthTokens(response.access_token, response.refresh_token ?? "");
          setAuthFlag(true);
        }
        setAuthMessage("Signed in successfully.");
        setAuthMessageType("success");
        navigate("/", { replace: true });
        return;
      }

      if (!response?.access_token) {
        setAuthMessage("Please confirm your email before continuing.");
        setAuthMessageType("error");
        return;
      }

      storeAuthTokens(response.access_token, response.refresh_token ?? "");

      const trimmedUsername = username.trim();
      const trimmedFullName = displayName.trim();

      try {
        await completeProfile({
          username: trimmedUsername,
          fullName: trimmedFullName,
          avatarUrl: "",
          bannerUrl: "",
          bio: ""
        });
        setProfileDefaults({
          username: trimmedUsername,
          fullName: trimmedFullName,
          avatarUrl: "",
          bannerUrl: "",
          bio: ""
        });
      } catch (profileError) {
        setAuthMessage(
          profileError?.response?.data ??
          profileError?.message ??
          "Failed to save username."
        );
        setAuthMessageType("error");
        return;
      }

      setAuthMessage("Check your inbox for a confirmation email.");
      setAuthMessageType("success");
      setModalType("");
      setShowProfileSetup(true);
    } catch (error) {
      setAuthMessage(authErrorMessage(error));
      setAuthMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldSkipSignup = (label = "") => {
    const normalized = label?.toString().trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    return CTA_EXCLUSIONS.has(normalized);
  };

  const triggerSignupModal = (label = "") => {
    if (!shouldSkipSignup(label)) {
      openModal("signup");
    }
  };

  const requireSignInForSearch = () => {
    openModal("signin");
    setAuthMessage("Sign in to search the catalog.");
    setAuthMessageType("info");
  };

  const handleLandingSearchIntent = (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    requireSignInForSearch();
    if (event?.currentTarget?.blur) {
      event.currentTarget.blur();
    }
  };

  const handleLandingSearchKeyDown = (event) => {
    if (event.key === "Tab" || event.key === "Shift") {
      return;
    }
    handleLandingSearchIntent(event);
  };

  const goTo = useCallback((i) => {
    setIndex(() => {
      const normalized = ((i % totalSlides) + totalSlides) % totalSlides;
      return normalized;
    });
  }, [totalSlides]);
  const next = useCallback(() => {
    setIndex((i) => (i + 1) % totalSlides);
  }, [totalSlides]);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const active = slidesToRender[index % totalSlides] ?? slidesToRender[0];

  React.useEffect(() => {
    document.body.style.background = "#0f0f0f";
    document.body.style.margin = "0";
  }, []);

  return (
    <div style={{
      ...styles.pageWrapper,
      paddingTop: isMobile ? 32 : styles.pageWrapper.paddingTop,
      paddingBottom: isMobile ? 24 : styles.pageWrapper.paddingBottom
    }}>
      {/* <Header /> */}
      <div
        className="hello-carousel"
        style={{
          ...styles.carousel(active?.image ?? slidesToRender[0]?.image ?? slideImg1),
          width: "100%",
          maxWidth: 1240,
          margin: isMobile ? "0 auto 24px" : "24px auto",
          padding: isMobile ? "72px 20px 96px" : "32px 32px",
          height: isMobile ? "auto" : 450,
          minHeight: isMobile ? 480 : 450,
          borderRadius: isMobile ? 0 : 12
        }}
        role="region"
        aria-label="Музыкальная карусель"
      >
        {/* логотип слева */}
        <img src={logo} alt="SoundCloud" style={{
          ...styles.logo,
          height: isMobile ? 20 : 24,
          top: isMobile ? 20 : 40,
          left: isMobile ? 20 : styles.logo.left
        }} />
        {/* верхние кнопки */}
        <div style={{
          ...styles.topButtons,
          position: isMobile ? "static" : styles.topButtons.position,
          width: isMobile ? "100%" : "auto",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? 8 : styles.topButtons.gap,
          marginTop: isMobile ? 16 : 0
        }}>
          <button style={styles.topBtn()} onClick={() => openModal("signin")}>Sign in</button>
          <button style={styles.topBtn("primary")} onClick={() => openModal("signup")}>Create account</button>
          <button style={styles.topBtn("plain")}>For Artists</button>
        </div>
        {/* навигация слева/справа */}
        {!isMobile && (
          <button onClick={prev} style={styles.navSideBtn("left")} aria-label="Предыдущий слайд">‹</button>
        )}
        {!isMobile && (
          <button onClick={next} style={styles.navSideBtn("right")} aria-label="Следующий слайд">›</button>
        )}
        {/* левый контент */}
        <div style={{
          ...styles.left,
          maxWidth: "100%",
          paddingLeft: isMobile ? 0 : styles.left.paddingLeft,
          alignItems: isMobile ? "center" : "flex-start",
          textAlign: isMobile ? "center" : "left"
        }}>
          <div style={styles.content}>
            <h1 style={{
              ...styles.h1,
              fontSize: isMobile ? 36 : styles.h1.fontSize,
              lineHeight: isMobile ? "42px" : styles.h1.lineHeight,
              textAlign: isMobile ? "center" : "left"
            }}>{formatTitle(active?.title ?? "")}</h1>
            <p style={{
              ...styles.text,
              fontSize: isMobile ? 15 : styles.text.fontSize,
              textAlign: isMobile ? "center" : "left"
            }}>{active?.text ?? ""}</p>
            <div style={{
              display: "flex",
              gap: 8,
              marginTop: 32,
              alignItems: "center",
              justifyContent: isMobile ? "center" : "flex-start",
              flexDirection: isMobile ? "column" : "row"
            }}>
              {active?.cta && (
                <button
                  type="button"
                  style={styles.cta}
                  onClick={() => triggerSignupModal(active.cta)}
                >
                  {active.cta}
                </button>
              )}
              {active?.ctaa && (
                <button
                  type="button"
                  style={styles.ctaSecondary}
                  onClick={() => triggerSignupModal(active.ctaa)}
                >
                  {active.ctaa}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* блок артиста */}
        <div style={{
          ...styles.artistWrap,
          position: isMobile ? "static" : styles.artistWrap.position,
          textAlign: isMobile ? "center" : styles.artistWrap.textAlign,
          marginTop: isMobile ? 32 : 0
        }}>
          <div style={{ fontSize: 14 }}>{active?.artist}</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{active?.subtitle}</div>
        </div>
        {/* точки */}
        <div style={{
          ...styles.dots,
          position: isMobile ? "static" : styles.dots.position,
          marginTop: isMobile ? 24 : 0,
          justifyContent: "center"
        }} aria-label="Индикаторы слайдов">
          {slidesToRender.map((slide, slideIndex) => (
            <button
              key={slide.id ?? slideIndex}
              onClick={() => goTo(slideIndex)}
              style={styles.dot(index === slideIndex)}
              aria-label={`Слайд ${slideIndex + 1}`}
              aria-current={index === slideIndex}
            />
          ))}
        </div>
      </div>


      <div style={{
        ...styles.trendingSection,
        padding: isMobile ? "40px 20px" : styles.trendingSection.padding,
        margin: isMobile ? "0 auto 24px" : styles.trendingSection.margin
      }}>
        <div style={{
          ...styles.trendingTop,
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          height: isMobile ? "auto" : styles.trendingTop.height,
          gap: isMobile ? 16 : styles.trendingTop.gap,
          alignItems: isMobile ? "stretch" : styles.trendingTop.alignItems
        }}>
          <input
            type="text"
            placeholder="Search for artists, bands, tracks, podcasts"
            aria-label="Search the SoundCloud catalog"
            style={{
              ...styles.searchInput,
              height: isMobile ? 48 : styles.searchInput.height,
              cursor: "pointer"
            }}
            readOnly
            onClick={handleLandingSearchIntent}
            onKeyDown={handleLandingSearchKeyDown}
          />
          <span style={{
            ...styles.orText,
            display: isMobile ? "none" : "inline-flex"
          }}>or</span>
          <button
            type="button"
            style={{
              ...styles.uploadBtn,
              width: isMobile ? "100%" : "auto",
              height: isMobile ? 48 : styles.uploadBtn.height
            }}
            onClick={() => triggerSignupModal("Upload your own")}
          >
            Upload your own
          </button>
        </div>
        <h2 style={{
          ...styles.trendingTitle,
          fontSize: isMobile ? 22 : styles.trendingTitle.fontSize,
          lineHeight: isMobile ? "30px" : styles.trendingTitle.lineHeight
        }}>Hear what's trending for free in the SoundCloud community</h2>
        <button
          type="button"
          style={{
            ...styles.trendingBtn,
            width: isMobile ? "100%" : "auto"
          }}
          onClick={() => triggerSignupModal("Explore trending playlists")}
        >
          Explore trending playlists
        </button>
      </div>
      
      <div style={{
        ...styles.neverStopSection,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : styles.neverStopSection.alignItems,
        justifyContent: isMobile ? "flex-start" : styles.neverStopSection.justifyContent,
        padding: isMobile ? "48px 20px" : styles.neverStopSection.padding,
        height: isMobile ? "auto" : styles.neverStopSection.height,
        textAlign: isMobile ? "left" : "right",
        gap: isMobile ? 32 : styles.neverStopSection.gap
      }}>
        <div style={{
          ...styles.neverStopContent,
          width: "100%"
        }}>
          <h2 style={styles.neverStopTitle}>Never stop listening</h2>
          <div style={styles.neverStopTitleUnderline}></div>
          <p style={styles.neverStopText}>SoundCloud is available on Web, iOS, Android, Sonos, Chromecast, and Xbox One.</p>
          <div style={styles.appStoreButtons}>
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.storeBadgeLink}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg"
                alt="App Store"
                style={styles.storeBadgeImage}
              />
            </a>
            <a
              href="https://play.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.storeBadgeLink}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                style={styles.storeBadgeImage}
              />
            </a>
          </div>
        </div>
      </div>
      

      <div style={{
        ...styles.creatorsSection,
        flexDirection: isMobile ? "column" : "row",
        padding: isMobile ? "48px 20px" : styles.creatorsSection.padding,
        height: isMobile ? "auto" : styles.creatorsSection.height,
        backgroundPosition: isMobile ? "center right" : styles.creatorsSection.backgroundPosition
      }}>
        <div style={{
          ...styles.creatorsContent,
          width: "100%",
          textAlign: isMobile ? "center" : "left"
        }}>
          <h2 style={styles.creatorsTitle}>Calling all creators</h2>
          <p style={styles.creatorsText}>Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?</p>
          <button
            type="button"
            style={{
              ...styles.creatorsBtn,
              width: isMobile ? "100%" : "auto"
            }}
            onClick={() => triggerSignupModal("Find out more")}
          >
            Find out more
          </button>
        </div>
      </div>
      <div style={{
        ...styles.joinSection,
        width: "100%",
        padding: isMobile ? "48px 20px" : undefined,
        height: isMobile ? "auto" : styles.joinSection.height
      }}>
        <h2 style={{
          ...styles.joinTitle,
          fontSize: isMobile ? 28 : styles.joinTitle.fontSize,
          lineHeight: isMobile ? "34px" : styles.joinTitle.lineHeight
        }}>Thanks for listening. Now join in.</h2>
        <p style={{
          ...styles.joinSubtitle,
          fontSize: isMobile ? 14 : styles.joinSubtitle.fontSize
        }}>Save tracks, follow artists and build playlists. All for free.</p>
        <button
          type="button"
          style={{
            ...styles.joinCreateBtn,
            width: isMobile ? "100%" : "auto"
          }}
          onClick={() => triggerSignupModal("Create account")}
        >
          Create account
        </button>
        <div style={{
          ...styles.joinLinks,
          flexDirection: isMobile ? "column" : "row",
          textAlign: "center"
        }}>
          <span>Already have an account?</span>
          <button style={styles.joinSignIn} onClick={() => openModal("signin")}>Sign in</button>
        </div>
      </div>
      {modalType && (
        <div style={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div style={{
            ...styles.modalCard,
            width: isMobile ? "90vw" : styles.modalCard.width,
            padding: isMobile ? "24px" : styles.modalCard.padding
          }}>
            <button
              onClick={closeModal}
              style={styles.modalClose}
              aria-label="Close"
            >
              ✕
            </button>
            <div style={styles.modalTabs}>
              <button
                type="button"
                style={styles.tabButton(isSignIn)}
                onClick={() => switchModalType("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                style={styles.tabButton(isSignUp)}
                onClick={() => switchModalType("signup")}
              >
                Sign up
              </button>
            </div>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>{isSignIn ? "Sign in with email" : "Create account"}</h3>
              <p style={styles.modalText}>We only allow email-based {isSignIn ? "sign in" : "sign ups"} for now.</p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={styles.inputField}
                autoComplete="email"
              />
              {isSignUp && (
                <>
                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    style={styles.inputField}
                    autoComplete="name"
                  />
                  <input
                    type="text"
                    placeholder="Username (public handle)"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    style={styles.inputField}
                    autoComplete="username"
                  />
                </>
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={styles.inputField}
                autoComplete={isSignIn ? "current-password" : "new-password"}
              />
              {isSignUp && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  style={styles.inputField}
                  autoComplete="new-password"
                />
              )}
              <button
                style={styles.modalSubmit}
                onClick={handleAuthSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Working..." : isSignIn ? "Sign in" : "Create account"}
              </button>
              <p style={styles.authMessage(authMessageType)}>{authMessage}</p>
            </div>
          </div>
        </div>
      )}
      {showProfileSetup && (
        <ProfileSetupModal
          initialValues={profileDefaults ?? undefined}
          onClose={() => {
            setShowProfileSetup(false);
            setProfileDefaults(null);
          }}
          onSuccess={() => {
            setShowProfileSetup(false);
            setProfileDefaults(null);
            clearAuthTokens();
            setAuthFlag(false);
            setAuthMessage("Profile saved. Please confirm your email before signing in.");
            setAuthMessageType("info");
            setModalType("signin");
          }}
        />
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;