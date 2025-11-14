import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  type GestureResponderEvent,
} from 'react-native';
import { useStyles } from './styles';
export default function DoneButton({
  onDonePressed,
  disabled = false,
  text = 'Done',
}: {
  onDonePressed: { (event: GestureResponderEvent): void };
  disabled?: boolean;
  text?: string;
}) {
  const styles = useStyles();
  return (
    <TouchableOpacity onPress={onDonePressed} disabled={disabled}>
      <View style={styles.icon}>
        <Text style={[styles.doneText, disabled && styles.disabledText]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
