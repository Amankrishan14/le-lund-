import { useRef, useEffect, useState } from 'react';
import './CustomWheel.css';

function CustomWheel({ userId = 'user123' }) {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState('');
    const [items, setItems] = useState([]);
    const [pityCounters, setPityCounters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const colors = ['#8B0000', '#FFD700', '#8B0000', '#FFD700', '#8B0000', '#FFD700'];
    const textColors = ['#FFD700', '#8B0000', '#FFD700', '#8B0000', '#FFD700', '#8B0000'];

    const getPityThreshold = (weight) => {
        const thresholds = { 0: 0, 1: 60, 2: 180, 3: 300 };
        return thresholds[weight] || weight * 60;
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                const itemsResponse = await fetch(`${API_BASE_URL}/api/items`);
                if (!itemsResponse.ok) throw new Error('Failed to fetch items');
                const itemsData = await itemsResponse.json();
                setItems(itemsData);

                const pityResponse = await fetch(`${API_BASE_URL}/api/pity/${userId}`);
                if (!pityResponse.ok) throw new Error('Failed to fetch pity');
                const pityData = await pityResponse.json();
                setPityCounters(pityData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };
        initializeData();
    }, [userId, API_BASE_URL]);

    useEffect(() => {
        if (items.length > 0) drawWheel(rotation);
    }, [items, rotation, loading]);

    // Dispatch event when winner is set (for integration with SpinWheelPage)
    useEffect(() => {
        if (winner && !spinning) {
            window.dispatchEvent(new CustomEvent('spin-complete', { detail: { winner } }));
        }
    }, [winner, spinning]);

    // Dispatch event when spinning starts
    useEffect(() => {
        if (spinning) {
            window.dispatchEvent(new CustomEvent('spin-start'));
        } else if (!loading && items.length > 0) {
            window.dispatchEvent(new CustomEvent('spin-end'));
        }
    }, [spinning, loading, items.length]);

    const drawWheel = (currentRotation) => {
        const canvas = canvasRef.current;
        if (!canvas || items.length === 0) return;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const outerRadius = 240;
        const innerRadius = 220;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((currentRotation * Math.PI) / 180);

        // 1. Gold Rim
        const gradient = ctx.createLinearGradient(-outerRadius, -outerRadius, outerRadius, outerRadius);
        gradient.addColorStop(0, '#FDB931');
        gradient.addColorStop(0.5, '#FDB931');
        gradient.addColorStop(1, '#9e6f21');
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, innerRadius + 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#330000';
        ctx.fill();

        // 2. Segments
        const segmentAngle = (2 * Math.PI) / items.length;
        items.forEach((item, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, innerRadius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#FDB931';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = textColors[index % textColors.length];
            ctx.font = 'bold 20px "Arial Black", sans-serif';
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            ctx.fillText(item.name, innerRadius - 20, 0);
            ctx.restore();
        });
        ctx.restore();

        // 3. Center Hub
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        const hubGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 40);
        hubGradient.addColorStop(0, '#FFFACD');
        hubGradient.addColorStop(1, '#FDB931');
        ctx.fillStyle = hubGradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#8B0000';
        ctx.fill();
        ctx.fillStyle = '#FDB931';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SPIN', centerX, centerY);

        // 4. Pointer
        ctx.save();
        ctx.translate(centerX, 25);
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.bezierCurveTo(-15, -10, -15, -30, 0, -30);
        ctx.bezierCurveTo(15, -30, 15, -10, 0, 10);
        ctx.lineTo(0, 50);
        ctx.lineTo(0, 10);
        const pointerGrad = ctx.createLinearGradient(-15, -30, 15, 50);
        pointerGrad.addColorStop(0, '#FFD700');
        pointerGrad.addColorStop(1, '#DAA520');
        ctx.fillStyle = pointerGrad;
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    // ---- UPDATED CAP HELPER ----
    const refreshDailyCapStatus = async () => {
        try {
            // New Endpoint
            const res = await fetch(`${API_BASE_URL}/api/daily-caps`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            return data.allowedWeights; // returns array like [0, 1, 2]
        } catch (err) {
            console.error(err);
            // Default allow everything on error
            return [0, 1, 2, 3];
        }
    };

    const selectPrizeWithPity = (allowedWeights) => {
        // Filter items based on daily caps
        const eligibleItems = items.filter(item => allowedWeights.includes(item.weight));

        // Fallback to all items if filter removes everything (safety check)
        const poolItems = eligibleItems.length > 0 ? eligibleItems : items;

        for (let item of poolItems) {
            const currentPity = pityCounters[item.id] || 0;
            const threshold = getPityThreshold(item.weight);
            if (threshold > 0 && currentPity >= threshold) return { item, isPity: true };
        }

        const itemsWithProbability = poolItems.map(item => {
            const baseProbability = item.weight === 0 ? 1 : 1 / (item.weight + 1);
            const pityBoost = calculatePityBoost(item);
            return { ...item, probability: baseProbability * pityBoost };
        });

        const totalProbability = itemsWithProbability.reduce((sum, item) => sum + item.probability, 0);
        const random = Math.random();
        let cumulativeProbability = 0;

        for (let item of itemsWithProbability) {
            cumulativeProbability += (item.probability / totalProbability);
            if (random <= cumulativeProbability) return { item, isPity: false };
        }
        return { item: itemsWithProbability[itemsWithProbability.length - 1], isPity: false };
    };

    const calculatePityBoost = (item) => {
        const currentPity = pityCounters[item.id] || 0;
        const threshold = getPityThreshold(item.weight);
        if (threshold === 0 || item.weight === 0) return 1;
        const softPityStart = threshold * 0.7;
        if (currentPity >= softPityStart) {
            const progress = (currentPity - softPityStart) / (threshold - softPityStart);
            return 1 + (progress * 9);
        }
        return 1;
    };

    const spinWheel = async () => {
        if (spinning || items.length === 0) return;
        setSpinning(true);
        setWinner('');
        try {
            setRotation(0);

            // 1. Get Allowed Weights from Server
            const allowedWeights = await refreshDailyCapStatus();

            // 2. Pass Allowed Weights to Selector
            const { item: selectedPrize, isPity } = selectPrizeWithPity(allowedWeights);

            const targetIndex = items.findIndex(item => item.id === selectedPrize.id);
            const segmentAngle = 360 / items.length;
            const baseCenter = (targetIndex + 0.5) * segmentAngle;
            const jitter = (Math.random() - 0.5) * (segmentAngle * 0.4);
            const targetCenter = baseCenter + jitter;
            const targetCenterNorm = ((targetCenter % 360) + 360) % 360;
            const POINTER_ANGLE = 270;
            let finalRotationBase = POINTER_ANGLE - targetCenterNorm;
            finalRotationBase = ((finalRotationBase % 360) + 360) % 360;
            const finalRotation = (5 + Math.floor(Math.random() * 3)) * 360 + finalRotationBase;

            const newPityCounters = { ...pityCounters };
            items.forEach(item => {
                if (item.id === selectedPrize.id) newPityCounters[item.id] = 0;
                else newPityCounters[item.id] = (newPityCounters[item.id] || 0) + 1;
            });

            await fetch(`${API_BASE_URL}/api/pity/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pityCounters: newPityCounters }),
            });

            await fetch(`${API_BASE_URL}/api/spin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, itemId: selectedPrize.id, itemName: selectedPrize.name, itemWeight: selectedPrize.weight, wasPity: isPity }),
            });

            setPityCounters(newPityCounters);
            animateSpin(0, finalRotation, 4000, selectedPrize);
        } catch (err) {
            console.error(err);
            setSpinning(false);
            alert('Spin failed');
        }
    };

    const animateSpin = (start, end, duration, selectedPrize) => {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setRotation(start + (end - start) * easeOut);
            if (progress < 1) requestAnimationFrame(animate);
            else {
                setSpinning(false);
                setWinner(selectedPrize.name);
            }
        };
        requestAnimationFrame(animate);
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (error) return <div className="error-container">Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>;

    return (
        <div className="casino-wrapper">
            <div className="casino-header">
                <h1>FORTUNE WHEEL</h1>
            </div>

            <div className="wheel-center-container">
                <div className="wheel-container">
                    <canvas ref={canvasRef} width={500} height={500} />
                </div>

                <button className="spin-btn" onClick={spinWheel} disabled={spinning}>
                    {spinning ? 'SPINNING...' : 'SPIN NOW'}
                </button>

                {winner && !spinning && <div className="winner-msg">Winner: <span>{winner}</span></div>}
            </div>
        </div>
    );
}

export default CustomWheel;



