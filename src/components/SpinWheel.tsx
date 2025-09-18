"use client";

import React, { useMemo, useRef, useState } from "react";

type Segment = {
    label: string;
    color: string;
};

// 8 segments: 5%, 10%, 15%, 20% and 4x Try Again
const segments: Segment[] = [
    { label: "5% off", color: "#e9d5ff" }, // purple-200
    { label: "Try again", color: "#e2e8f0" }, // slate-200
    { label: "10% off", color: "#fbcfe8" }, // pink-200
    { label: "Try again", color: "#e0f2fe" }, // sky-100
    { label: "15% off", color: "#bae6fd" }, // sky-200
    { label: "Try again", color: "#fef3c7" }, // amber-100
    { label: "20% off", color: "#bbf7d0" }, // green-200
    { label: "Try again", color: "#ede9fe" }, // violet-100
];

const sliceAngle = 360 / segments.length; // 45°

// Round helper to keep SSR/CSR numeric output identical
function roundTo(n: number, p = 3) {
    const m = Math.pow(10, p);
    return Math.round(n * m) / m;
}

function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleDeg: number
) {
    const rad = (Math.PI / 180) * angleDeg;
    return {
        x: roundTo(cx + r * Math.cos(rad)),
        y: roundTo(cy + r * Math.sin(rad)),
    };
}

function describeSlicePath(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return [
        `M ${roundTo(cx)} ${roundTo(cy)}`,
        `L ${roundTo(start.x)} ${roundTo(start.y)}`,
        `A ${roundTo(r)} ${roundTo(r)} 0 ${largeArcFlag} 1 ${roundTo(end.x)} ${roundTo(end.y)}`,
        "Z",
    ].join(" ");
}

export default function SpinWheel() {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const chosenIndexRef = useRef<number | null>(null);

    // Geometry
    const size = 440; // larger wheel
    const radius = size / 2 - 4; // padding for stroke
    const cx = size / 2;
    const cy = size / 2;

    const slices = useMemo(() => {
        // Ensure segment 0 is centered at 12 o'clock initially
        // Start angle is -90 - slice/2 so the mid of segment i is at -90 + i*slice
        return segments.map((seg, i) => {
            const start = -90 - sliceAngle / 2 + i * sliceAngle;
            const end = start + sliceAngle;
            const mid = start + sliceAngle / 2;
            return { seg, i, start, end, mid };
        });
    }, []);

    function spin() {
        if (isSpinning) return;
        setResult(null);

        // Choose a random segment index uniformly
        const k = Math.floor(Math.random() * segments.length);
        chosenIndexRef.current = k;

        // Compute a rotation so that segment k lands at 12 o'clock.
        // With our geometry, mid angle of seg k is (-90 + k*slice). We want it to be -90.
        // CSS rotation is clockwise-positive. So rotate by R = 360*n - k*sliceAngle
        const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins for satisfying feel
        const target = 360 * spins - k * sliceAngle;

        setIsSpinning(true);
        setRotation((prev) => prev + (target - (prev % 360))); // ensure smooth forward spin
    }

    function handleTransitionEnd() {
        setIsSpinning(false);
        const k = chosenIndexRef.current;
        if (k != null) {
            setResult(segments[k].label);
        }
    }

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Pointer */}
                <div
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 -top-3"
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: "14px solid transparent",
                        borderRight: "14px solid transparent",
                        borderBottom: "22px solid #0ea5e9", // slightly larger pointer
                    }}
                />

                {/* Wheel */}
                <svg
                    role="img"
                    aria-label="Prize wheel"
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="block rounded-full drop-shadow-xl"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning
                            ? "transform 5s cubic-bezier(0.12, 0.01, 0, 1)"
                            : undefined,
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {/* Outer circle stroke */}
                    <circle cx={cx} cy={cy} r={radius} fill="#ffffff" stroke="#e5e7eb" strokeWidth={4} />

                    {slices.map(({ seg, i, start, end, mid }) => {
                        const path = describeSlicePath(cx, cy, radius, start, end);
                        const textRadius = roundTo(radius * 0.68);
                        const textPos = polarToCartesian(cx, cy, textRadius, mid);
                        return (
                            <g key={i}>
                                <path d={path} fill={seg.color} stroke="#ffffff" strokeWidth={2} />
                                <text
                                    x={textPos.x}
                                    y={textPos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={18}
                                    fontWeight={700}
                                    fill="#0f172a"
                                    transform={`rotate(${roundTo(mid + 90)} ${textPos.x} ${textPos.y})`}
                                >
                                    {seg.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Hub */}
                    <circle cx={cx} cy={cy} r={42} fill="#0f172a" />
                    <circle cx={cx} cy={cy} r={7} fill="#0ea5e9" />
                </svg>
            </div>

            <button
                type="button"
                onClick={spin}
                disabled={isSpinning}
                className="px-7 py-3.5 rounded-full bg-emerald-600 text-white font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-700 transition text-lg"
                aria-live="polite"
                aria-label={isSpinning ? "Spinning" : "Spin the wheel"}
            >
                {isSpinning ? "Spinning…" : "Spin"}
            </button>

            {result && (
                <div className="text-center">
                    <p className="text-sm text-gray-500">Result</p>
                    <p className="text-2xl font-bold mt-1">{result}</p>
                </div>
            )}
        </div>
    );
}
