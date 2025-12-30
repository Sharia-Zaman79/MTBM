import React from "react";

// Base paths for flight indicator assets
const ASSETS = {
  fi_box: "/flight-indicators/fi_box~GsuVzeko.svg",
  fi_circle: "/flight-indicators/fi_circle~UWbONNsy.svg",
  fi_needle: "/flight-indicators/fi_needle~xDIrdyew.svg",
  fi_needle_small: "/flight-indicators/fi_needle_small~boLlQwLq.svg",
  fi_tc_airplane: "/flight-indicators/fi_tc_airplane~rlIjNUeF.svg",
  heading_yaw: "/flight-indicators/heading_yaw~bobjMqwT.svg",
  heading_mechanics: "/flight-indicators/heading_mechanics~LnEXqkNn.svg",
  horizon_back: "/flight-indicators/horizon_back~voMaAEaI.svg",
  horizon_ball: "/flight-indicators/horizon_ball~bcMjrNsr.svg",
  horizon_circle: "/flight-indicators/horizon_circle~qRDWUGmQ.svg",
  horizon_mechanics: "/flight-indicators/horizon_mechanics~rRLTtKVH.svg",
  turn_coordinator: "/flight-indicators/turn_coordinator~AOvMJjuH.svg",
  vertical_mechanics: "/flight-indicators/vertical_mechanics~necSfeyG.svg",
};

const boxStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
};

interface InstrumentProps {
  children: React.ReactNode;
  showBox?: boolean;
  size?: string | number;
}

function Instrument({ children, showBox = false, size }: InstrumentProps) {
  return (
    <div
      style={{
        height: size ?? "100%",
        width: size ?? "100%",
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
      }}
    >
      {showBox && <img src={ASSETS.fi_box} style={boxStyle} alt="" />}
      {children}
    </div>
  );
}

// Heading Indicator
interface HeadingIndicatorProps {
  heading?: number;
  showBox?: boolean;
  size?: string | number;
}

export function HeadingIndicator({
  heading = 0,
  showBox = false,
  size,
}: HeadingIndicatorProps) {
  return (
    <Instrument showBox={showBox} size={size}>
      <div
        style={{
          ...boxStyle,
          transform: `rotate(${-heading}deg)`,
        }}
      >
        <img src={ASSETS.heading_yaw} style={boxStyle} alt="" />
      </div>
      {/* Minimal direction marker */}
      <div style={boxStyle}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          {/* Simple triangle pointer */}
          <polygon points="50,18 46,28 54,28" fill="#22C55E" />
        </svg>
      </div>
      <div style={boxStyle}>
        <img src={ASSETS.fi_circle} style={boxStyle} alt="" />
      </div>
    </Instrument>
  );
}

// Attitude Indicator
interface AttitudeIndicatorProps {
  roll?: number;
  pitch?: number;
  showBox?: boolean;
  size?: string | number;
}

export function AttitudeIndicator({
  roll = 0,
  pitch = 0,
  showBox = false,
  size,
}: AttitudeIndicatorProps) {
  const pitchBound = 30;
  const clampedPitch = Math.max(-pitchBound, Math.min(pitchBound, pitch));
  const pitchOffset = (clampedPitch / pitchBound) * 25; // 25% max translation

  return (
    <Instrument showBox={showBox} size={size}>
      <div style={boxStyle}>
        <img src={ASSETS.horizon_back} style={boxStyle} alt="" />
      </div>
      <div
        style={{
          ...boxStyle,
          transform: `rotate(${roll}deg)`,
        }}
      >
        <div
          style={{
            ...boxStyle,
            transform: `translateY(${pitchOffset}%)`,
          }}
        >
          <img src={ASSETS.horizon_ball} style={boxStyle} alt="" />
        </div>
      </div>
      <div
        style={{
          ...boxStyle,
          transform: `rotate(${roll}deg)`,
        }}
      >
        <img src={ASSETS.horizon_circle} style={boxStyle} alt="" />
      </div>
      <div style={boxStyle}>
        <img src={ASSETS.horizon_mechanics} style={boxStyle} alt="" />
      </div>
      <div style={boxStyle}>
        <img src={ASSETS.fi_circle} style={boxStyle} alt="" />
      </div>
    </Instrument>
  );
}

// Variometer
interface VariometerProps {
  vario?: number;
  showBox?: boolean;
  size?: string | number;
}

export function Variometer({
  vario = 0,
  showBox = false,
  size,
}: VariometerProps) {
  const varioBound = 1950;
  const clampedVario = Math.max(-varioBound, Math.min(varioBound, vario));
  const rotation = (clampedVario / varioBound) * 90; // -90 to +90 degrees

  return (
    <Instrument showBox={showBox} size={size}>
      <div style={boxStyle}>
        <img src={ASSETS.vertical_mechanics} style={boxStyle} alt="" />
      </div>
      <div
        style={{
          ...boxStyle,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <img src={ASSETS.fi_needle} style={boxStyle} alt="" />
      </div>
      <div style={boxStyle}>
        <img src={ASSETS.fi_circle} style={boxStyle} alt="" />
      </div>
    </Instrument>
  );
}

// Turn Coordinator
interface TurnCoordinatorProps {
  turn?: number;
  showBox?: boolean;
  size?: string | number;
}

export function TurnCoordinator({
  turn = 0,
  showBox = false,
  size,
}: TurnCoordinatorProps) {
  const turnBound = 30;
  const clampedTurn = Math.max(-turnBound, Math.min(turnBound, turn));
  const rotation = clampedTurn;

  return (
    <Instrument showBox={showBox} size={size}>
      <div style={boxStyle}>
        <img src={ASSETS.turn_coordinator} style={boxStyle} alt="" />
      </div>
      <div
        style={{
          ...boxStyle,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <img src={ASSETS.fi_tc_airplane} style={boxStyle} alt="" />
      </div>
      <div style={boxStyle}>
        <img src={ASSETS.fi_circle} style={boxStyle} alt="" />
      </div>
    </Instrument>
  );
}
