import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface RightArrowProps {
  width?: number;
  height?: number;
  color?: string;
}

const RightArrow: React.FC<RightArrowProps> = ({ 
  width = 24, 
  height = 24, 
  color = '#239EA0' 
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default RightArrow; 