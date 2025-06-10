import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface CalendarIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ 
  width = 18, 
  height = 18, 
  color = '#239EA0' 
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M16 3v4M8 3v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 9h18" stroke={color} strokeWidth="2" />
  </Svg>
);

export default CalendarIcon; 