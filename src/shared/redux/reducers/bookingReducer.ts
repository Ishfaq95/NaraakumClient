import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface State {
  category: any;
  services: any;
  selectedSpecialtyOrService: any;
}

const initialState = {
  category: null,
  services: null,
  selectedSpecialtyOrService: null,
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
  },
});

export const {setCategory, setServices, setSelectedSpecialtyOrService} = bookingReducer.actions;
export default bookingReducer.reducer;