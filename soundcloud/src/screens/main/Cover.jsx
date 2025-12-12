import React from 'react';
import useBreakpoint from '../../hooks/useBreakpoint';

const FALLBACK_ART = 'https://i.imgur.com/6unG5jv.png';

const Cover = ({
    imageUrl,
    title,
    subtitle,
    badge,
    onClick,
    disabled = false
}) => {
    const artwork = imageUrl || FALLBACK_ART;
    const isCompact = useBreakpoint(520);
    const cardWidth = isCompact ? 150 : 192;
    const cardHeight = isCompact ? 184 : 208;
    const artSize = isCompact ? 128 : 160;
    const cardPadding = isCompact ? 12 : 16;
    const textWidth = artSize;

    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${cardPadding}px`,
                boxSizing: 'border-box',
                backgroundColor: '#1a1a1a',
                border: 'none',
                borderRadius: '12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'transform 0.2s ease'
            }}
        >
            <div style={{
                position: 'relative',
                width: `${artSize}px`,
                height: `${artSize}px`,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#222'
            }}>
                <img
                    src={artwork}
                    alt={title ?? ''}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                {badge ? (
                    <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        {badge}
                    </span>
                ) : null}
            </div>
            <div style={{
                width: `${textWidth}px`,
                height: isCompact ? '36px' : '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#fff',
                textAlign: 'left'
            }}>
                <p style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {title ?? 'Untitled'}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: '11px',
                    opacity: 0.7,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {subtitle ?? ''}
                </p>
            </div>
        </button>
    );
};

export default Cover;