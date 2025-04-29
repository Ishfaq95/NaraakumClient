import * as React from "react";
import Svg, { Path } from "react-native-svg";

function RightArrowWhiteIcon(props) {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
      <Path 
        d="M7.293 4.707L14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" 
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export default RightArrowWhiteIcon; 