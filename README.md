<div align="center">
<img src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-OpenSource/assets/112688936/ddeeef20-2dfa-449e-bd3d-62238d7c9be0" width="160" >
<img src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-OpenSource/assets/112688936/e6b2d2a2-5158-429e-b1af-ea679b14fc11" width="150">
<h1>Amity Chat Ui-Kit for React native (open-source)</h1>
**If you’d like to use React Native Expo, please visit this repository (https://github.com/AmityCo/Amity-Chat-UIKit-React-Native-OpenSource) **
</div>
<div align="center">
 <img width="320" alt="Screenshot_2566-07-24_at_19 16 20-removebg-preview" src="https://github.com/AmityCo/Amity-Chat-UIKit-React-Native-OpenSource/assets/112688936/f215ec74-507f-4c44-bada-df50343aee25">
 <img width="260" height="528" alt="Screenshot_2566-07-24_at_19 16 20-removebg-preview" src="https://github.com/AmityCo/Amity-Chat-UIKit-React-Native-OpenSource/assets/112688936/e42f3aff-09a5-4f3e-9529-a5bc7e45f177">
</div>


## Getting started
Our AmityChatUIKit include user interfaces to enable fast integration of standard Amity Chat features into new or existing applications. Our React Native UIKit supports integration with  **CLI**  providing you with a experience to seamlessly integrate chat features into your existing React Native CLI application.
### Try Sample app
This repository also includes a built-in sample app which you can use to test your code while customizing it, or even explore our UIKit features with just a few installations!
#### Run sample app with native iOS/Android
Use yarn

1. Install packages
```
yarn
```

2. Configure your apiKey,apiRegion,userId,displayName in /example/src/App.tsx file(https://github.com/AmityCo/Amity-Chat-UIKit-React-Native-CLI-OpenSource/blob/main/example/src/App.tsx) first before run the sample app
<img width="1499" alt="Screenshot 2566-07-24 at 20 22 44" src="https://github.com/AmityCo/Amity-Chat-UIKit-React-Native-OpenSource/assets/112688936/c25b4d47-97e7-4471-815c-3e5b538a223b">

3. Choose to run between iOS or Android

In iOS sample app, please do the pod install inside example folder first before running the sample app
```sh
cd example
npx pod-install
cd ..
npm run example ios or yarn example ios

```

In Android sample app, please sync the gradle file first before running
```
npm run example android or yarn example android
```

### Installation
Here are the steps to install ui-kit together with another React Native project.
```sh
1. git clone https://github.com/AmityCo/Amity-Chat-UIKit-React-Native-CLI-OpenSource.git
2. cd Amity-Chat-UIKit-React-Native-CLI-OpenSource
3. yarn or npm install
4. npm pack
```

This step will build the app and return amityco-react-native-cli-chat-ui-kit-x.x.x.tgz file in inside the folder

Then, inside another project, Copy tgz file to your application folder where you need to use ui-kit:

```sh
1. yarn add ./amityco-react-native-cli-chat-ui-kit-x.x.x.tgz
2. yarn add react-native-safe-area-context \react-native-screens \@react-navigation/native \@react-navigation/native-stack \@react-navigation/stack \@react-native-async-storage/async-storage \react-native-svg@14.1.0 \@react-native-community/netinfo \react-native-image-picker
```
### iOS Configuration
```sh
npx pod-install

```

### Android Configuration

Build project gradle with your Android Studio

### Usage

```js
import * as React from 'react';

import {
  AmityUiKitChat,
  AmityUiKitProvider,
} from '@amityco/react-native-cli-chat-ui-kit';

export default function App() {
  return (
    <AmityUiKitProvider
      apiKey="API_KEY"
      apiRegion="sg"
      userId="userId"
      displayName="displayName"
    >
      <AmityUiKitChat />
    </AmityUiKitProvider>
  );
}
```


## Using Specific Screens from UIKit

UIKit now supports importing and rendering individual screens. This gives you more control over how each screen is used in your app, making it easier to customize user flows and place screens exactly where you need them.

#### 📦 Supported Screens

You can now import and use the following screens individually:

- [`ChatRoom`](#)
- [`RecentChat`](#)

> ✅ Make sure your screen component is wrapped with `AmityPageRenderer` at the root level.
> 
> ✅  `AmityPageRenderer` is only required when using screen components. It is not needed for the `AmityUiKitChat` component.

### Usage

```js
import * as React from 'react';

import {
  AmityUiKitChat,
  AmityUiKitProvider,
  AmityPageRenderer,
  ChatRoom,
} from '@amityco/react-native-cli-chat-ui-kit';

export default function App() {
  return (
    <AmityUiKitProvider
      apiKey="API_KEY"
      apiRegion="sg"
      userId="userId"
      displayName="displayName"
    >
      <AmityPageRenderer >
        <ChatRoom defaultChannelId='CHANNEL_ID' />
      </AmityPageRenderer>
    </AmityUiKitProvider>
  );
}
```


### Using Theme

#### Using the default theme

AmityUIKit uses the default theme as part of the design language.

#### Theme customization

Without customization, the UIKit already looks good. However, if you wish to customize the theme, you can declare changes to color variables by passing your own color codes to our UIKit. Here is the code usage of how to customize the theme.

```js
import * as React from 'react';

import {
  AmityUiKitProvider,
  AmityUiKitChat,
} from '@amityco/react-native-cli-chat-ui-kit';

export default function App() {
 const myTheme = {
    primary: '#04a179', // Primary color for main elements
    secondary: '#636878', // Secondary color UI elements 
    background: '#1E1E1E', // Background color for components
    border: '#292B32', // Border color for elements, Date & time Divider
    base: '#FFFFFF', // Base color for main text, Title, input text
    baseShade1: '#EBECEF', // Base color for Sub Text, Sub Title, TimeStamp Text
    baseShade2: '#EBECEF', // Base color for chat timeStamp
    baseShade3: '#EBECEF', // Base color for placeHolder
    screenBackground: '#000000', // Background color for screens
    chatTopBar: '#1E1E1E', // Chat Top Bar background Color,
    chatBubbles: {
      userBubble: '#04a179',
      friendBubble: '#32343A',
    },
    chatMessageTexts: {
      userMessageText: '#FFFFFF',
      friendMessageText: '#FFFFFF'
    }
  };
  return (
    <AmityUiKitProvider
      apiKey="API_KEY"
      apiRegion="API_REGION"
      userId="userId"
      displayName="displayName"
      apiEndpoint="https://api.{API_REGION}.amity.co"
      theme={myTheme}
    >
      <AmityUiKitChat />
    </AmityUiKitProvider>
  );
}
```

#### Dark Mode

The Dark Mode feature in our UIKit enhances user experience by providing an alternative visual style that is particularly beneficial in low-light environments. It's designed to reduce eye strain, improve readability, and offer a more visually comfortable interface. You can enable dark mode by just passing variable `darkMode` to the `AmityUiKitProvider`

```js
import * as React from 'react';

import {
  AmityUiKitProvider,
  AmityUiKitChat,
} from '@amityco/react-native-cli-chat-ui-kit';

export default function App() {
  return (
    <AmityUiKitProvider
      apiKey="API_KEY"
      apiRegion="API_REGION"
      userId="userId"
      displayName="displayName"
      apiEndpoint="https://api.{API_REGION}.amity.co"
      darkMode
    >
      <AmityUiKitChat />
    </AmityUiKitProvider>
  );
}
```
```
### Documentation


Please refer to our online documentation at https://docs.amity.co or contact a Ui-Kit representative at **clientsolutiomns@amity.co** for support.



```
