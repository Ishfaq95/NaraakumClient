import {createSlice} from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface State {
  user: any;
  topic:any;
  token:any;
  expiresAt:any;
  appVersionCode:any;
  mediaToken: any;
  mediaTokenExpiresAt: any;
  rememberMeRedux: any;
  notificationList: any;
}

const initialState = {
  user: null,
  topic: null,
  token: null,
  expiresAt: null,
  appVersionCode: Platform.OS=="android"? "1.0.3":"1.0.3",
  mediaToken: null,
  mediaTokenExpiresAt: null,
  rememberMeRedux: null,
  notificationList: null,
} as State;

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTopic: (state, action) => {
      state.topic = action.payload;
    },
    setRememberMeRedux: (state, action) => {
      state.rememberMeRedux = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken:(state, action)=>{
      state.token = action.payload.token;
      state.expiresAt = action.payload.expiresAt;
    },
    setMediaToken: (state, action) => {
      state.mediaToken = action.payload.token;
      state.mediaTokenExpiresAt = action.payload.expiresAt;
    },
    setNotificationList: (state, action) => {
      state.notificationList = action.payload;
    },
    logout: (state) => {
      return initialState;
    }
  },
});

export const {setTopic, setToken, setUser, setMediaToken, logout, setRememberMeRedux, setNotificationList} = userReducer.actions;
export default userReducer.reducer;