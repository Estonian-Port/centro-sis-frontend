import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  titleStyle?: TextStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  title,
  titleStyle,
}) => {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    elevation: 3, // Para Android
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
});
