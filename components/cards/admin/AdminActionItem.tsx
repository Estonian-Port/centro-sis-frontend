import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminActionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export const AdminActionItem: React.FC<AdminActionItemProps> = ({
  icon,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <Ionicons name={icon as any} size={20} color="#3b82f6" />
      <Text style={styles.actionText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
});
