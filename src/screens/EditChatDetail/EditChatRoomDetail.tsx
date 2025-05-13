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
import { type RouteProp, useRoute } from '@react-navigation/native';
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

interface EditChatDetailProps {
  navigation: any;
  route: any;
}



export const EditChatRoomDetail: React.FC<EditChatDetailProps> = ({
  navigation,
}) => {

  const styles = useStyles();
  const { apiRegion } = useAuth()
  const route = useRoute<RouteProp<RootStackParamList, 'EditChatRoomDetail'>>();
  const MAX_CHARACTER_COUNT = 100;
  const { channelId, groupChat } = route.params;

  const [displayName, setDisplayName] = useState<string | undefined>(groupChat?.displayName);
  const [characterCount, setCharacterCount] = useState(groupChat?.displayName?.length ?? 0);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  const [uploadedFileId, setUploadedFileId] = useState<string>()

  const theme = useTheme() as MyMD3Theme;
  const { channelList } = useSelector((state: RootState) => state.recentChat);
  const { updateByChannelId } = recentChatSlice.actions
  const dispatch = useDispatch();
  
  const onDonePressed = async () => {

    const currentChannel = channelList.find(item => item.chatId === channelId)
    currentChannel.avatarFileId = uploadedFileId
    dispatch(updateByChannelId({channelId: channelId, updatedChannelData: currentChannel}))
    
    try {

      setShowLoadingIndicator(true);
      const result = await updateAmityChannel(
        channelId,
        uploadedFileId as string,
        displayName
      );
      if (result) {

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
      selectionLimit: 10,
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
      pickImage()

    }
  };

  const handleTextChange = (text: string) => {
    setDisplayName(text);
    setCharacterCount(text.length);
  };
  const handleOnFinishImage = async (
    fileId: string,
  ) => {
    setUploadedFileId(fileId)


  }
  return (
    <View style={{flex:1}}>
      <SafeAreaView style={styles.topBarContainer} edges={['top']}>
        <View style={styles.topBar}>
          <BackButton />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Edit Chat Detail</Text>
          </View>
          <DoneButton navigation={navigation} onDonePressed={onDonePressed} />
        </View>
      </SafeAreaView>

      <View style={styles.container}>

        <LoadingOverlay
          isLoading={showLoadingIndicator}
          loadingText="Loading..."
        />
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleAvatarPress}>
            {imageMultipleUri.length > 0 ?

              <View>
                <LoadingImage
                  containerStyle={styles.uploadedImage}
                  isShowSending={false}
                  source={imageMultipleUri[0] as string}
                  onLoadFinish={handleOnFinishImage}
                />
              </View>


              : (groupChat?.avatarFileId ? <Image
                style={styles.avatar}
                source={
                  { uri: `https://api.${apiRegion}.amity.co/api/v3/files/${groupChat?.avatarFileId}/download` }

                }
              /> : <AvatarIcon />)}


          </TouchableOpacity>
          <View style={imageMultipleUri[0] ? styles.uploadedCameraIconContainer : styles.cameraIconContainer}>
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
