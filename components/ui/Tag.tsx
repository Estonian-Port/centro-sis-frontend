import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface TagProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export const Tag: React.FC<TagProps> = ({ 
  label, 
  variant = 'default', 
  style 
}) => {
  return (
    <View style={[styles.tag, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  default: {
    backgroundColor: '#f3f4f6',
  },
  defaultText: {
    color: '#374151',
  },
  success: {
    backgroundColor: '#d1fae5',
  },
  successText: {
    color: '#065f46',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  warningText: {
    color: '#92400e',
  },
  error: {
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#991b1b',
  },
  info: {
    backgroundColor: '#dbeafe',
  },
  infoText: {
    color: '#1e40af',
  },
});