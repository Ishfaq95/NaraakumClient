import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

interface ExpandIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ExpandIcon: React.FC<ExpandIconProps> = ({
  width = 24,
  height = 24,
  color = '#FFFFFF',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
        fill={color}
      />
    </Svg>
  );
};

export default ExpandIcon; 