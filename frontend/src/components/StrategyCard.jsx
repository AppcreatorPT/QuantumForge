import React from 'react';
import { TrendingUp, BarChart2, Activity, Percent } from 'lucide-react';

const StrategyCard = ({ title, winRate, profitFactor, netProfit, trades }) => {
    return (
        <div className="strategy-card glass-panel" style={{
            background: 'linear-gradient(145deg, rgba(20,20,30,0.8), rgba(10,10,15,0.95))',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: '-50%', right: '-50%', width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(0,255,157,0.1) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none'
            }}></div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="text-gradient" style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="var(--neon-green)" />
                    {title || "Strategy Forecast"}
                </h3>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#888' }}>
                    ESTIMATED
                </span>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Win Rate */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Percent size={12} /> Win Rate
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--neon-green)' }}>
                        {winRate || "--%"}
                    </div>
                </div>

                {/* Profit Factor */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BarChart2 size={12} /> Profit Factor
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffde00' }}>
                        {profitFactor || "N/A"}
                    </div>
                </div>

                {/* Net Profit */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} /> Net Profit
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
                        {netProfit || "--"}
                    </div>
                </div>

                {/* Trades */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={12} /> Trades
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d8ff' }}>
                        {trades || "--"}
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER (REMIX STATION) */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                <button className="hover-scale" style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    onClick={() => window.dispatchEvent(new CustomEvent('strategy-action', { detail: { type: 'OPTIMIZE', title } }))}>
                    ⚡ OPTIMIZE
                </button>
                <button className="hover-scale" style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    onClick={() => window.dispatchEvent(new CustomEvent('strategy-action', { detail: { type: 'REMIX', title } }))}>
                    🎲 REMIX
                </button>
                <button className="hover-scale" style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    onClick={() => window.dispatchEvent(new CustomEvent('strategy-action', { detail: { type: 'AGGRESSIVE', title } }))}>
                    🔥 AGGRESSIVE
                </button>
            </div>
        </div>
    );
};

export default StrategyCard;
