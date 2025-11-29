import React, { useState, useCallback } from "react";
// заменить импорт одной картинки на три разных
import slideImg1 from "../assets/landing/img/asd1.png";
import slideImg2 from "../assets/landing/img/asd2.png";
import slideImg3 from "../assets/landing/img/asd3.png";
import logo from "../assets/landing/icons/logo.png";
import cross from "../assets/landing/img/cross.png";
import creators from "../assets/landing/img/creators.png";
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
    text: "Upload tracks and grow your audience with real connections. Turn listeners into fans and fans into collaborators.",
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
    justifyContent: "space-between",
    marginBottom: 40,
    width: 850,
    height: 46,
    margin: "0 auto 40px"
  },
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#333",
    border: "1px solid #444",
    borderRadius: 6,
    color: "#fff",
    fontSize: 14,
    marginRight: 12,
    height: "100%",
    boxSizing: "border-box"
  },
  orText: {
    color: "#999",
    fontSize: 14,
    marginRight: 12
  },
  uploadBtn: {
    ...buttonReset,
    padding: "0 24px",
    background: "#fff",
    color: "#000",
    border: "none"
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
  appStoreBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "opacity .2s",
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
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i) => setIndex(i), []);
  const next = useCallback(() => setIndex(i => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex(i => (i - 1 + slides.length) % slides.length), []);

  const active = slides[index];

  React.useEffect(() => {
    document.body.style.background = "#0f0f0f";
    document.body.style.margin = "0";
  }, []);

  return (
    <div style={styles.pageWrapper}>
      {/* <Header /> */}
      <div
        className="hello-carousel"
        style={styles.carousel(active.image)}
        role="region"
        aria-label="Музыкальная карусель"
      >
        {/* логотип слева */}
        <img src={logo} alt="SoundCloud" style={{ ...styles.logo, height: 24, top: 40 }} />
        {/* верхние кнопки */}
        <div style={styles.topButtons}>
          <button style={styles.topBtn()}>Sign in</button>
          <button style={styles.topBtn("primary")}>Create account</button>
          <button style={styles.topBtn("plain")}>For Artists</button>
        </div>
        {/* навигация слева/справа */}
        <button onClick={prev} style={styles.navSideBtn("left")} aria-label="Предыдущий слайд">‹</button>
        <button onClick={next} style={styles.navSideBtn("right")} aria-label="Следующий слайд">›</button>
        {/* левый контент */}
        <div style={styles.left}>
          <div style={styles.content}>
            <h1 style={styles.h1}>{formatTitle(active.title)}</h1>
            <p style={styles.text}>{active.text}</p>
            <div style={{
              display: "flex",
              gap: 8,
              marginTop: 32,
              alignItems: "center",
              justifyContent: "flex-start"
            }}>
              <button style={styles.cta}>{active.cta}</button>
              {active.ctaa && <button style={styles.ctaSecondary}>{active.ctaa}</button>}
            </div>
          </div>
        </div>
        {/* блок артиста */}
        <div style={styles.artistWrap}>
          <div style={{ fontSize: 14 }}>{active.artist}</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{active.subtitle}</div>
        </div>
        {/* точки */}
        <div style={styles.dots} aria-label="Индикаторы слайдов">
          {slides.map(s => (
            <button
              key={s.id}
              onClick={() => goTo(s.id)}
              style={styles.dot(index === s.id)}
              aria-label={`Слайд ${s.id + 1}`}
              aria-current={index === s.id}
            />
          ))}
        </div>
      </div>


      <div style={styles.trendingSection}>
        <div style={styles.trendingTop}>
          <input
            type="text"
            placeholder="Search for artists, bands, tracks, podcasts"
            style={styles.searchInput}
          />
          <span style={styles.orText}>or</span>
          <button style={styles.uploadBtn}>Upload your own</button>
        </div>
        <h2 style={styles.trendingTitle}>Hear what's trending for free in the SoundCloud community</h2>
        <button style={styles.trendingBtn}>Explore trending playlists</button>
      </div>
      
      <div style={styles.neverStopSection}>
        <div style={styles.neverStopContent}>
          <h2 style={styles.neverStopTitle}>Never stop listening</h2>
          <div style={styles.neverStopTitleUnderline}></div>
          <p style={styles.neverStopText}>SoundCloud is available on Web, iOS, Android, Sonos, Chromecast, and Xbox One.</p>
          <div style={styles.appStoreButtons}>
            <button style={styles.appStoreBtn}>Download on the App Store</button>
            <button style={styles.appStoreBtn}>GET IT ON Google Play</button>
          </div>
        </div>
      </div>
      

      <div style={styles.creatorsSection}>
        <div style={styles.creatorsContent}>
          <h2 style={styles.creatorsTitle}>Calling all creators</h2>
          <p style={styles.creatorsText}>Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?</p>
          <button style={styles.creatorsBtn}>Find out more</button>
        </div>
      </div>
      <div style={styles.joinSection}>
        <h2 style={styles.joinTitle}>Thanks for listening. Now join in.</h2>
        <p style={styles.joinSubtitle}>Save tracks, follow artists and build playlists. All for free.</p>
        <button style={styles.joinCreateBtn}>Create account</button>
        <div style={styles.joinLinks}>
          <span>Already have an account?</span>
          <button style={styles.joinSignIn}>Sign in</button>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;