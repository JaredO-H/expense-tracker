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
import { colors as staticColors } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

type RootStackParamList = {
  ExportScreen: { tripId: number };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ExportScreen'>;

export const ExportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tripId } = route.params;
  const { colors, themeVersion } = useTheme();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.EXCEL);
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
        case ExportFormat.EXCEL:
          result = await excelExportService.generateExport(trip, expenses, options);
          break;
      }

      if (!result.success || !result.filePath) {
        Alert.alert('Export Failed', result.error || 'Unknown error occurred');
        return;
      }

      if (options.includeReceipts) {
        pdfResult = await pdfExportService.generateExport(trip, expenses, options);
        if (!pdfResult.success || !pdfResult.filePath) {
          Alert.alert('PDF Export Failed', pdfResult.error || 'Unknown error occurred');
          return;
        }
      }

      // Show success and offer actions
      showExportSuccess(result.filePath, result.fileSize || 0);
    } catch (error) {
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Unknown error occurred',
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
                error instanceof Error ? error.message : 'Failed to share file',
              );
            }
          },
        },
        {
          text: 'Done',
          onPress: () => showCleanupDialog(filePath),
        },
      ],
    );
  };

  const showCleanupDialog = async (_exportFilePath: string) => {
    if (!includeReceipts) {
      navigation.goBack();
      return;
    }

    try {
      const receiptPaths = expenses.filter(e => e.image_path).map(e => e.image_path!);

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
                  `Deleted ${deletedCount} receipt image(s) and freed up ${formatFileSize(storageSize)}`,
                );
                navigation.goBack();
              } catch (error) {
                Alert.alert('Error', 'Failed to delete some receipt images');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error showing cleanup dialog:', error);
      navigation.goBack();
    }
  };

  if (loading && !trip) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading trip data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.content}>
        {/* Trip Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trip Details</Text>
          <View style={[styles.tripInfo, { backgroundColor: colors.backgroundElevated }]}>
            <Text style={[styles.tripName, { color: colors.textPrimary }]}>{trip?.name}</Text>
            <Text style={[styles.tripDetail, { color: colors.textSecondary }]}>
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Export Format</Text>
          <View style={styles.formatOptions}>
            <FormatOption
              format={ExportFormat.EXCEL}
              icon="file-excel"
              title="Excel"
              description="Formatted workbook with formulas"
              selected={selectedFormat === ExportFormat.EXCEL}
              onSelect={() => setSelectedFormat(ExportFormat.EXCEL)}
              colors={colors}
            />
            <FormatOption
              format={ExportFormat.CSV}
              icon="file-delimited"
              title="CSV"
              description="Spreadsheet format for Excel, Google Sheets"
              selected={selectedFormat === ExportFormat.CSV}
              onSelect={() => setSelectedFormat(ExportFormat.CSV)}
              colors={colors}
            />
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Options</Text>
          <TouchableOpacity
            style={[styles.checkboxRow, { backgroundColor: colors.backgroundElevated }]}
            onPress={() => setIncludeReceipts(!includeReceipts)}>
            <Icon
              name={includeReceipts ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={includeReceipts ? colors.primary : colors.textDisabled}
            />
            <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>
              Generate PDF with receipt images
            </Text>
          </TouchableOpacity>
          <Text style={[styles.note, { color: colors.textSecondary }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Export Preview</Text>
          <View style={[styles.previewCard, { backgroundColor: colors.backgroundElevated }]}>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Format:</Text>
              <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                {selectedFormat.toUpperCase()}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Expenses:</Text>
              <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                {expenses.length}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                Estimated size:
              </Text>
              <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                {formatFileSize(estimatedSize)}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: colors.primary },
            loading && styles.exportButtonDisabled,
          ]}
          onPress={handleExport}
          disabled={loading || expenses.length === 0}>
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Icon name="export" size={20} color={colors.textInverse} />
              <Text style={[styles.exportButtonText, { color: colors.textInverse }]}>Export</Text>
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
  colors: ReturnType<typeof useTheme>['colors'];
}

const FormatOption: React.FC<FormatOptionProps> = ({
  icon,
  title,
  description,
  selected,
  onSelect,
  colors,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.formatOption,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: selected ? colors.primary : colors.border,
        },
        selected && { backgroundColor: colors.primaryLight },
      ]}
      onPress={onSelect}>
      <Icon
        name={icon}
        size={32}
        color={selected ? colors.primary : colors.textSecondary}
        style={styles.formatIcon}
      />
      <View style={styles.formatText}>
        <Text
          style={[styles.formatTitle, { color: selected ? colors.primary : colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.formatDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Icon
        name={selected ? 'radiobox-marked' : 'radiobox-blank'}
        size={24}
        color={selected ? colors.primary : colors.textDisabled}
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
