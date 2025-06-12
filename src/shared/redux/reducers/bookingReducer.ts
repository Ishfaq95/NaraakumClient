import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface State {
  category: any;
}

const initialState = {
  category: null,
} as State;

export const bookingReducer = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
  },
});

export const {setCategory} = bookingReducer.actions;
export default bookingReducer.reducer;