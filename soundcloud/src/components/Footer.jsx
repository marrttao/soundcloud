import React from 'react';
import like from '../assets/icons/like.png';
import next from '../assets/icons/next.png';
import prev from '../assets/icons/prev.png';
import pause from '../assets/icons/pause.png';
import play from '../assets/icons/play.png';
import shuffle from '../assets/icons/shuffle.png';
import repeat from '../assets/icons/repeat.png';
import subscribe from '../assets/icons/subscribe.png';

const Footer = () => {
    return (
        <footer
            style={{
                background: "#181818",
                padding: "0 32px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                zIndex: 1000
            }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1240px",
                gap: "32px",
                margin: "0 auto"
            }}>
                {/* Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={prev} alt="Prev" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={pause} alt="Pause" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={next} alt="Next" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={shuffle} alt="Shuffle" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={repeat} alt="Repeat" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                </div>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <span style={{ color: "#fff", fontSize: 13 }}>0:52</span>
                    <div style={{ flex: 1, height: "4px", background: "#232323", borderRadius: "2px", position: "relative" }}>
                        <div style={{ width: "20%", height: "100%", background: "#ff5500", borderRadius: "2px" }}></div>
                    </div>
                    <span style={{ color: "#fff", fontSize: 13 }}>2:51</span>
                </div>
                {/* Track info */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px" }}>
                    <img src="track logo" alt="" style={{ width: "32px", height: "32px", borderRadius: "4px", background: "#444" }} />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Lolishit</span>
                        <span style={{ color: "#ccc", fontSize: 12 }}>A.L.S.</span>
                    </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={like} alt="Like" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                    <button style={{ background: "none", border: "none", padding: 4 }}
                        onMouseOver={e => e.currentTarget.firstChild.style.filter = "brightness(0) saturate(100%) invert(53%) sepia(98%) saturate(749%) hue-rotate(-13deg) brightness(1.1)"}
                        onMouseOut={e => e.currentTarget.firstChild.style.filter = "invert(1) brightness(2)"}
                    >
                        <img src={subscribe} alt="Subscribe" style={{ width: 16, height: 16, filter: "invert(1) brightness(2)", transition: "filter 0.2s" }} />
                    </button>
                    <button style={{ background: "none", border: "none", color: "#fff", fontSize: 18, padding: 4 }}
                        onMouseOver={e => e.currentTarget.style.color = "#ff5500"}
                        onMouseOut={e => e.currentTarget.style.color = "#fff"}
                    >
                        ⋮
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
