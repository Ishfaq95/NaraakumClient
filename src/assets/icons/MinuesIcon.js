import React from 'react';
import Svg, { Rect } from 'react-native-svg';


const MinusIcon= ({
  width = 24,
  height = 24,
  color = '#000',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="11"
        width="14"
        height="2"
        rx="1"
        fill={color}
      />
    </Svg>
  );
};

export default MinusIcon;
