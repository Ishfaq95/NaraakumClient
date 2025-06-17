import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface CardItem {
  providerId: string;
  providerName: string;
  selectedSlot: string;
  selectedDate: string;
  provider: any; // Full provider object
}

interface State {
  category: any;
  services: any;
  selectedSpecialtyOrService: any;
  cardItems: CardItem[];
}

const initialState = {
  category: null,
  services: null,
  selectedSpecialtyOrService: null,
  cardItems: [],
} as State;

export const bookingReducer = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setServices: (state, action) => {
      state.services = action.payload;
    },
    setSelectedSpecialtyOrService: (state, action) => {
      state.selectedSpecialtyOrService = action.payload;
    },
    addCardItem: (state, action) => {
      // Remove any existing selection and add new one
      state.cardItems = [action.payload];
    },
    removeCardItem: (state, action) => {
      state.cardItems = state.cardItems.filter(item => item.providerId !== action.payload);
    },
    clearCardItems: (state) => {
      state.cardItems = [];
    },
  },
});

export const {setCategory, setServices, setSelectedSpecialtyOrService, addCardItem, removeCardItem, clearCardItems} = bookingReducer.actions;
export default bookingReducer.reducer;