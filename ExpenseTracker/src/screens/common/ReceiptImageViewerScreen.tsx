/**
 * ReceiptImageViewerScreen
 * Full-screen modal for viewing receipt images
 * Wraps the ReceiptImageViewer component with navigation controls
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { ReceiptImageViewer } from '../../components/verification/ReceiptImageViewer';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, shadows } from '../../styles';

type RootStackParamList = {
  ReceiptImageViewer: { imagePath: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ReceiptImageViewer'>;

export const ReceiptImageViewerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imagePath } = route.params;
  const { colors: themeColors } = useTheme();

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Image Viewer */}
      <ReceiptImageViewer imageUri={`file://${imagePath}`} />

      {/* Close Button */}
      <SafeAreaView style={styles.closeButtonContainer}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
          onPress={handleClose}
          activeOpacity={0.8}>
          <Icon name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.lg,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
});
