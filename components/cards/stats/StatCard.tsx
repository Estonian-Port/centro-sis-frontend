import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  number: string | number;
  label: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({ number, label, style }) => {
  return (
    <Card style={StyleSheet.flatten([styles.statCard, style])}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: 150,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
});