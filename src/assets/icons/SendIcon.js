import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SendIcon(props) {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
      <Path 
        d="M21.99 3L1 12l20.99 9L22 14l-15-2 15-2z" 
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export default SendIcon; 