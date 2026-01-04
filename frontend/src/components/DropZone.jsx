import React from 'react';
import { UploadCloud } from 'lucide-react';

const DropZone = ({ visible }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none', // Allow events to bubble if needed (though dragging handles this)
            border: '4px dashed var(--cyber-green)',
            color: 'var(--cyber-green)'
        }}>
            <div style={{
                animation: 'bounce 1s infinite'
            }}>
                <UploadCloud size={120} />
            </div>
            <h1 style={{ marginTop: '20px', fontSize: '32px', textTransform: 'uppercase', letterSpacing: '4px' }}>
                Drop to Analyze
            </h1>
            <p style={{ color: '#fff', marginTop: '10px' }}>Images / Pine / CSV</p>
        </div>
    );
};

export default DropZone;
