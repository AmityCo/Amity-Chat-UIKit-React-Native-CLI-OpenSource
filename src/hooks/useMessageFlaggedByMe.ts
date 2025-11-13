import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { MessageRepository } from '@amityco/ts-sdk-react-native';

export const useMessageFlaggedByMe = ({
  messageId,
  onCloseMenu,
}: {
  messageId: string;
  onCloseMenu?: () => void;
}): {
  isLoading: boolean;
  isFlaggedByMe: boolean;
  isMessageDeleted: boolean;
  isFlagLoading: boolean;
  mutateReportMessage: () => Promise<void>;
  mutateUnreportMessage: () => Promise<void>;
} => {
  const [isFlaggedByMe, setIsFlaggedByMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMessageDeleted, setIsMessageDeleted] = useState(false);
  const [isFlagLoading, setIsFlagLoading] = useState(false);

  const checkFlagStatus = useCallback(async () => {
    if (!messageId) return;
    setIsLoading(true);
    try {
      const flagged = await MessageRepository.isMessageFlaggedByMe(messageId);
      setIsFlaggedByMe(flagged);
    } catch (error) {
      console.error('Error checking message flag status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    checkFlagStatus();
  }, [checkFlagStatus]);

  const mutateReportMessage = useCallback(async () => {
    if (messageId == null) return;
    setIsFlagLoading(true);
    setIsFlaggedByMe(true);

    try {
      await MessageRepository.flagMessage(messageId);
      Alert.alert('Report sent ✅');
      onCloseMenu?.();
    } catch (error) {
      setIsFlaggedByMe(false);

      if ((error as Error).message?.includes('400400')) {
        setIsMessageDeleted(true);
      } else {
        Alert.alert('Failed to report message.', 'Please try again.', [
          {
            text: 'OK',
            onPress: () => {
              onCloseMenu?.();
            },
          },
        ]);
      }
    } finally {
      setIsFlagLoading(false);
      checkFlagStatus();
    }
  }, [messageId, onCloseMenu, checkFlagStatus]);

  const mutateUnreportMessage = useCallback(async () => {
    if (messageId == null) return;
    setIsFlagLoading(true);
    setIsFlaggedByMe(false);

    try {
      await MessageRepository.unflagMessage(messageId);
      Alert.alert('Unreport sent ✅');
      onCloseMenu?.();
    } catch (error) {
      setIsFlaggedByMe(true);
      Alert.alert('Failed to unreport message.', 'Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            onCloseMenu?.();
          },
        },
      ]);
      onCloseMenu?.();
    } finally {
      setIsFlagLoading(false);
      checkFlagStatus();
    }
  }, [messageId, onCloseMenu, checkFlagStatus]);

  return {
    isLoading,
    isFlaggedByMe,
    isMessageDeleted,
    isFlagLoading,
    mutateReportMessage,
    mutateUnreportMessage,
  };
};
