import React from "react";
import { TouchableOpacity, Text } from "react-native";
import colors from "../../styles/colors";
import { globalTextStyles } from "../../styles/globalStyles";

const Button = ({
  text,
  backgroundColor,
  onPress,
  style = {},
  textStyle = {},
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: backgroundColor ? backgroundColor : "#5568FE",
        borderRadius: 12,
        marginVertical: 12,
        ...style,
      }}
    >
      <Text
        style={{
          ...globalTextStyles.buttonMedium,
          color: colors.primary["100"],
          ...textStyle,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};
export default Button;
