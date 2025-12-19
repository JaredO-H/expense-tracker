/**
 * Expense Tracker App
 * Main application entry point
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/services/database/databaseInit';
import { testDatabaseInitialization } from './src/services/database/testDatabase';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSettingsStore } from './src/stores/settingsStore';
import { processingQueue } from './src/services/queue/processingQueue';
import { ThemeProvider } from './src/contexts/ThemeContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const { initializeSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize database and settings on app startup
    const setupApp = async () => {
      try {
        console.log('Starting database initialization...');
        await initializeDatabase();
        console.log('Database initialized successfully');

        // Run database tests
        console.log('\nRunning database tests...');
        const testsPassed = await testDatabaseInitialization();

        if (testsPassed) {
          console.log('All database tests passed!');
        } else {
          throw new Error('Database tests failed');
        }

        // Initialize settings store
        console.log('Initializing settings...');
        await initializeSettings();
        console.log('Settings initialized successfully');

        // Initialize processing queue
        console.log('Initializing processing queue...');
        await processingQueue.initialize();
        console.log('Processing queue initialized successfully');

        setDbInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    setupApp();
  }, [initializeSettings]);

  // Show loading screen while app initializes
  if (!dbInitialized && !dbError) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Initializing app...</Text>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  // Show error screen if app initialization failed
  if (dbError) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Initialization Error:</Text>
            <Text style={styles.errorMessage}>{dbError}</Text>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App;
