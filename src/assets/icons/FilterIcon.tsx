import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface FilterIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const FilterIcon: React.FC<FilterIconProps> = ({ width = 24, height = 24, color = "#179c8e" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 5H20M7 12H17M10 19H14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default FilterIcon; 