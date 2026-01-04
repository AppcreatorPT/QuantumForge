import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, Box } from 'lucide-react';

const ASSETS = [
    { symbol: 'BTC/USDT', name: 'Bitcoin', type: 'crypto' },
    { symbol: 'ETH/USDT', name: 'Ethereum', type: 'crypto' },
    { symbol: 'SOL/USDT', name: 'Solana', type: 'crypto' },
    { symbol: 'XRP/USDT', name: 'Ripple', type: 'crypto' },
    { symbol: 'BNB/USDT', name: 'Binance Coin', type: 'crypto' },
    { symbol: 'ADA/USDT', name: 'Cardano', type: 'crypto' },
    { symbol: 'DOGE/USDT', name: 'Dogecoin', type: 'crypto' },
    { symbol: 'AVAX/USDT', name: 'Avalanche', type: 'crypto' },
    { symbol: 'SPY', name: 'S&P 500 ETF', type: 'stock' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'stock' },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock' },
    { symbol: 'AMD', name: 'AMD', type: 'stock' },
    { symbol: 'AMD', name: 'AMD', type: 'stock' },
    { symbol: 'EURUSD', name: 'Euro / USD', type: 'forex' },
    { symbol: 'GBPUSD', name: 'GBP / USD', type: 'forex' },
    { symbol: 'XAUUSD', name: 'Gold', type: 'forex' }
];

const SmartMentionMenu = ({ filter, onSelect, position }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredAssets = ASSETS.filter(a =>
        a.symbol.toLowerCase().includes(filter.toLowerCase()) ||
        a.name.toLowerCase().includes(filter.toLowerCase())
    ).slice(0, 5); // Limit to top 5

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    // Handle Keyboard Navigation (Listen globally when menu is active)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredAssets.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredAssets.length) % filteredAssets.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (filteredAssets[selectedIndex]) {
                    onSelect(filteredAssets[selectedIndex].symbol);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredAssets, selectedIndex, onSelect]);

    if (filteredAssets.length === 0) return null;

    return (
        <div style={{
            position: 'absolute',
            left: position.x,
            top: position.y - (filteredAssets.length * 40) - 10, // Render ABOVE the cursor
            width: '200px',
            background: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            <div style={{ padding: '4px 8px', fontSize: '10px', color: '#666', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                SMART ASSETS
            </div>
            {filteredAssets.map((asset, index) => (
                <div
                    key={asset.symbol}
                    onClick={() => onSelect(asset.symbol)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        background: index === selectedIndex ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        color: index === selectedIndex ? '#fff' : '#ccc',
                        transition: 'all 0.1s'
                    }}
                >
                    {asset.type === 'crypto' && <TrendingUp size={14} color="#00ff9d" />}
                    {asset.type === 'stock' && <Activity size={14} color="#00d8ff" />}
                    {asset.type === 'forex' && <DollarSign size={14} color="#ffde00" />}

                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{asset.symbol}</span>
                        <span style={{ fontSize: '10px', color: '#666' }}>{asset.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SmartMentionMenu;
