/* eslint-disable react/no-unstable-nested-components */
import { NavigationContainer } from '@react-navigation/native';

import RecentChat from '../screens/RecentChat/RecentChat';

import * as React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SelectMembers from '../screens/SelectMembers/SelectMembers';

import type { RootStackParamList } from './RouteParamList';
import { ChatRoomSetting } from '../screens/ChatDetail/ChatRoomSetting';
import { EditChatRoomDetail } from '../screens/EditChatDetail/EditChatRoomDetail';
import MemberDetail from '../screens/MemberDetail/MemberDetail';
import ChatRoom from '../screens/ChatRoom/ChatRoom';

interface PageRendererProps {
    children: React.JSX.Element
}

export default function PageRenderer({ children }: PageRendererProps) {
    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                screenOptions={{
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: 'white',
                    },
                }}
                initialRouteName={children.type?.displayName || children.type?.name as keyof RootStackParamList}
            >
                <Stack.Screen
                    name="RecentChat"
                    component={RecentChat}

                />
                <Stack.Screen
                    name="ChatRoom"
                    options={{ headerShown: false }}
                >
                    {() => (
                        <ChatRoom {...children.props} />
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="ChatDetail"
                    component={ChatRoomSetting}
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="MemberDetail"
                    component={MemberDetail}
                    options={{
                        title: 'Member Detail',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="EditChatRoomDetail"
                    component={EditChatRoomDetail}
                    options={{
                        title: 'Edit Chat Detail',
                        headerShown: false,
                    }}
                />
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                    <Stack.Screen
                        name="SelectMembers"
                        component={SelectMembers}
                        options={({ }) => ({
                            title: '',
                            headerShown: false,
                        })}
                    />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer >
    );
}
