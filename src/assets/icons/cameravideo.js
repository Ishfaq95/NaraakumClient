import * as React from "react";
import Svg, { Rect, G } from "react-native-svg";

function CameraVideo(props) {
  const { 
    width = 24, 
    height = 24, 
    primaryColor = "#4a5568", 
    backgroundColor = "#e2e8f0"
  } = props;
  
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Light gray background */}
      <Rect width={width} height={height} fill={backgroundColor} rx={2} />
      
      <G id="video-camera">
        {/* Main camera body - horizontal rounded rectangle */}
        <Rect
          x={width * 0.1}
          y={height * 0.3}
          width={width * 0.8}
          height={height * 0.4}
          rx={width * 0.1}
          fill={primaryColor}
        />
        
        {/* Two circular lenses/reels on the left side */}
        <Rect
          x={width * 0.18}
          y={height * 0.35}
          width={width * 0.15}
          height={width * 0.15}
          rx={width * 0.075}
          fill={primaryColor}
        />
        <Rect
          x={width * 0.37}
          y={height * 0.35}
          width={width * 0.15}
          height={width * 0.15}
          rx={width * 0.075}
          fill={primaryColor}
        />
        
        {/* Side element - vertical rounded rectangle extending from right side */}
        <Rect
          x={width * 0.85}
          y={height * 0.15}
          width={width * 0.1}
          height={height * 0.7}
          rx={width * 0.05}
          fill={primaryColor}
        />
      </G>
    </Svg>
  );
}

export default CameraVideo;
