import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '../../svg/svg-xml-list'; // renamed for color prop support
import { MessageRepository } from '@amityco/ts-sdk-react-native';
import { useStyles } from './styles';
import { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';

interface IModal {
  visible: boolean;
  onClose: () => void;
  onFinishEdit?: () => void;
  messageId: string;
  messageText: string;
}

const EditMessageModal = ({
  visible,
  onClose,
  messageId,
  messageText,
  onFinishEdit,
}: IModal) => {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();
  const [inputMessage, setInputMessage] = useState(messageText);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  useEffect(() => {
    setInputMessage(messageText);
  }, [messageText]);

  useEffect(() => {
    const hasChanged = inputMessage !== messageText;
    const notEmpty = inputMessage.trim().length > 0;
    setIsSaveEnabled(hasChanged && notEmpty);
  }, [inputMessage, messageText]);

  const updateMessage = async () => {
    if (!isSaveEnabled) return;

    const updatedMessage = {
      data: {
        text: inputMessage,
      },
    };

    const { data: message } = await MessageRepository.updateMessage(
      messageId,
      updatedMessage,
    );
    if (message) {
      onFinishEdit && onFinishEdit();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <SvgXml xml={closeIcon(theme.colors.base)} width="17" height="17" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Edit Message</Text>
        </View>

        <TouchableOpacity
          onPress={updateMessage}
          disabled={!isSaveEnabled}
          style={styles.headerTextContainer}
        >
          <Text
            style={[
              styles.headerText,
              { opacity: isSaveEnabled ? 1 : 0.4 }, // visually indicate disabled state
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.AllInputWrap}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
            style={styles.AllInputWrap}
          >
            <ScrollView style={styles.container}>
              <TextInput
                multiline
                placeholder="What's going on..."
                style={styles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

export default EditMessageModal;