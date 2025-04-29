import * as React from "react";
import Svg, { Path } from "react-native-svg";

function MessageDeliveredIcon(props) {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" {...props}>
      <Path 
        d="M2 8l4 4 8-8M2 12l4 4 8-8" 
        fill="none" 
        stroke="#888" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default MessageDeliveredIcon; 