import { Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    fontStyle: {
      color: '#1054DE',
      fontWeight: '500',
      margin: 5,
      fontSize: 17,
    },

    tabStyle: {
      backgroundColor: '#FFFFF',
      minHeight: 30,
      width: 100,
      padding: 6,
    },
    indicatorStyle: {
      backgroundColor: '#1054DE',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    addChatIcon: {
      width: 24,
      height: 20,
      resizeMode: 'contain',
    },
    titleText: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.base,
    },
    tabView: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
    },
    tabViewTitle: {
      // paddingHorizontal:20,
      paddingVertical: 14,
      fontWeight: '600',
      fontSize: 17,
      color: theme.colors.primary,
      borderBottomColor: '#1054DE',
      alignSelf: 'flex-start',
    },
    indicator: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      marginHorizontal: 20,
    },
    androidWrap: {
      marginTop: 0,
    },
    iosWrap: {
      marginTop: 30,
    },
    chatContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    chatListContainer: {
      paddingBottom: Platform.OS === 'ios' ? 65 : 35,
      flex: 1,
    },
    chatListEmptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chatListEmptyText: {
      color: theme.colors.baseShade3,
      fontSize: 17,
    },
  });
  return styles;
};
