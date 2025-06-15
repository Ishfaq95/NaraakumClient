import React from 'react';
import Svg, { Circle, Ellipse } from 'react-native-svg';

interface UserPlaceholderProps {
  width?: number;
  height?: number;
}

const UserPlaceholder: React.FC<UserPlaceholderProps> = ({
  width = 80,
  height = 80,
}) => (
  <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
    <Circle cx="40" cy="40" r="40" fill="#e0e0e0" />
    <Circle cx="40" cy="32" r="16" fill="#bdbdbd" />
    <Ellipse cx="40" cy="60" rx="22" ry="12" fill="#bdbdbd" />
  </Svg>
);

export default UserPlaceholder; 