import { useCallback, useEffect, useState } from 'react';
import { UserRepository } from '@amityco/ts-sdk-react-native';

const useUserFlaggedByMe = (userId?: string) => {
  const [isFlaggedByMe, setIsFlaggedByMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkFlagStatus = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const flagged = await UserRepository.isUserFlaggedByMe(userId);
      setIsFlaggedByMe(flagged);
    } catch (error) {
      console.error('Error checking flag status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkFlagStatus();
  }, [checkFlagStatus]);

  const flagUser = useCallback(async () => {
    if (userId == null) return;
    setIsLoading(true);
    try {
      await UserRepository.flagUser(userId);
      setIsFlaggedByMe(true);
    } catch (error) {
      console.error('Error flagging user:', error);
      setIsFlaggedByMe(false);
    } finally {
      setIsLoading(false);
      checkFlagStatus();
    }
  }, [userId, checkFlagStatus]);

  const unflagUser = useCallback(async () => {
    if (userId == null) return;
    setIsLoading(true);
    try {
      await UserRepository.unflagUser(userId);
      setIsFlaggedByMe(false);
    } catch (error) {
      console.error('Error unflagging user:', error);
      setIsFlaggedByMe(true);
    } finally {
      setIsLoading(false);
      checkFlagStatus();
    }
  }, [userId, checkFlagStatus]);

  const toggleFlagUser = useCallback(async () => {
    if (userId == null) return;
    if (isFlaggedByMe) {
      await unflagUser();
    } else {
      await flagUser();
    }
  }, [userId, isFlaggedByMe, flagUser, unflagUser]);

  return {
    isLoading,
    isFlaggedByMe,
    flagUser,
    unflagUser,
    toggleFlagUser,
  };
};

export default useUserFlaggedByMe;
