import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';
import CustomBottomSheet from './CustomBottomSheet';

interface Country {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  dialCode: string;
  pattern: string;
  maxLength: number;
}

interface CustomPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onCountryChange?: (country: Country) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  style?: any;
  initialCountry?: Country;
}

export const COUNTRIES: Country[] = [
  {
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    dialCode: '+966',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    dialCode: '+971',
    pattern: '## ### ####',
    maxLength: 9,
  },
  {
    code: 'QA',
    name: 'Qatar',
    nameAr: 'قطر',
    flag: '🇶🇦',
    dialCode: '+974',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'KW',
    name: 'Kuwait',
    nameAr: 'الكويت',
    flag: '🇰🇼',
    dialCode: '+965',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'BH',
    name: 'Bahrain',
    nameAr: 'البحرين',
    flag: '🇧🇭',
    dialCode: '+973',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'OM',
    name: 'Oman',
    nameAr: 'عُمان',
    flag: '🇴🇲',
    dialCode: '+968',
    pattern: '#### ####',
    maxLength: 8,
  },
  {
    code: 'JO',
    name: 'Jordan',
    nameAr: 'الأردن',
    flag: '🇯🇴',
    dialCode: '+962',
    pattern: '# #### ####',
    maxLength: 9,
  },
  {
    code: 'LB',
    name: 'Lebanon',
    nameAr: 'لبنان',
    flag: '🇱🇧',
    dialCode: '+961',
    pattern: '## ### ###',
    maxLength: 8,
  },
  {
    code: 'EG',
    name: 'Egypt',
    nameAr: 'مصر',
    flag: '🇪🇬',
    dialCode: '+20',
    pattern: '## #### ####',
    maxLength: 10,
  },
  {
    code: 'IQ',
    name: 'Iraq',
    nameAr: 'العراق',
    flag: '🇮🇶',
    dialCode: '+964',
    pattern: '### ### ####',
    maxLength: 10,
  },
  {
    code: 'IR',
    name: 'Iran',
    nameAr: 'إيران',
    flag: '🇮🇷',
    dialCode: '+98',
    pattern: '### ### ####',
    maxLength: 10,
  },
  {
    code: 'TR',
    name: 'Turkey',
    nameAr: 'تركيا',
    flag: '🇹🇷',
    dialCode: '+90',
    pattern: '### ### ####',
    maxLength: 10,
  },
];

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  value,
  onChangeText,
  onCountryChange,
  placeholder = 'Enter phone number',
  error,
  disabled = false,
  style,
  initialCountry,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry || COUNTRIES[0]); // Use initialCountry or default to Saudi Arabia
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(COUNTRIES);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Filter countries based on search query
    if (searchQuery.trim() === '') {
      setFilteredCountries(COUNTRIES);
    } else {
      const filtered = COUNTRIES.filter(
        country =>
          country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          country.nameAr.includes(searchQuery) ||
          country.dialCode.includes(searchQuery)
      );
      setFilteredCountries(filtered);
    }
    console.log('Filtered countries count:', filteredCountries.length);
  }, [searchQuery]);

  const handleCountrySelect = (country: Country) => {
    console.log('Country selected:', country);
    setSelectedCountry(country);
    setShowCountryModal(false);
    setSearchQuery('');
    onCountryChange?.(country);
    
    // Clear the phone number when country changes
    onChangeText('');
    
    // Focus on input after country selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const formatPhoneNumber = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    const pattern = selectedCountry.pattern;
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < pattern.length && digitIndex < digits.length; i++) {
      if (pattern[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += pattern[i];
      }
    }
    
    return formatted;
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  const validatePhoneNumber = (): boolean => {
    const digits = value.replace(/\D/g, '');
    return digits.length === selectedCountry.maxLength;
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry.code === item.code && styles.selectedCountryItem,
      ]}
      onPress={() => handleCountrySelect(item)}
    >
      <View style={styles.countryItemContent}>
        <Text style={styles.countryFlagModal}>{item.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.countryNameAr}>{item.nameAr}</Text>
        </View>
        <Text style={styles.countryCodeModal}>{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Phone Input Field */}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {/* Country Selector */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => {
            console.log('Opening country modal');
            setShowCountryModal(true);
          }}
          disabled={disabled}
        >
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Phone Number Input */}
        <TextInput
          ref={inputRef}
          style={[styles.phoneInput, Platform.OS === 'android' && styles.androidPhoneInput]}
          value={value}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={selectedCountry.pattern.length}
          editable={!disabled}
        />
      </View>

      {/* Pattern Hint */}
      {/* <Text style={styles.patternHint}>
        Pattern: {selectedCountry.pattern}
      </Text> */}

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{'رقم جوال غير صالح'}</Text>}

      {/* Country Selection Modal */}
      <CustomBottomSheet
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        height="65%"
        backdropClickable={true}
        showHandle={true}
      >
        <View style={styles.modalContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.countriesList}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      </CustomBottomSheet>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  countrySelector: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingLeft: 8,
  },
  countryFlag: {
    fontSize: 20,
    marginLeft: 8,
  },
  countryCode: {
    ...globalTextStyles.bodyMedium,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: '#333',
    padding: 0,
    textAlign: 'left',
    // Force LTR direction for phone numbers regardless of app language
    writingDirection: 'ltr',
  },
  androidPhoneInput: {
    // Android-specific LTR forcing
    textAlign: 'left',
    textAlignVertical: 'center',
    // Force LTR layout on Android
    start: 0,
    end: undefined,
  },
  patternHint: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    marginTop: 8,
    marginLeft: 16,
    // Force LTR direction for pattern hint
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  errorText: {
    ...globalTextStyles.bodySmall,
    color: '#FF3B30',
    marginTop: 8,
    marginLeft: 16,
    // Force LTR direction for error text
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...globalTextStyles.bodyMedium,
    color: '#333',
  },
  countriesList: {
    paddingBottom: 20,
  },
  countryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCountryItem: {
    backgroundColor: '#F8F9FA',
  },
  countryItemContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  countryFlagModal: {
    fontSize: 24,
    marginLeft: 12,
  },
  countryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  countryName: {
    ...globalTextStyles.bodyMedium,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
    textAlign: 'right',
  },
  countryNameAr: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    textAlign: 'right',
  },
  countryCodeModal: {
    ...globalTextStyles.bodyMedium,
    fontWeight: '600',
    color: '#666',
  },
  // Fallback modal styles
  fallbackModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  fallbackModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  fallbackModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fallbackModalTitle: {
    ...globalTextStyles.h4,
    fontWeight: '600',
    color: '#333',
  },
  fallbackModalClose: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
});

export default CustomPhoneInput; 