/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, type FC } from 'react';
import type { AuthContextInterface } from '../types/auth.interface';
import { Alert, Platform } from 'react-native';
import type { IAmityUIkitProvider } from './amity-ui-kit-provider';
import { Client } from '@amityco/ts-sdk-react-native';
import connectionStateSlice from '../redux/slices/ConnectionStateSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const AuthContext = React.createContext<AuthContextInterface>({
  client: {},
  isConnecting: false,
  error: '',
  login: () => {},
  logout: () => {},
  isConnected: false,
  sessionState: '',
  apiRegion: 'sg',
  authToken: '',
  fcmToken: undefined,
});

export const AuthContextProvider: FC<IAmityUIkitProvider> = ({
  userId,
  displayName,
  apiKey,
  apiRegion,
  apiEndpoint,
  children,
  authToken,
  fcmToken,
}: IAmityUIkitProvider) => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState('');
  const { connectionState } = useSelector(
    (state: RootState) => state.connectionState
  );

  const client: Amity.Client = Client.createClient(apiKey, apiRegion, {
    apiEndpoint: { http: apiEndpoint },
    prefixDeviceIdKey: 'chat',
  });

  const sessionHandler: Amity.SessionHandler = {
    sessionWillRenewAccessToken(renewal) {
      renewal.renew();
    },
  };

  useEffect(() => {
    const unsubscribe = Client.onRTEConnectionStateChange((state) => {
      dispatch(
        connectionStateSlice.actions.updateConnectionState({
          connectionState: state,
        })
      );
    });

    return () => {
      unsubscribe?.();
    };
  }, [dispatch]);

  useEffect(() => {
    if (connectionState === 'disconnected') {
      Client.getActiveClient().mqtt?.reconnect();
    }
  }, [connectionState]);

  useEffect(() => {
    return Client.onSessionStateChange((state: Amity.SessionStates) =>
      setSessionState(state)
    );
  }, []);

  const startSync = () => {
    Client.enableUnreadCount();
  };

  useEffect(() => {
    if (sessionState === 'established') {
      startSync();
      setIsConnected(true);
    }
  }, [sessionState]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const handleConnect = async () => {
    let loginParam;

    loginParam = {
      userId: userId,
      displayName: displayName, // optional
    };

    if ((authToken as string)?.length > 0) {
      loginParam = { ...loginParam, authToken: authToken };
    }

    const response = await Client.login(loginParam, sessionHandler);
    if (!response) return;

    if (fcmToken) {
      try {
        // await Client.registerPushNotification(fcmToken);
        // below is work around solution
        fetch(`${apiEndpoint}/v1/notification`, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId: generateUUID(),
            platform: Platform.OS,
            userId: userId,
            token: fcmToken,
          }),
        }).catch((err) => console.error(err));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const login = async () => {
    setError('');
    setIsConnecting(true);
    try {
      await handleConnect();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';
      setError(errorText);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };
  useEffect(() => {
    login();
  }, [userId]);

  const logout = async () => {
    try {
      Client.stopUnreadSync();
      await Client.logout();
    } catch (e) {
      const errorText =
        (e as Error)?.message ?? 'Error while handling request!';

      Alert.alert(errorText);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        error,
        isConnecting,
        login,
        client,
        logout,
        isConnected,
        sessionState,
        apiRegion: (apiRegion as string).toLowerCase(),
      }}
    >
      {children}
    </AuthContext.Provider>
    //
  );
};
export default AuthContextProvider;
