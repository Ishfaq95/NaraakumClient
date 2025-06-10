import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ClockIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ClockIcon: React.FC<ClockIconProps> = ({ 
  width = 18, 
  height = 18, 
  color = '#239EA0' 
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default ClockIcon; 