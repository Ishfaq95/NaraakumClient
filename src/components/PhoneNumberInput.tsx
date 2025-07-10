import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle, TextStyle, I18nManager, Platform } from 'react-native';
import PhoneInput, { ICountry } from 'react-native-international-phone-number';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

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

const isSaudiArabia = (code: string): code is AllowedCountryCode => code === 'SA';

const formatSaudiNumber = (number: string): string => {
  // Remove all non-digit characters
  const digits = number.replace(/\D/g, '');
  
  // Format only if it's a Saudi number
  if (digits.length > 0) {
    let formatted = digits;
    // Format as XX XXX XXXX
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 5) {
      formatted = `${digits.slice(0, 2)} ${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
    }
    return formatted;
  }
  return number;
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
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formattedValue, setFormattedValue] = useState(value);
  const isRTL = I18nManager.isRTL;

  const handlePhoneNumberChange = (phoneNumber: string) => {
    let formattedNumber = phoneNumber;
    
    // Apply Saudi format if it's a Saudi number
    if (selectedCountry?.cca2 && isSaudiArabia(selectedCountry.cca2)) {
      formattedNumber = formatSaudiNumber(phoneNumber);
    }
    
    setFormattedValue(formattedNumber);

    try {
      const countryCode = selectedCountry?.cca2 || defaultCountry;
      // Remove spaces for validation
      const numberForValidation = formattedNumber.replace(/\s/g, '');
      const isValidNumber = isValidPhoneNumber(numberForValidation, countryCode as CountryCode);
      setIsValid(isValidNumber);
      setShowError(formattedNumber.length > 0 && !isValidNumber);
      onChangePhoneNumber({
        phoneNumber: formattedNumber,
        isValid: isValidNumber,
        countryCode: countryCode,
        fullNumber: `${selectedCountry?.callingCode || ''}${formattedNumber}`.replace(/^\++/, '+').replace(/\s/g, '')
      });
    } catch (error) {
      setIsValid(false);
      setShowError(formattedNumber.length > 0);
      onChangePhoneNumber({
        phoneNumber: formattedNumber,
        isValid: false,
        countryCode: selectedCountry?.cca2 || defaultCountry,
        fullNumber: formattedNumber
      });
    }
  };

  // Update formatting when country changes
  useEffect(() => {
    if (value && selectedCountry?.cca2 && isSaudiArabia(selectedCountry.cca2)) {
      const formatted = formatSaudiNumber(value);
      setFormattedValue(formatted);
    } else {
      setFormattedValue(value);
    }
  }, [selectedCountry, value]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputContainer,
        showError && styles.inputError,
        isRTL ? styles.inputContainerRTL : styles.inputContainerLTR
      ]}>
        <PhoneInput
          value={formattedValue}
          onChangePhoneNumber={handlePhoneNumberChange}
          selectedCountry={selectedCountry}
          onChangeSelectedCountry={setSelectedCountry}
          placeholderTextColor="#999999"
          placeholder={placeholder || "Enter phone number"}
          style={[styles.input, inputStyle]}
          defaultCountry={defaultCountry as any}
          showOnly={ALLOWED_COUNTRIES}
          disabled={!editable}
          rtl={isRTL}
          editable={editable}
          phoneInputStyles={{
            container: {
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderWidth: 0,
            },
            flagContainer: {
              [isRTL ? 'borderLeftWidth' : 'borderRightWidth']: 1,
              borderColor: '#E0E0E0',
              backgroundColor: '#FFFFFF',
              height: '100%',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 0,
              paddingRight: 10,
            },
            input: {
              textAlign: 'left',
              paddingRight: Platform.OS === 'ios' ? 8 : 0,
              writingDirection: 'ltr',
              height: '100%',
              padding: 0,
              margin: 0,
              backgroundColor: '#FFFFFF',
              borderWidth: 0,
            },
            callingCode: {
              fontSize: 14,
              color: '#000000',
              marginHorizontal: 8,
              textAlignVertical: 'center',
            }
          }}
          modalStyles={{
            modal: {
              backgroundColor: '#FFFFFF',
            },
            searchInput: {
              textAlign: 'left',
              writingDirection: 'ltr',
              height: 50,
            }
          }}
        />
      </View>
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
  },
  inputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  inputContainerLTR: {
    flexDirection: 'row',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  input: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
    textAlign: 'left',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});

export default PhoneNumberInput; 