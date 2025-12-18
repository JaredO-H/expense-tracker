/**
 * Export Screen
 * Allows users to export trip expenses in various formats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ExportFormat, ExportOptions } from '../../types/export';
import { Trip, Expense } from '../../types/database';
import { csvExportService } from '../../services/export/csvExportService';
import { pdfExportService } from '../../services/export/pdfExportService';
import { excelExportService } from '../../services/export/excelExportService';
import {
  shareExportFile,
  formatFileSize,
  calculateReceiptStorageSize,
  deleteReceiptImages,
} from '../../services/export/fileManager';
import databaseService from '../../services/database/databaseService';

type RootStackParamList = {
  ExportScreen: { tripId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ExportScreen'>;

export const ExportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tripId } = route.params;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(
    ExportFormat.CSV
  );
  const [includeReceipts, setIncludeReceipts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  useEffect(() => {
    updateEstimatedSize();
  }, [selectedFormat, includeReceipts, expenses]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const tripData = await databaseService.getTripById(tripId);
      if (!tripData) {
        Alert.alert('Error', 'Trip not found');
        navigation.goBack();
        return;
      }

      const expensesData = await databaseService.getAllExpenses(tripId);
      setTrip(tripData);
      setExpenses(expensesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip data');
      console.error('Error loading trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEstimatedSize = () => {
    if (expenses.length === 0) return;

    let size = 0;
    switch (selectedFormat) {
      case ExportFormat.CSV:
        size = csvExportService.getEstimatedSize(expenses, includeReceipts);
        break;
      case ExportFormat.PDF:
        size = pdfExportService.getEstimatedSize(expenses, includeReceipts);
        break;
      case ExportFormat.EXCEL:
        size = excelExportService.getEstimatedSize(expenses, includeReceipts);
        break;
    }
    setEstimatedSize(size);
  };

  const handleExport = async () => {
    if (!trip || expenses.length === 0) {
      Alert.alert('Error', 'No data to export');
      return;
    }

    try {
      setLoading(true);

      const options: ExportOptions = {
        includeReceipts,
        includeHeader: true,
      };

      let result;
      switch (selectedFormat) {
        case ExportFormat.CSV:
          result = await csvExportService.generateExport(trip, expenses, options);
          break;
        case ExportFormat.PDF:
          result = await pdfExportService.generateExport(trip, expenses, options);
          break;
        case ExportFormat.EXCEL:
          result = await excelExportService.generateExport(trip, expenses, options);
          break;
      }

      if (!result.success || !result.filePath) {
        Alert.alert('Export Failed', result.error || 'Unknown error occurred');
        return;
      }

      // Show success and offer actions
      showExportSuccess(result.filePath, result.fileSize || 0);
    } catch (error) {
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const showExportSuccess = (filePath: string, fileSize: number) => {
    console.log('Export successful, file path:', filePath);

    Alert.alert(
      'Export Successful',
      `File saved: ${formatFileSize(fileSize)}\n\nWould you like to share it?`,
      [
        {
          text: 'Share',
          onPress: async () => {
            try {
              if (!filePath) {
                Alert.alert('Error', 'File path is missing');
                return;
              }
              console.log('Attempting to share file:', filePath);
              await shareExportFile(filePath, `${trip?.name} - Export`);
              showCleanupDialog(filePath);
            } catch (error) {
              console.error('Error sharing file:', error);
              Alert.alert(
                'Share Failed',
                error instanceof Error ? error.message : 'Failed to share file'
              );
            }
          },
        },
        {
          text: 'Done',
          onPress: () => showCleanupDialog(filePath),
        },
      ]
    );
  };

  const showCleanupDialog = async (_exportFilePath: string) => {
    if (!includeReceipts) {
      navigation.goBack();
      return;
    }

    try {
      const receiptPaths = expenses
        .filter(e => e.image_path)
        .map(e => e.image_path!);

      if (receiptPaths.length === 0) {
        navigation.goBack();
        return;
      }

      const storageSize = await calculateReceiptStorageSize(receiptPaths);

      Alert.alert(
        'Delete Receipt Images?',
        `Your export is complete! Would you like to delete the receipt images to free up ${formatFileSize(storageSize)}?\n\nNote: The images are included in the export file.`,
        [
          {
            text: 'Keep Images',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const deletedCount = await deleteReceiptImages(receiptPaths);
                Alert.alert(
                  'Success',
                  `Deleted ${deletedCount} receipt image(s) and freed up ${formatFileSize(storageSize)}`
                );
                navigation.goBack();
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Failed to delete some receipt images'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error showing cleanup dialog:', error);
      navigation.goBack();
    }
  };

  if (loading && !trip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading trip data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Trip Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.tripInfo}>
            <Text style={styles.tripName}>{trip?.name}</Text>
            <Text style={styles.tripDetail}>
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatOptions}>
            <FormatOption
              format={ExportFormat.CSV}
              icon="file-delimited"
              title="CSV"
              description="Spreadsheet format for Excel, Google Sheets"
              selected={selectedFormat === ExportFormat.CSV}
              onSelect={() => setSelectedFormat(ExportFormat.CSV)}
            />
            <FormatOption
              format={ExportFormat.PDF}
              icon="file-pdf-box"
              title="PDF"
              description="Professional document with receipt images"
              selected={selectedFormat === ExportFormat.PDF}
              onSelect={() => setSelectedFormat(ExportFormat.PDF)}
            />
            <FormatOption
              format={ExportFormat.EXCEL}
              icon="file-excel"
              title="Excel"
              description="Formatted workbook with formulas"
              selected={selectedFormat === ExportFormat.EXCEL}
              onSelect={() => setSelectedFormat(ExportFormat.EXCEL)}
            />
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIncludeReceipts(!includeReceipts)}
          >
            <Icon
              name={
                includeReceipts ? 'checkbox-marked' : 'checkbox-blank-outline'
              }
              size={24}
              color={includeReceipts ? '#007AFF' : '#999'}
            />
            <Text style={styles.checkboxLabel}>Include receipt images</Text>
          </TouchableOpacity>
          <Text style={styles.note}>
            {selectedFormat === ExportFormat.CSV && includeReceipts
              ? 'Receipt filenames will be included in the CSV'
              : selectedFormat === ExportFormat.PDF && includeReceipts
              ? 'Receipts will be embedded in the PDF'
              : selectedFormat === ExportFormat.EXCEL && includeReceipts
              ? 'Receipt filenames will be included in the Excel file'
              : ''}
          </Text>
        </View>

        {/* Export Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Format:</Text>
              <Text style={styles.previewValue}>
                {selectedFormat.toUpperCase()}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Expenses:</Text>
              <Text style={styles.previewValue}>{expenses.length}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Estimated size:</Text>
              <Text style={styles.previewValue}>
                {formatFileSize(estimatedSize)}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, loading && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={loading || expenses.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="export" size={20} color="#FFF" />
              <Text style={styles.exportButtonText}>Export</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

interface FormatOptionProps {
  format: ExportFormat;
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const FormatOption: React.FC<FormatOptionProps> = ({
  icon,
  title,
  description,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[styles.formatOption, selected && styles.formatOptionSelected]}
      onPress={onSelect}
    >
      <Icon
        name={icon}
        size={32}
        color={selected ? '#007AFF' : '#666'}
        style={styles.formatIcon}
      />
      <View style={styles.formatText}>
        <Text style={[styles.formatTitle, selected && styles.formatTitleSelected]}>
          {title}
        </Text>
        <Text style={styles.formatDescription}>{description}</Text>
      </View>
      <Icon
        name={selected ? 'radiobox-marked' : 'radiobox-blank'}
        size={24}
        color={selected ? '#007AFF' : '#999'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tripInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tripDetail: {
    fontSize: 14,
    color: '#666',
  },
  formatOptions: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  formatOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  formatIcon: {
    marginRight: 12,
  },
  formatText: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  formatTitleSelected: {
    color: '#007AFF',
  },
  formatDescription: {
    fontSize: 13,
    color: '#666',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  previewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#999',
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExportScreen;
