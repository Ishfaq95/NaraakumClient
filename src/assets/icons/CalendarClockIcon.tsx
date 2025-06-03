import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface CalendarClockIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const CalendarClockIcon: React.FC<CalendarClockIconProps> = ({
  width = 32,
  height = 32,
  color = '#22A6A7',
}) => (
  <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
    {/* Calendar body */}
    <Rect x="3" y="6" width="18" height="14" rx="3" stroke={color} strokeWidth="2" fill="#fff" />
    {/* Calendar header */}
    <Rect x="3" y="6" width="18" height="4" rx="1.5" fill={color} fillOpacity={0.15} />
    {/* Calendar rings */}
    <Path d="M8 4v4M16 4v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Calendar horizontal line */}
    <Path d="M3 10h18" stroke={color} strokeWidth="2" />
    {/* Clock overlay */}
    <Circle cx="22.5" cy="19.5" r="6" stroke={color} strokeWidth="2" fill="#fff" />
    {/* Clock hands */}
    <Path d="M22.5 19.5v-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M22.5 19.5h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export default CalendarClockIcon; 