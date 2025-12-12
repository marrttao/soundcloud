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

const BASE_PAGE_WIDTH = 1240;
const DESIRED_SIDE_GUTTER = 32;
const PHONE_BREAKPOINT = 640;

const getViewportWidth = () =>
  typeof window === "undefined" ? BASE_PAGE_WIDTH : window.innerWidth;

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
    width: BASE_PAGE_WIDTH,
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
    width: BASE_PAGE_WIDTH,
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
    width: BASE_PAGE_WIDTH,
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
    width: BASE_PAGE_WIDTH,
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
    width: BASE_PAGE_WIDTH,
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

const mobileStyles = {
  wrapper: {
    width: "100%",
    minHeight: "100vh",
    padding: "20px 16px 64px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxSizing: "border-box",
    backgroundColor: "#0f0f0f"
  },
  heroCard: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 420,
    background: "#141414",
    color: "#fff",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
  },
  heroBackdrop: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "blur(6px) brightness(0.8)"
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.85))"
  },
  heroContent: {
    position: "relative",
    padding: "32px 24px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  heroLogo: {
    width: 120,
    height: "auto"
  },
  heroEyebrow: {
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.8)",
    margin: "8px 0 0 0"
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: "32px",
    margin: "4px 0 0 0"
  },
  heroText: {
    fontSize: 15,
    lineHeight: "22px",
    margin: 0,
    color: "rgba(255,255,255,0.9)"
  },
  heroActions: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 8
  },
  heroPrimary: {
    ...buttonReset,
    width: "100%",
    padding: "0 24px",
    height: 46,
    background: "#ff5500",
    border: "none",
    color: "#fff",
    fontSize: 15
  },
  heroSecondary: {
    ...buttonReset,
    width: "100%",
    padding: "0 24px",
    height: 46,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.4)",
    color: "#fff",
    fontSize: 15
  },
  heroNavRow: {
    position: "relative",
    padding: "0 16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  navBtn: {
    ...buttonReset,
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    fontSize: 20
  },
  dotRow: {
    display: "flex",
    gap: 8
  },
  dot: (active) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "none",
    background: active ? "#fff" : "rgba(255,255,255,0.4)",
    padding: 0,
    cursor: "pointer"
  }),
  featureCard: {
    background: "#161616",
    borderRadius: 18,
    padding: "24px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid rgba(255,255,255,0.08)"
  },
  featureEyebrow: {
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.65)",
    margin: 0
  },
  featureTitle: {
    fontSize: 22,
    margin: 0
  },
  featureText: {
    fontSize: 14,
    lineHeight: "20px",
    margin: 0,
    color: "rgba(255,255,255,0.8)"
  },
  featurePrimary: {
    ...buttonReset,
    width: "100%",
    padding: "0 20px",
    height: 44,
    background: "#fff",
    border: "none",
    color: "#000",
    fontSize: 14
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  storeBadges: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap"
  },
  joinCard: {
    borderRadius: 22,
    padding: "32px 24px",
    background: "linear-gradient(135deg, #ff7a18, #ff4d00)",
    color: "#fff",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  joinTitle: {
    fontSize: 24,
    lineHeight: "30px",
    margin: 0
  },
  joinSubtitle: {
    fontSize: 14,
    lineHeight: "20px",
    margin: 0
  },
  joinCTA: {
    ...buttonReset,
    width: "100%",
    height: 46,
    background: "#fff",
    color: "#000",
    border: "none",
    fontSize: 15
  },
  joinLinks: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)"
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
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const isPhone = viewportWidth <= PHONE_BREAKPOINT;
  const availableWidth = Math.max(1, viewportWidth - DESIRED_SIDE_GUTTER * 2);
  const shouldScaleDesktop = !isPhone && viewportWidth < BASE_PAGE_WIDTH;
  const pageScale = shouldScaleDesktop ? Math.min(1, availableWidth / BASE_PAGE_WIDTH) : 1;
  const scaledWidth = BASE_PAGE_WIDTH * pageScale;
  const horizontalPadding = isPhone ? 0 : Math.max(0, (viewportWidth - scaledWidth) / 2);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleResize = () => setViewportWidth(getViewportWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    }

    setIsSubmitting(true);
    setAuthMessage("");
    setAuthMessageType("info");
    try {
      let response;
      if (isSignIn) {
        response = await signIn(email, password);
      } else {
        response = await signUp(email, password);
      }
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
      setAuthMessage("Check your inbox for a confirmation email.");
      setAuthMessageType("success");
      setModalType("");
      // Open profile setup modal after signup so user can choose username/display name there
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

  const renderMobileSections = () => {
    const quickCards = [
      {
        eyebrow: "Trending",
        title: "Hear what's trending",
        text: "Drop into curated sets built by the SoundCloud community.",
        cta: "Explore trending",
        action: () => triggerSignupModal("Explore trending playlists")
      },
      {
        eyebrow: "Creators",
        title: "Calling all creators",
        text: "Upload in minutes, share updates, and unlock Pro tools.",
        cta: "Find out more",
        action: () => triggerSignupModal("Find out more")
      }
    ];

    return (
      <div style={mobileStyles.wrapper}>
        <section style={mobileStyles.heroCard}>
          <img
            src={active?.image ?? slidesToRender[0]?.image ?? slideImg1}
            alt="Featured slide background"
            style={mobileStyles.heroBackdrop}
          />
          <div style={mobileStyles.heroOverlay} />
          <div style={mobileStyles.heroContent}>
            <img src={logo} alt="SoundCloud" style={mobileStyles.heroLogo} />
            <p style={mobileStyles.heroEyebrow}>{active?.artist ?? "SoundCloud Artists"}</p>
            <h1 style={mobileStyles.heroTitle}>{active?.title ?? "Discover. Get Discovered."}</h1>
            {active?.text && <p style={mobileStyles.heroText}>{active.text}</p>}
            <div style={mobileStyles.heroActions}>
              {active?.cta && (
                <button
                  type="button"
                  style={mobileStyles.heroPrimary}
                  onClick={() => triggerSignupModal(active.cta)}
                >
                  {active.cta}
                </button>
              )}
              <button
                type="button"
                style={mobileStyles.heroSecondary}
                onClick={() => openModal("signin")}
              >
                Sign in
              </button>
            </div>
          </div>
          <div style={mobileStyles.heroNavRow}>
            <button
              type="button"
              style={mobileStyles.navBtn}
              onClick={prev}
              aria-label="Предыдущий слайд"
            >
              ‹
            </button>
            <div style={mobileStyles.dotRow}>
              {slidesToRender.map((slide, slideIndex) => (
                <button
                  type="button"
                  key={slide.id ?? slideIndex}
                  style={mobileStyles.dot(index === slideIndex)}
                  onClick={() => goTo(slideIndex)}
                  aria-label={`Слайд ${slideIndex + 1}`}
                  aria-current={index === slideIndex}
                />
              ))}
            </div>
            <button
              type="button"
              style={mobileStyles.navBtn}
              onClick={next}
              aria-label="Следующий слайд"
            >
              ›
            </button>
          </div>
        </section>

        <section style={mobileStyles.featureCard}>
          <p style={mobileStyles.featureEyebrow}>Search</p>
          <h3 style={mobileStyles.featureTitle}>Find your next obsession</h3>
          <p style={mobileStyles.featureText}>Search for artists, bands, tracks, and podcasts across SoundCloud.</p>
          <button
            type="button"
            style={mobileStyles.featurePrimary}
            onClick={requireSignInForSearch}
          >
            Search the catalog
          </button>
        </section>

        <section style={mobileStyles.quickActions}>
          {quickCards.map((card) => (
            <div key={card.title} style={mobileStyles.featureCard}>
              <p style={mobileStyles.featureEyebrow}>{card.eyebrow}</p>
              <h3 style={mobileStyles.featureTitle}>{card.title}</h3>
              <p style={mobileStyles.featureText}>{card.text}</p>
              <button
                type="button"
                style={mobileStyles.featurePrimary}
                onClick={card.action}
              >
                {card.cta}
              </button>
            </div>
          ))}
        </section>

        <section style={{
          ...mobileStyles.featureCard,
          background: "#101010",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <p style={mobileStyles.featureEyebrow}>Apps</p>
          <h3 style={mobileStyles.featureTitle}>Never stop listening</h3>
          <p style={mobileStyles.featureText}>SoundCloud is available on Web, iOS, Android, Sonos, Chromecast, and Xbox.</p>
          <div style={mobileStyles.storeBadges}>
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
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
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                style={styles.storeBadgeImage}
              />
            </a>
          </div>
        </section>

        <section style={mobileStyles.joinCard}>
          <h3 style={mobileStyles.joinTitle}>Thanks for listening. Now join in.</h3>
          <p style={mobileStyles.joinSubtitle}>Save tracks, follow artists, and build playlists. All for free.</p>
          <button
            type="button"
            style={mobileStyles.joinCTA}
            onClick={() => triggerSignupModal("Create account")}
          >
            Create account
          </button>
          <div style={mobileStyles.joinLinks}>
            <span>Already have an account?</span>
            <button style={styles.joinSignIn} onClick={() => openModal("signin")}>
              Sign in
            </button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: styles.pageWrapper.backgroundColor,
        minHeight: styles.pageWrapper.minHeight,
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: isPhone ? 0 : horizontalPadding,
        paddingRight: isPhone ? 0 : horizontalPadding
      }}
    >
      {isPhone ? (
        renderMobileSections()
      ) : (
        <div
          style={{
            width: BASE_PAGE_WIDTH,
            transform: pageScale < 1 ? `scale(${pageScale})` : undefined,
            transformOrigin: "top center"
          }}
        >
          <div style={styles.pageWrapper}>
            {/* <Header /> */}
            <div
              className="hello-carousel"
              style={styles.carousel(active?.image ?? slidesToRender[0]?.image ?? slideImg1)}
              role="region"
              aria-label="Музыкальная карусель"
            >
              <img src={logo} alt="SoundCloud" style={styles.logo} />
              <div style={styles.topButtons}>
                <button style={styles.topBtn()} onClick={() => openModal("signin")}>Sign in</button>
                <button style={styles.topBtn("primary")} onClick={() => openModal("signup")}>Create account</button>
                <button style={styles.topBtn("plain")}>For Artists</button>
              </div>
              <button onClick={prev} style={styles.navSideBtn("left")} aria-label="Предыдущий слайд">‹</button>
              <button onClick={next} style={styles.navSideBtn("right")} aria-label="Следующий слайд">›</button>
              <div style={styles.left}>
                <div style={styles.content}>
                  <h1 style={styles.h1}>{formatTitle(active?.title ?? "")}</h1>
                  <p style={styles.text}>{active?.text ?? ""}</p>
                  <div style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 32,
                    alignItems: "center",
                    justifyContent: "flex-start"
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
              <div style={styles.artistWrap}>
                <div style={{ fontSize: 14 }}>{active?.artist}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{active?.subtitle}</div>
              </div>
              <div style={{
                ...styles.dots,
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

            <div style={styles.trendingSection}>
              <div style={styles.trendingTop}>
                <input
                  type="text"
                  placeholder="Search for artists, bands, tracks, podcasts"
                  aria-label="Search the SoundCloud catalog"
                  style={{
                    ...styles.searchInput,
                    cursor: "pointer"
                  }}
                  readOnly
                  onClick={handleLandingSearchIntent}
                  onKeyDown={handleLandingSearchKeyDown}
                />
                <span style={{
                  ...styles.orText,
                  display: "inline-flex"
                }}>or</span>
                <button
                  type="button"
                  style={styles.uploadBtn}
                  onClick={() => triggerSignupModal("Upload your own")}
                >
                  Upload your own
                </button>
              </div>
              <h2 style={styles.trendingTitle}>Hear what's trending for free in the SoundCloud community</h2>
              <button
                type="button"
                style={styles.trendingBtn}
                onClick={() => triggerSignupModal("Explore trending playlists")}
              >
                Explore trending playlists
              </button>
            </div>

            <div style={styles.neverStopSection}>
              <div style={styles.neverStopContent}>
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

            <div style={styles.creatorsSection}>
              <div style={styles.creatorsContent}>
                <h2 style={styles.creatorsTitle}>Calling all creators</h2>
                <p style={styles.creatorsText}>Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?</p>
                <button
                  type="button"
                  style={styles.creatorsBtn}
                  onClick={() => triggerSignupModal("Find out more")}
                >
                  Find out more
                </button>
              </div>
            </div>

            <div style={styles.joinSection}>
              <h2 style={styles.joinTitle}>Thanks for listening. Now join in.</h2>
              <p style={styles.joinSubtitle}>Save tracks, follow artists and build playlists. All for free.</p>
              <button
                type="button"
                style={styles.joinCreateBtn}
                onClick={() => triggerSignupModal("Create account")}
              >
                Create account
              </button>
              <div style={styles.joinLinks}>
                <span>Already have an account?</span>
                <button style={styles.joinSignIn} onClick={() => openModal("signin")}>Sign in</button>
              </div>
            </div>
            {/* <Footer /> */}
          </div>
        </div>
      )}
      {modalType && (
        <div style={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div style={styles.modalCard}>
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
              {/* Username and display name are collected in profile setup modal after signup */}
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
    </div>
  );
};

export default LandingPage;