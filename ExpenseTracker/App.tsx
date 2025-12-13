/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/services/database/databaseInit';
import { testDatabaseInitialization } from './src/services/database/testDatabase';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database on app startup
    const setupDatabase = async () => {
      try {
        console.log('Starting database initialization...');
        await initializeDatabase();
        console.log('Database initialized successfully');

        // Run database tests
        console.log('\nRunning database tests...');
        const testsPassed = await testDatabaseInitialization();

        if (testsPassed) {
          console.log('All database tests passed!');
          setDbInitialized(true);
        } else {
          throw new Error('Database tests failed');
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    setupDatabase();
  }, []);

  // Show loading screen while database initializes
  if (!dbInitialized && !dbError) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Initializing database...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show error screen if database initialization failed
  if (dbError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Database Error:</Text>
          <Text style={styles.errorMessage}>{dbError}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen templateFileName="App.tsx" safeAreaInsets={safeAreaInsets} />
    </View>
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
