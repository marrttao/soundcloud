import React from 'react';

const Cover = () => {
    return (
        <div style={{
            width: '192px',
            height: '208px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box',
            backgroundColor: '#1a1a1a'
        }}>
            <img 
                src="" 
                alt="" 
                style={{
                    width: '160px',
                    height: '160px',
                    objectFit: 'cover'
                }}
            />
            <div style={{
                width: '160px',
                height: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#fff'
            }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>name of track</p>
                <p style={{ margin: 0, fontSize: '10px', opacity: 0.7 }}>autor</p>
            </div>
        </div>
    );
};

export default Cover;