import React from 'react';
import Cover from './Cover';

const Choice = () => {
  const carouselRef = React.useRef(null);

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const itemWidth = 192 + 16;
    const visibleItems = Math.floor(container.clientWidth / itemWidth);
    const scrollDistance = itemWidth * Math.max(1, visibleItems - 1);
    const target = Math.max(0, container.scrollLeft - scrollDistance);
    container.scrollTo({ left: target, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const itemWidth = 192 + 16;
    const visibleItems = Math.floor(container.clientWidth / itemWidth);
    const scrollDistance = itemWidth * Math.max(1, visibleItems - 1);
    const maxScroll = container.scrollWidth - container.clientWidth;
    const target = Math.min(maxScroll, container.scrollLeft + scrollDistance);
    container.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <p style={{
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0,
        paddingLeft: '16px'
      }}>Recently Played</p>
      <div style={{
        width: '100%',
        minHeight: '264px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <button onClick={scrollLeft} style={{
          position: 'absolute',
          left: '10px',
          zIndex: 10,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px'
        }}>‹</button>
        
        <div ref={carouselRef} style={{
          display: 'flex',
          gap: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          overflowX: 'scroll',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="carousel-container">
          <Cover />
          <Cover />
          <Cover />
          <Cover />
          <Cover />
        </div>

        <button onClick={scrollRight} style={{
          position: 'absolute',
          right: '10px',
          zIndex: 10,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px'
        }}>›</button>
      </div>
      <style>{`
        .carousel-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Choice;