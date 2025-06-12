import React, { useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import SearchInput from '../common/SearchInput';

const Specialties = () => {
  const category = useSelector((state: any) => state.root.booking.category);
  const [search, setSearch] = useState('');

  console.log("category", category);
  return (
    <View style={{ flex: 1 }}>
      <SearchInput
        placeholder="بحث عن التخصص"
        value={search}
        onChangeText={setSearch}
      />
      {/* Other content goes here */}
    </View>
  );
};

export default Specialties; 