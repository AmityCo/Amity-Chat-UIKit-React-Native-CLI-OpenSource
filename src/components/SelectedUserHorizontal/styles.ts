import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    container: {
      paddingLeft: 10,
      paddingVertical: 12,
      flexDirection: 'row',
      gap: 10,
      backgroundColor: theme.colors.background,
    },
    avatarContainer: {
      width: 60,
      height: 100,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
    },
    avatar: {
      position: 'relative',
      width: 40,
      height: 40,
    },
    avatarImageContainer: {
      overflow: 'hidden',
      borderRadius: 40,
      width: 40,
      height: 40,
    },
    avatarImage: {
      width: 40,
      height: 40,
    },
    deleteButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 10,
      width: 20,
      height: 20,
      position: 'absolute',
      top: 0,
      right: -8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },
    userName: {
      marginVertical: 5,
      fontSize: 13,
      textAlign: 'center',
      color: theme.colors.base,
    },
  });
  return styles;
};
