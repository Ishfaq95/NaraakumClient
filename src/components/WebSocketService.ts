// WebSocketService.js

import {PermissionsAndroid, Platform, AppState} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WEBSOCKET_URL } from '../shared/utils/constants';
import { setUnreadMessages } from '../shared/redux/reducers/userReducer';

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private locationInterval: number | null = null;
  private appState: string = AppState.currentState;
  private locationUpdateInfo = {};
  private watchId: number | null = null;
  private taskList: any[] = [];
  private userId: any = null;
  private messageCallbacks: Map<string, Function> = new Map();
  private unreadCheckInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  // Add a global message handler that will work across all screens
  public addGlobalMessageHandler() {
    if (this.socket) {
      // Make sure we don't add duplicate handlers
      this.socket.onmessage = async event => {
        try {
          const socketEvent = JSON.parse(event.data);
          // Call the appropriate handlers based on the message type
          if (socketEvent.Command === 74) {
            // We need to get dispatch from the store
            const store = require('../shared/redux/store').store;
            if (store && store.dispatch) {
              this.socketCommandHandler(socketEvent, store.dispatch);
            }
          }
          
          // Notify any registered callbacks
          this.messageCallbacks.forEach((callback, type) => {
            if (socketEvent.Command === parseInt(type)) {
              callback(socketEvent);
            }
          });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    }
  }

  public async connect(
    presence: number,
    communicationKey: string,
    userId: any,
  ): Promise<void> {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      const deviceId = await this.getDeviceId();
      const url = `${WEBSOCKET_URL}connectionMode=${presence}&deviceId=${deviceId}&communicationKey=${communicationKey}`;
      this.socket = new WebSocket(url);
      this.userId = userId;

      this.socket.onopen = async () => {
        this.isConnected = true;
        // Add the global message handler when connection is established
        this.addGlobalMessageHandler();
      };

      this.socket.onclose = () => {
        this.isConnected = false;

        setTimeout(async () => {
          const persistedState = await AsyncStorage.getItem('persist:root');
          if (persistedState) {
            const parsedState = JSON.parse(persistedState);
            const rootState = JSON.parse(parsedState.user);
            const {CommunicationKey, Id} = rootState.user;
            
            this.connect(presence, CommunicationKey, Id);
          }
        }, 5000); // Attempt to reconnect
      };

      this.socket.onerror = error => {
        console.error('WebSocket error:', error.message);
      };
    }
  }

  socketCommandHandler(socketEvent: any, dispatch: any) {
    if(socketEvent.Command == 74){
      // Convert message string to number
      const messageCount = parseInt(socketEvent.Message, 10);
      // Dispatch only if the number is greater than 0
      if(messageCount > 0){
        dispatch(setUnreadMessages(socketEvent.Message));
      }else{
        dispatch(setUnreadMessages(0));
      }
    }
  }

  private async getDeviceId() {
    const id = await DeviceInfo.getUniqueId();
    return id;
  }

  private handleAppStateChange(nextAppState: string) {
    if (
      this.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Reconnection is now handled by the component that needs the socket
    } else if (nextAppState.match(/inactive|background/)) {
      // You can add background handling here if needed
    }
    this.appState = nextAppState;
  }

  // Get the socket instance (for use in components to directly add listeners)
  public getSocket(): WebSocket | null {
    return this.socket;
  }

  // Check if socket is connected
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  // Send message via WebSocket
  public async sendMessage(messageData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      // Send the data
      try {
        this.socket.send(JSON.stringify(messageData));
        resolve(messageData);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Register a callback for specific message types
  public registerMessageCallback(messageType: string, callback: Function): void {
    this.messageCallbacks.set(messageType, callback);
  }

  // Unregister a callback
  public unregisterMessageCallback(messageType: string): void {
    this.messageCallbacks.delete(messageType);
  }

  public checkUnreadMessages(userId: string): void {
    if (this.socket && this.isSocketConnected() && userId) {
      const getCountUnreadMessages = {
        ConnectionMode: 1,
        Command: 74,
        FromUser: { Id: userId },
      };
      this.sendMessage(getCountUnreadMessages).catch(error => 
        console.error('Error sending unread messages check:', error)
      );
    }
  }
  
  // Start periodic checking of unread messages
  public startPeriodicUnreadCheck(userId: string, interval: number = 5000): void {
    // Clear any existing interval first
    this.stopPeriodicUnreadCheck();
    
    // Store the user ID
    this.userId = userId;
    
    // Start a new interval
    this.unreadCheckInterval = setInterval(() => {
      if (this.userId) {
        this.checkUnreadMessages(this.userId);
      }
    }, interval);
  }
  
  // Stop periodic checking
  public stopPeriodicUnreadCheck(): void {
    if (this.unreadCheckInterval) {
      clearInterval(this.unreadCheckInterval);
      this.unreadCheckInterval = null;
    }
  }

  public disconnect(): void {
    // Stop the periodic check
    this.stopPeriodicUnreadCheck();
    
    // Close the socket
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default WebSocketService;