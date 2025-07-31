import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ViewStyle, TextStyle, Platform } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { isValidPhoneNumber, CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { globalTextStyles } from '../styles/globalStyles';

// Define allowed countries as string literals
type AllowedCountryCode = 'AE' | 'BH' | 'IQ' | 'IR' | 'JO' | 'KW' | 'LB' | 'OM' | 'PS' | 'QA' | 'SA' | 'SY' | 'TR' | 'YE';

const ALLOWED_COUNTRIES: AllowedCountryCode[] = [
  'AE', // United Arab Emirates
  'BH', // Bahrain
  'IQ', // Iraq
  'IR', // Iran
  'JO', // Jordan
  'KW', // Kuwait
  'LB', // Lebanon
  'OM', // Oman
  'PS', // Palestine
  'QA', // Qatar
  'SA', // Saudi Arabia
  'SY', // Syria
  'TR', // Turkey
  'YE'  // Yemen
];

// Country-specific phone number patterns and lengths
const COUNTRY_PATTERNS: Record<AllowedCountryCode, { pattern: string; maxLength: number; format: (input: string) => string }> = {
  'SA': {
    pattern: '## ### ####',
    maxLength: 9,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    }
  },
  'AE': {
    pattern: '## ### ####',
    maxLength: 9,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    }
  },
  'QA': {
    pattern: '#### ####',
    maxLength: 8,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
    }
  },
  'KW': {
    pattern: '#### ####',
    maxLength: 8,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
    }
  },
  'BH': {
    pattern: '#### ####',
    maxLength: 8,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
    }
  },
  'OM': {
    pattern: '#### ####',
    maxLength: 8,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
    }
  },
  'JO': {
    pattern: '# #### ####',
    maxLength: 9,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 1) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
      return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5, 9)}`;
    }
  },
  'LB': {
    pattern: '## ### ###',
    maxLength: 8,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)}`;
    }
  },
  'SY': {
    pattern: '### ### ###',
    maxLength: 9,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
  },
  'IQ': {
    pattern: '### ### ####',
    maxLength: 10,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  },
  'IR': {
    pattern: '### ### ####',
    maxLength: 10,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  },
  'TR': {
    pattern: '### ### ## ##',
    maxLength: 10,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }
  },
  'YE': {
    pattern: '### ### ###',
    maxLength: 9,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
  },
  'PS': {
    pattern: '### ### ###',
    maxLength: 9,
    format: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
  }
};

interface Props {
  value: string;
  onChangePhoneNumber: (data: {
    phoneNumber: string;
    isValid: boolean;
    countryCode: string;
    fullNumber: string;
  }) => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  placeholder?: string;
  errorText?: string;
  defaultCountry?: string;
  editable?: boolean;
}

const PhoneNumberInput: React.FC<Props> = ({
  value,
  onChangePhoneNumber,
  containerStyle,
  inputStyle,
  errorStyle,
  placeholder,
  errorText = 'Invalid phone number',
  defaultCountry = 'SA',
  editable = true
}) => {
  const [isValid, setIsValid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formattedValue, setFormattedValue] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<AllowedCountryCode>(defaultCountry as AllowedCountryCode);
  
  const phoneInput = useRef<PhoneInput>(null);

  const formatPhoneNumber = (text: string, countryCode: AllowedCountryCode): string => {
    const pattern = COUNTRY_PATTERNS[countryCode];
    if (!pattern) return text;
    
    // Get only digits and limit to maxLength
    const digits = text.replace(/\D/g, '').slice(0, pattern.maxLength);
    return pattern.format(digits);
  };

  const handlePhoneNumberChange = (text: string) => {
    // Get current cursor position to maintain it after formatting
    const currentLength = formattedValue.length;
    
    // Extract digits only
    const digits = text.replace(/\D/g, '');
    const pattern = COUNTRY_PATTERNS[selectedCountryCode];
    
    if (!pattern) return;
    
    // Don't allow more digits than the pattern allows
    if (digits.length > pattern.maxLength) {
      return;
    }
    
    // Format the number according to country pattern
    const formatted = pattern.format(digits);
    
    // Update state immediately for real-time formatting
    setFormattedValue(formatted);
    
    // Validate and call parent callback
    validateAndCallback(digits, formatted);
  };

  const validateAndCallback = (digits: string, formatted: string) => {
    try {
      const pattern = COUNTRY_PATTERNS[selectedCountryCode];
      
      // Check if we have the minimum required digits and validate with libphonenumber
      const callingCode = getCountryCallingCode(selectedCountryCode as CountryCode);
      const fullNumberForValidation = `+${callingCode}${digits}`;
      
      // Consider valid if it matches the expected length and passes libphonenumber validation
      const isCompleteLength = digits.length === pattern.maxLength;
      const isValidNumber = digits.length > 0 && isCompleteLength && isValidPhoneNumber(fullNumberForValidation);
      
      setIsValid(isValidNumber);
      setShowError(digits.length > 0 && !isValidNumber && digits.length >= pattern.maxLength);
      
      onChangePhoneNumber({
        phoneNumber: formatted,
        isValid: isValidNumber,
        countryCode: selectedCountryCode,
        fullNumber: fullNumberForValidation
      });
    } catch (error) {
      console.log('Validation error:', error);
      const hasDigits = digits.length > 0;
      setIsValid(false);
      setShowError(hasDigits);
      onChangePhoneNumber({
        phoneNumber: formatted,
        isValid: false,
        countryCode: selectedCountryCode,
        fullNumber: `+${getCountryCallingCode(selectedCountryCode as CountryCode)}${digits}`
      });
    }
  };

  const handleCountryChange = (country: any) => {
    const newCountryCode = country.cca2?.toUpperCase() as AllowedCountryCode;
    
    // Only allow countries in our allowed list
    if (ALLOWED_COUNTRIES.includes(newCountryCode)) {
      setSelectedCountryCode(newCountryCode);
      
      // Clear current value when country changes or reformat if there's existing text
      if (formattedValue) {
        const digits = formattedValue.replace(/\D/g, '');
        const newFormatted = formatPhoneNumber(digits, newCountryCode);
        setFormattedValue(newFormatted);
        validateAndCallback(digits, newFormatted);
      }
    }
  };

  // Handle external value changes
  useEffect(() => {
    if (value !== formattedValue) {
      const formatted = formatPhoneNumber(value, selectedCountryCode);
      setFormattedValue(formatted);
      if (value) {
        const digits = value.replace(/\D/g, '');
        validateAndCallback(digits, formatted);
      }
    }
  }, [value]);

  // Update formatting when country changes
  useEffect(() => {
    if (formattedValue) {
      const digits = formattedValue.replace(/\D/g, '');
      const newFormatted = formatPhoneNumber(digits, selectedCountryCode);
      if (newFormatted !== formattedValue) {
        setFormattedValue(newFormatted);
        validateAndCallback(digits, newFormatted);
      }
    }
  }, [selectedCountryCode]);

  const currentPattern = COUNTRY_PATTERNS[selectedCountryCode];
  

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputContainer,
        showError && styles.inputError
      ]}>
        <PhoneInput
          ref={phoneInput}
          value={formattedValue}
          defaultCode={selectedCountryCode}
          layout="first"
          onChangeText={handlePhoneNumberChange}
          onChangeCountry={handleCountryChange}
          placeholder={placeholder || currentPattern.pattern}
          withDarkTheme={false}
          withShadow={false}
          autoFocus={false}
          disabled={!editable}
          
          disableArrowIcon={false}
          containerStyle={[styles.phoneContainer]}
          textContainerStyle={[styles.textContainer]}
          textInputStyle={[styles.textInput, inputStyle]}
          codeTextStyle={styles.codeText}
          flagButtonStyle={styles.flagButton}
          countryPickerButtonStyle={styles.countryPicker}
          filterProps={{
            placeholder: 'Search country...'
          }}
          textInputProps={{
            value: formattedValue,
            onChangeText: handlePhoneNumberChange,
            maxLength: currentPattern.maxLength + 5,
            keyboardType: 'phone-pad',
            returnKeyType: 'done',
            textAlign: 'left',
            style: {
              writingDirection: 'rtl',
              textAlign: 'right',
              fontSize: 14,
            }
          }}
        />
      </View>
      
      {/* Show pattern hint when empty and no error */}
      {!showError && !formattedValue && (
        <Text style={styles.patternHint}>
          Format: {currentPattern.pattern}
        </Text>
      )}
      
      {/* Show error */}
      {showError && (
        <Text style={[styles.errorText, errorStyle]}>
          {errorText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // paddingRight: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  phoneContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    flexDirection: 'row-reverse', // Force flag to left side
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    paddingVertical: 0,
    height: '100%',
    flexDirection: 'row-reverse',
    flex: 1,
    marginLeft: 0, // Ensure no margin pushes it right
    alignItems: 'center',
  },
  textInput: {
    ...globalTextStyles.bodySmall,
    color: '#000000',
    height: '100%',
    textAlign: 'left',
    writingDirection: 'rtl',
    fontSize: 14,
    paddingLeft: 10,
  },
  codeText: {
    ...globalTextStyles.bodySmall,
    color: '#000000',
    textAlign: 'left',
    writingDirection: 'rtl',
    fontSize: 14,
  },
  flagButton: {
    backgroundColor: 'transparent',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 10,
    height: '100%',
    minWidth: 80, // Ensure enough space for flag and code
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  countryPicker: {
    backgroundColor: 'transparent',
    height: '100%',
    minWidth: 80, // Ensure enough space
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...globalTextStyles.caption,
    color: '#FF3B30',
    marginTop: 4,
    fontSize: 12,
  },
  patternHint: {
    ...globalTextStyles.caption,
    color: '#999999',
    marginTop: 4,
    fontSize: 12,
  },
});

export default PhoneNumberInput;