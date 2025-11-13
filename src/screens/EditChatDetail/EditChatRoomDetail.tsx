/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import ImagePicker, {
  launchImageLibrary,
  type Asset,
  launchCamera,
} from 'react-native-image-picker';
import { useStyles } from './styles';
import DoneButton from '../../components/DoneButton';
import { updateAmityChannel } from '../../providers/channel-provider';
import { LoadingOverlay } from '../../components/LoadingOverlay';

import LoadingImage from '../../components/LoadingImage';
import type { RootStackParamList } from '../../routes/RouteParamList';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraIcon } from '../../svg/CameraIcon';
import { AvatarIcon } from '../../svg/AvatarIcon';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import BackButton from '../../components/BackButton';
import recentChatSlice from '../../redux/slices/RecentChatSlice';
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface EditChatDetailProps {
  route: any;
}

export const EditChatRoomDetail: React.FC<EditChatDetailProps> = ({}) => {
  const styles = useStyles();
  const { apiRegion } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'EditChatRoomDetail'>>();
  const MAX_CHARACTER_COUNT = 100;
  const { channelId, groupChat } = route.params;

  const theme = useTheme() as MyMD3Theme;
  const { channelList } = useSelector((state: RootState) => state.recentChat);
  const { updateByChannelId } = recentChatSlice.actions;
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Get the current channel from Redux store to ensure we have the latest data
  const currentChannelFromStore = channelList.find(
    (item) => item.chatId === channelId
  );

  // Use the chatName from Redux store if available, otherwise fall back to route params
  const initialDisplayName =
    currentChannelFromStore?.chatName || groupChat?.displayName;

  const [displayName, setDisplayName] = useState<string | undefined>(
    initialDisplayName
  );
  const [characterCount, setCharacterCount] = useState(
    initialDisplayName?.length ?? 0
  );
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  const [uploadedFileId, setUploadedFileId] = useState<string>();
  const [isImageUploading, setIsImageUploading] = useState(false);

  const onDonePressed = async () => {
    const currentChannel = channelList.find(
      (item) => item.chatId === channelId
    );

    try {
      setShowLoadingIndicator(true);
      const result = await updateAmityChannel(
        channelId,
        uploadedFileId as string,
        displayName
      );

      if (result) {
        const updatedChannel = {
          ...currentChannel,
          avatarFileId: uploadedFileId,
          chatName: displayName || currentChannel.chatName,
        };
        dispatch(
          updateByChannelId({
            channelId: channelId,
            updatedChannelData: updatedChannel,
          })
        );
        setShowLoadingIndicator(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pickCamera = async () => {
    const result: ImagePicker.ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: 1,
    });
    if (
      result.assets &&
      result.assets.length > 0 &&
      result.assets[0] !== null &&
      result.assets[0]
    ) {
      const imagesArr: string[] = [...imageMultipleUri];
      imagesArr.push(result.assets[0].uri as string);
      setImageMultipleUri(imagesArr);
    }
  };

  const pickImage = async () => {
    const result: ImagePicker.ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const selectedImages: Asset[] = result.assets;
      const imageUriArr: string[] = selectedImages.map(
        (item: Asset) => item.uri
      ) as string[];
      const imagesArr = [...imageMultipleUri];
      const totalImages = imagesArr.concat(imageUriArr);
      setImageMultipleUri(totalImages);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickCamera();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      pickImage();
    }
  };

  const handleTextChange = (text: string) => {
    setDisplayName(text);
    setCharacterCount(text.length);
  };
  const handleOnFinishImage = async (fileId: string) => {
    setUploadedFileId(fileId);
  };

  const handleOnErrorImage = (error: any, imagePath: string) => {
    setImageMultipleUri((prev) => prev.filter((uri) => uri !== imagePath));
    const title = error?.title || 'Upload Failed';
    const message =
      error?.message || 'Failed to upload image. Please try again.';

    Alert.alert(title, message, [
      {
        text: 'OK',
      },
    ]);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setIsImageUploading(isLoading);
  };

  const hasDisplayNameChanged = displayName !== initialDisplayName;
  const hasImageChanged = imageMultipleUri.length > 0;
  const hasChanges = hasDisplayNameChanged || hasImageChanged;
  const isSaveDisabled = !hasChanges || isImageUploading;

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        'Leave without finishing?',
        'Your changes that you made may not be saved.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.topBarContainer} edges={['top']}>
        <View style={styles.topBar}>
          <BackButton onPress={handleBackPress} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Edit Chat Detail</Text>
          </View>
          <DoneButton
            onDonePressed={onDonePressed}
            disabled={isSaveDisabled}
            text="Save"
          />
        </View>
      </SafeAreaView>

      <View style={styles.container}>
        <LoadingOverlay
          isLoading={showLoadingIndicator}
          loadingText="Loading..."
        />
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleAvatarPress}>
            {imageMultipleUri.length > 0 ? (
              <View>
                <LoadingImage
                  containerStyle={styles.uploadedImage}
                  isShowSending={false}
                  source={imageMultipleUri[0] as string}
                  onLoadFinish={handleOnFinishImage}
                  onError={handleOnErrorImage}
                  onLoadingChange={handleLoadingChange}
                />
              </View>
            ) : groupChat?.avatarFileId ? (
              <Image
                style={styles.avatar}
                source={{
                  uri: `https://api.${apiRegion}.amity.co/api/v3/files/${groupChat?.avatarFileId}/download`,
                }}
              />
            ) : (
              <AvatarIcon />
            )}
          </TouchableOpacity>
          <View
            style={
              imageMultipleUri[0]
                ? styles.uploadedCameraIconContainer
                : styles.cameraIconContainer
            }
          >
            <TouchableOpacity onPress={handleAvatarPress}>
              <View style={styles.cameraIcon}>
                <CameraIcon color={theme.colors.base} width={16} height={16} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.displayNameContainer}>
          <Text style={styles.displayNameText}>Group name</Text>
          <View style={styles.characterCountContainer}>
            <Text
              style={styles.characterCountText}
            >{`${characterCount}/${MAX_CHARACTER_COUNT}`}</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={handleTextChange}
          maxLength={MAX_CHARACTER_COUNT}
          placeholder="Enter your display name"
          placeholderTextColor="#a0a0a0"
        />
      </View>
    </View>
  );
};
