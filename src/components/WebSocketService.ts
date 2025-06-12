// WebSocketService.js

import {PermissionsAndroid, Platform, AppState} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WEBSOCKET_URL } from '../shared/utils/constants';

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

      console.log("this.socket",this.socket)

      this.socket.onopen = async () => {
        this.isConnected = true;
      };

      this.socket.onmessage = async event => {
        const socketEvent = JSON.parse(event.data);
        // Generic message handler that can be extended by other components
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

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default WebSocketService;