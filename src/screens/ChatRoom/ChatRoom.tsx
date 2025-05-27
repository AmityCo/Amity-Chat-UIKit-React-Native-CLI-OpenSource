/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Image,
  LogBox,
  TouchableOpacity,
  TextInput,
  Platform,
  Text,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import CustomText from '../../components/CustomText';
import { useStyles } from './styles';
import {
  CommonActions,
  type RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RootStackParamList } from '../../routes/RouteParamList';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../../components/BackButton';
import moment from 'moment';
import {
  ChannelRepository,
  MessageContentType,
  MessageRepository,
  SubChannelRepository,
} from '@amityco/ts-sdk-react-native';
import useAuth from '../../hooks/useAuth';

import ImagePicker, {
  launchImageLibrary,
  type Asset,
  launchCamera,
} from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingImage from '../../components/LoadingImage';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { SvgXml } from 'react-native-svg';
import { deletedIcon } from '../../svg/svg-xml-list';
import EditMessageModal from '../../components/EditMessageModal';
import { GroupChatIcon } from '../../svg/GroupChatIcon';
import { AvatarIcon } from '../../svg/AvatarIcon';
import { CameraBoldIcon } from '../../svg/CameraBoldIcon';
import { MenuIcon } from '../../svg/MenuIcon';
import { PlusIcon } from '../../svg/PlusIcon';
import { SendChatIcon } from '../../svg/SendChatIcon';
import { AlbumIcon } from '../../svg/AlbumIcon';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { getAmityUser } from '../../providers/user-provider';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { IGroupChatObject } from '~/components/ChatList';
import { UserInterface } from '~/types/user.interface';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

interface IMessage {
  _id: string;
  text?: string;
  createdAt: string;
  editedAt: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  image?: string;
  messageType: string;
  isPending?: boolean;
  isDeleted: boolean;
}
export interface IDisplayImage {
  url: string;
  fileId: string | undefined;
  fileName: string;
  isUploaded: boolean;
  thumbNail?: string;
}
const ChatRoom = ({ defaultChannelId = '' }) => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChatRoom'>>();
  const { channelList } = useSelector((state: RootState) => state.recentChat);
  const { connectionState } = useSelector(
    (state: RootState) => state.connectionState
  );
  const styles = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  let {
    chatReceiver: chatReceiverParam,
    groupChat: groupChatParam,
    channelId: channelIdParam,
  } = route.params ?? {};
  const { client, apiRegion } = useAuth();
  const [chatReceiver, setChatReceiver] = useState(chatReceiverParam);
  const [groupChat, setGroupChat] = useState(groupChatParam);
  const [channelId, setChannelId] = useState<string>(channelIdParam);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messagesData, setMessagesData] =
    useState<Amity.LiveCollection<Amity.Message>>();
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  const [displayImages, setDisplayImages] = useState<IDisplayImage[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [oneOnOneChatObject, setOneOnOneChatObject] =
    useState<Amity.Membership<'channel'>[]>();
  const [groupChatObject, setGroupChatObject] =
    useState<Amity.Membership<'channel'>[]>();
  const [channelObject, setChannelObject] = useState<Amity.Channel>();
  const theme = useTheme() as MyMD3Theme;

  const queryChannelObject = () => {
    ChannelRepository.getChannel(defaultChannelId, ({ data: channel }) => {
      if (channel) {
        setChannelObject(channel);
      }
    });
  };

  useEffect(() => {
    if (channelObject && !oneOnOneChatObject && !groupChatObject) {
      ChannelRepository.Membership.getMembers(
        { channelId: channelObject.channelId },
        ({ data: members }) => {
          if (
            channelObject.memberCount === 2 &&
            channelObject.type === 'conversation'
          ) {
            setOneOnOneChatObject((prev) => prev !== members && members);
          } else if (members) {
            setGroupChatObject((prev) => prev !== members && members);
          }
        }
      );
    }
  }, [channelObject]);

  useEffect(() => {
    if (groupChatObject) {
      const userArr: UserInterface[] = groupChatObject?.map((item) => {
        return {
          userId: item.userId as string,
          displayName: item.user?.displayName as string,
          avatarFileId: item.user?.avatarFileId as string,
        };
      });
      const groupChat: IGroupChatObject = {
        users: userArr,
        displayName: channelObject.displayName as string,
        avatarFileId: channelObject.avatarFileId,
        memberCount: channelObject.memberCount,
      };
      setGroupChat(groupChat);
      setGroupChatInfo({
        displayName: channelObject?.displayName,
        avatarFileId: channelObject?.avatarFileId,
        memberCount: channelObject?.memberCount,
      });
    }
    if (oneOnOneChatObject) {
      const targetIndex: number = oneOnOneChatObject?.findIndex(
        (item) => item.userId !== (client as Amity.Client).userId
      );
      const chatReceiver: UserInterface = {
        userId: oneOnOneChatObject[targetIndex]?.userId as string,
        displayName: oneOnOneChatObject[targetIndex]?.user
          ?.displayName as string,
        avatarFileId: oneOnOneChatObject[targetIndex]?.user?.avatarFileId ?? '',
      };
      setChatReceiver(chatReceiver);
    }
  }, [groupChatObject, oneOnOneChatObject]);

  const {
    data: messagesArr = [],
    onNextPage,
    hasNextPage,
  } = messagesData ?? {};

  const [groupChatInfo, setGroupChatInfo] = useState<IGroupChatObject>({
    ...groupChat,
  });

  const [inputMessage, setInputMessage] = useState('');
  const [sortedMessages, setSortedMessages] = useState<IMessage[]>([]);
  const flatListRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [visibleFullImage, setIsVisibleFullImage] = useState<boolean>(false);
  const [fullImage, setFullImage] = useState<string>('');
  const [editMessageModal, setEditMessageModal] = useState<boolean>(false);
  const [editMessageId, setEditMessageId] = useState<string>('');
  const [editMessageText, setEditMessageText] = useState<string>('');
  const [isDeletedChannel, setIsDeletedChannel] = useState<boolean>(false);

  useEffect(() => {
    const currentChannel = channelList.find(
      (item) => item.chatId === channelId
    );
    setGroupChatInfo({
      displayName: currentChannel?.chatName,
      avatarFileId: currentChannel?.avatarFileId,
      memberCount: currentChannel?.chatMemberNumber,
    });
  }, [channelList]);

  const startRead = async () => {
    await SubChannelRepository.startMessageReceiptSync(channelId);
  };
  const stopRead = async () => {
    await SubChannelRepository.stopMessageReceiptSync(channelId);
  };

  const getUserInfo = async (userId: string) => {
    const user = await getAmityUser(userId);
    return user;
  };

  useFocusEffect(
    useCallback(() => {
      let disposers: Amity.Unsubscriber[] = [];
      startRead();

      if (connectionState === 'connected') {
        if (defaultChannelId && !channelIdParam) {
          queryChannelObject();
          setChannelId(defaultChannelId);
        }
        disposers.push(
          MessageRepository.getMessages(
            { subChannelId: channelId, limit: 10, includeDeleted: true },
            ({ data: messages, loading, error, onNextPage, hasNextPage }) => {
              if (!loading && messages) {
                // filter syned message since UIKIT did not support unsync message yet
                const syncedMessages = messages.filter(
                  (message) =>
                    !message.syncState || message.syncState === 'synced'
                );

                // mark the last message as read
                if (syncedMessages.length > 0) {
                  const lastMessage = messages[0];
                  lastMessage.markRead();
                }

                setMessagesData({
                  data: syncedMessages,
                  loading,
                  error,
                  onNextPage,
                  hasNextPage,
                });
              }
            }
          )
        );
      }
      return () => {
        disposers.forEach((fn) => fn());
        stopRead();
      };
    }, [channelId, connectionState])
  );

  const chatFormatter = async () => {
    if (messagesArr.length > 0) {
      const formattedMessages = await Promise.all(
        messagesArr.map(async (item) => {
          if ((item?.data as Record<string, any>)?.fileId) {
            const { userObject } = await getUserInfo(item.creatorId);
            const fileId = (item?.data as Record<string, any>).fileId;

            return {
              _id: item.messageId,
              text: '',
              image: fileId
                ? `https://api.${apiRegion}.amity.co/api/v3/files/${fileId}/download`
                : '',
              createdAt: item.createdAt as string,
              editedAt: item.editedAt as string,
              user: {
                _id: userObject.data.userId ?? '',
                name: userObject?.data?.displayName ?? '',
                avatar: userObject?.data?.avatar?.fileUrl ?? '',
              },
              messageType: item.dataType,
              isDeleted: item.isDeleted as boolean,
            };
          } else {
            const { userObject } = await getUserInfo(item.creatorId);

            return {
              _id: item.messageId,
              text:
                ((item?.data as Record<string, string>)?.text as string) ?? '',
              createdAt: item.createdAt as string,
              editedAt: item.editedAt as string,
              user: {
                _id: userObject.data.userId ?? '',
                name: userObject?.data?.displayName ?? '',
                avatar: userObject?.data?.avatar?.fileUrl ?? '',
              },
              messageType: item.dataType,
              isDeleted: item.isDeleted as boolean,
            };
          }
        })
      );
      setMessages(formattedMessages);
    }
  };

  useEffect(() => {
    chatFormatter();
  }, [messagesArr]);

  const handleSend = async () => {
    if (inputMessage.trim() === '') {
      return;
    }
    Keyboard.dismiss();

    const textMessage = {
      subChannelId: channelId,
      dataType: MessageContentType.TEXT,
      data: {
        text: inputMessage,
      },
    };

    try {
      const { data: message } =
        await MessageRepository.createMessage(textMessage);
      if (message) {
        setInputMessage('');
        scrollToBottom();
      }
    } catch (e) {
      const errorMessage = e.message;
      let notificationMessage = "Your message wasn't sent. Please try again.";

      if (errorMessage === 'Amity SDK (400308): Text contain blocked word') {
        notificationMessage =
          "Your message wasn't sent as it contains a blocked word.";
      } else if (
        errorMessage ===
        'Amity SDK (400309): Data contain link that is not in whitelist'
      ) {
        notificationMessage =
          'Your message wasn’t sent as it contained a link that’s not allowed.';
      } else if (errorMessage === 'Amity SDK (400302): User is muted') {
        notificationMessage = 'User is muted';
      }

      Alert.alert(notificationMessage);
    }
  };

  const loadNextMessages = () => {
    if (flatListRef.current && hasNextPage && onNextPage) {
      onNextPage();
    }
  };

  useEffect(() => {
    const sortedMessagesData: IMessage[] = messages.sort((x, y) => {
      return new Date(x.createdAt) < new Date(y.createdAt) ? 1 : -1;
    });
    const reOrderArr = sortedMessagesData;
    setSortedMessages([...reOrderArr]);
  }, [messages]);

  const openFullImage = (image: string, messageType: string) => {
    if (messageType === 'image' || messageType === 'file') {
      if (!image) return; // Guard against empty image URLs
      // Use original image URL if ?size=full parameter doesn't work correctly
      const fullSizeImage = image.includes('?')
        ? `${image}&size=full`
        : `${image}?size=full`;
      setFullImage(fullSizeImage);
      setIsVisibleFullImage(true);
    }
  };

  const renderTimeDivider = (date: string) => {
    const currentDate = date;
    const formattedDate = moment(currentDate).format('MMMM DD, YYYY');
    const today = moment().startOf('day');

    let displayText = formattedDate;

    if (moment(currentDate).isSame(today, 'day')) {
      displayText = 'Today';
    }

    return (
      <View style={styles.bubbleDivider}>
        <View style={styles.textDivider}>
          <Text style={styles.dateText}>{displayText}</Text>
        </View>
      </View>
    );
  };

  const deleteMessage = async (messageId: string) => {
    const message = await MessageRepository.softDeleteMessage(messageId);
    return message;
  };

  const reportMessage = async (messageId: string) => {
    const isFlagged = await MessageRepository.flagMessage(messageId);
    if (isFlagged) {
      Alert.alert('Report sent ✅');
    }
  };

  const renderChatMessages = (message: IMessage, index: number) => {
    const isUserChat: boolean =
      message?.user?._id === (client as Amity.Client).userId;
    let isRenderDivider = false;
    const messageDate = moment(message.createdAt);

    const previousMessageDate = moment(sortedMessages[index + 1]?.createdAt);
    const isSameDay = messageDate.isSame(previousMessageDate, 'day');

    if (!isSameDay || index === sortedMessages.length - 1) {
      isRenderDivider = true;
    }

    return (
      <View>
        {isRenderDivider && renderTimeDivider(message.createdAt)}
        <View
          style={!isUserChat ? styles.leftMessageWrap : styles.rightMessageWrap}
        >
          {!isUserChat &&
            (message.user.avatar ? (
              <Image
                source={{ uri: message.user.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarImage}>
                <AvatarIcon />
              </View>
            ))}

          <View>
            {!isUserChat && (
              <Text
                style={isUserChat ? styles.chatUserText : styles.chatFriendText}
              >
                {message.user.name}
              </Text>
            )}
            {message.isDeleted ? (
              <View
                style={[
                  styles.deletedMessageContainer,
                  isUserChat
                    ? styles.userMessageDelete
                    : styles.friendMessageDelete,
                ]}
              >
                <View style={styles.deletedMessageRow}>
                  <SvgXml xml={deletedIcon} width={20} height={20} />
                  <Text style={styles.deletedMessage}>Message Deleted</Text>
                </View>
              </View>
            ) : (
              <Menu
                style={[
                  isUserChat
                    ? styles.currentUserMessage
                    : styles.friendUserMessage,
                ]}
              >
                <MenuTrigger
                  onAlternativeAction={() =>
                    message.image &&
                    openFullImage(message.image, message.messageType)
                  }
                  customStyles={{
                    triggerTouchable: { underlayColor: 'transparent' },
                  }}
                  triggerOnLongPress
                >
                  {message.messageType === 'text' ? (
                    <View
                      key={message._id}
                      style={[
                        styles.textChatBubble,
                        isUserChat ? styles.userBubble : styles.friendBubble,
                      ]}
                    >
                      <Text
                        style={
                          isUserChat
                            ? styles.chatUserText
                            : styles.chatFriendText
                        }
                      >
                        {message.text}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.imageChatBubble,
                        isUserChat
                          ? styles.userImageBubble
                          : styles.friendBubble,
                      ]}
                    >
                      <Image
                        style={styles.imageMessage}
                        source={{
                          uri: message.image + '?size=medium',
                        }}
                      />
                    </View>
                  )}
                </MenuTrigger>
                <MenuOptions
                  customStyles={{
                    optionsContainer: {
                      ...styles.optionsContainer,
                      marginTop:
                        isUserChat && message.messageType === 'text'
                          ? -75
                          : -50,
                    },
                  }}
                >
                  {isUserChat ? (
                    <MenuOption
                      onSelect={() =>
                        Alert.alert(
                          'Delete this message?',
                          `Message will be also be permanently removed from your friend's devices.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => deleteMessage(message._id),
                            },
                          ]
                        )
                      }
                    >
                      <Text style={styles.optionText}>Delete</Text>
                    </MenuOption>
                  ) : (
                    <MenuOption
                      onSelect={() => {
                        reportMessage(message._id);
                      }}
                    >
                      <Text style={styles.optionText}>Report</Text>
                    </MenuOption>
                  )}
                  {message.messageType === 'text' && isUserChat && (
                    <MenuOption
                      onSelect={() => {
                        return openEditMessageModal(
                          message._id,
                          message.text as string
                        );
                      }}
                    >
                      <Text style={styles.optionText}>Edit</Text>
                    </MenuOption>
                  )}
                </MenuOptions>
              </Menu>
            )}
            <Text
              style={[
                styles.chatTimestamp,
                {
                  alignSelf: isUserChat ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              {message.editedAt ? 'Edited ·' : ''}{' '}
              {moment(message.createdAt).format('hh:mm A')}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const handlePress = () => {
    Keyboard.dismiss();
    setIsExpanded(!isExpanded);
  };
  const scrollToBottom = () => {
    if (flatListRef && flatListRef.current) {
      (flatListRef.current as Record<string, any>).scrollToOffset({
        animated: true,
        offset: 0,
      });
    }
  };
  const handleOnFocus = () => {
    setIsExpanded(false);
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
      setImageMultipleUri((prevUris) => [
        ...prevUris,
        result.assets[0].uri as string,
      ]);
    }
  };

  const createImageMessage = async (fileId: string) => {
    if (fileId) {
      const imageMessage = {
        subChannelId: channelId,
        dataType: MessageContentType.IMAGE,
        fileId: fileId,
      };
      await MessageRepository.createMessage(imageMessage);
    }
  };

  const handleOnFinishImage = async (fileId: string, originalPath: string) => {
    // Create message with the uploaded file
    await createImageMessage(fileId);

    // Remove the processed image from both arrays
    setTimeout(() => {
      setDisplayImages((prevData) => {
        const newData: IDisplayImage[] = prevData.filter(
          (item: IDisplayImage) => item.url !== originalPath
        );
        return newData;
      });

      setImageMultipleUri((prevData) => {
        const newData = prevData.filter((url: string) => url !== originalPath);
        return newData;
      });

      // Set uploading state to false to allow processing next image
      setIsUploading(false);
    }, 0);
  };

  // Process image queue - this useEffect will manage which image to upload next
  useEffect(() => {
    const processNextImage = () => {
      // If we're uploading or there are no images in queue, do nothing
      if (isUploading || imageMultipleUri.length === 0) return;

      // Get the first image from the queue
      const nextImageUrl = imageMultipleUri[0];
      const fileName = nextImageUrl.substring(
        nextImageUrl.lastIndexOf('/') + 1
      );

      // Create an image object for the first image in the queue
      const nextImageObject: IDisplayImage = {
        url: nextImageUrl,
        fileName,
        fileId: '',
        isUploaded: false,
      };

      // Set the image for upload and mark as uploading
      setDisplayImages([nextImageObject]);
      setIsUploading(true);
    };

    processNextImage();
  }, [imageMultipleUri, isUploading]);

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

      // Add all selected images to the queue
      setImageMultipleUri((prevUris) => [...prevUris, ...imageUriArr]);
    }
  };

  const renderLoadingImages = useMemo(() => {
    return (
      <View style={styles.loadingImage}>
        <FlatList
          keyExtractor={(item, index) => item.fileName + index}
          data={displayImages}
          renderItem={({ item, index }) => (
            <LoadingImage
              source={item.url}
              index={index}
              onLoadFinish={handleOnFinishImage}
              isUploaded={item.isUploaded}
              fileId={item.fileId}
            />
          )}
          scrollEnabled={false}
          numColumns={1}
        />
      </View>
    );
  }, [displayImages, handleOnFinishImage]);

  const openEditMessageModal = (messageId: string, text: string) => {
    setEditMessageId(messageId);
    setEditMessageModal(true);
    setEditMessageText(text);
  };

  const closeEditMessageModal = () => {
    setEditMessageId('');
    setEditMessageText('');
    setEditMessageModal(false);
  };

  const goBack = () => {
    if (defaultChannelId) {
      navigation.navigate('RecentChat');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'RecentChat' }],
        })
      );
      setChannelId('');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    let unsubscribe: Amity.Unsubscriber | undefined;

    // Check if channel exists and set up listener
    if (connectionState === 'connected') {
      unsubscribe = ChannelRepository.getChannel(
        channelId,
        ({ data: channel }) => {
          if (channel && channel.isDeleted) {
            setIsDeletedChannel(true);
          }
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [channelId, connectionState]);

  useEffect(() => {
    if (isDeletedChannel) {
      navigation.navigate('RecentChat');
      Alert.alert('Channel no longer exists');
    }
  }, [channelId, isDeletedChannel]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topBarContainer} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.chatTitleWrap}>
            <BackButton onPress={goBack} />

            {chatReceiver ? (
              chatReceiver?.avatarFileId ? (
                <Image
                  style={styles.avatar}
                  source={{
                    uri: `https://api.${apiRegion}.amity.co/api/v3/files/${chatReceiver?.avatarFileId}/download`,
                  }}
                />
              ) : (
                <View style={styles.avatar}>
                  <AvatarIcon />
                </View>
              )
            ) : groupChatInfo?.avatarFileId ? (
              <Image
                style={styles.avatar}
                source={{
                  uri: `https://api.${apiRegion}.amity.co/api/v3/files/${groupChatInfo?.avatarFileId}/download`,
                }}
              />
            ) : (
              <View style={styles.icon}>
                <GroupChatIcon />
              </View>
            )}
            <View>
              <CustomText style={styles.chatName} numberOfLines={1}>
                {chatReceiver
                  ? chatReceiver?.displayName
                  : groupChatInfo?.displayName}
              </CustomText>
              {groupChatInfo && (
                <CustomText style={styles.chatMember}>
                  {groupChatInfo?.memberCount} members
                </CustomText>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChatDetail', {
                channelId: channelId,
                channelType: chatReceiver ? 'conversation' : 'community',
                chatReceiver: chatReceiver ?? undefined,
                groupChat: groupChatInfo ?? undefined,
              });
            }}
          >
            <MenuIcon color={theme.colors.base} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={styles.chatContainer}>
        <FlatList
          data={sortedMessages}
          renderItem={({ item, index }) => renderChatMessages(item, index)}
          keyExtractor={(item) => item._id}
          onEndReached={loadNextMessages}
          onEndReachedThreshold={0.5}
          inverted
          ref={flatListRef}
          ListHeaderComponent={renderLoadingImages}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.AllInputWrap}
      >
        <View style={styles.InputWrap}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={(text) => setInputMessage(text)}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.baseShade3}
            onFocus={handleOnFocus}
          />

          {inputMessage.trim().length > 0 ? (
            <TouchableOpacity onPress={handleSend} style={styles.sendIcon}>
              <SendChatIcon color={theme.colors.primary} />
            </TouchableOpacity>
          ) : (
            <View>
              <TouchableOpacity onPress={handlePress} style={styles.sendIcon}>
                <PlusIcon color={theme.colors.base} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {isExpanded && (
          <View style={styles.expandedArea}>
            <TouchableOpacity
              onPress={pickCamera}
              style={{ marginHorizontal: 30 }}
            >
              <View style={styles.IconCircle}>
                <CameraBoldIcon color={theme.colors.base} />
              </View>
              <CustomText style={styles.iconText}>Camera</CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              // disabled={loadingImages.length > 0}
              onPress={pickImage}
              style={{ marginHorizontal: 20, alignItems: 'center' }}
            >
              <View style={styles.IconCircle}>
                <AlbumIcon color={theme.colors.base} />
              </View>
              <CustomText style={styles.iconText}>Album</CustomText>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
      <ImageView
        images={[{ uri: fullImage }]}
        imageIndex={0}
        visible={visibleFullImage}
        onRequestClose={() => setIsVisibleFullImage(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
      <EditMessageModal
        visible={editMessageModal}
        onClose={closeEditMessageModal}
        messageText={editMessageText}
        onFinishEdit={closeEditMessageModal}
        messageId={editMessageId}
      />
    </View>
  );
};
export default ChatRoom;
