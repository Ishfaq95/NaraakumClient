import {createSlice} from '@reduxjs/toolkit';

interface State {
  user: any;
  topic:any;
}

const initialState: State = {
  user:null,
  topic: null,
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTopic: (state, action) => {
      state.topic = action.payload;
    },
  },
});

export const {setTopic } = userReducer.actions;
export default userReducer.reducer;