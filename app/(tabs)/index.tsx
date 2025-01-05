import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  ScrollView,
} from 'react-native';

import NativeLocalStorage from '@/specs/NativeLocalStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import performance, { PerformanceObserver } from 'react-native-performance';

const STORAGE_KEY = 'storedWords';
const TEST_ITERATIONS = 100;

const Home = () => {
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Set up performance observer
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log(`Performance Entry: ${entry.name}, Duration: ${entry.duration}ms`);
      });
    });
    observer.observe({ entryTypes: ['measure'] });

    loadWords();
    return () => observer.disconnect();
  }, []);

  const loadWords = () => {
    const storedWords = NativeLocalStorage?.getStringArray(STORAGE_KEY);
    setWords(storedWords || []);
  };

  const saveWord = () => {
    if (newWord.trim()) {
      NativeLocalStorage?.appendToStringArray(newWord.trim(), STORAGE_KEY);
      setNewWord('');
      loadWords();
    }
  };

  const clearAll = () => {
    NativeLocalStorage?.clear();
    setWords([]);
  };

  const runPerformanceTest = async () => {
    setTestResults([]);
    const testData = Array.from({ length: TEST_ITERATIONS }, (_, i) => `test-${i}`);
    const results: string[] = [];
    
    // Test NativeLocalStorage Write (One by One)
    performance.mark('nativeWriteOneByOneStart');
    for (let word of testData) {
      NativeLocalStorage?.appendToStringArray(word, 'performanceTestOneByOne');
    }
    performance.mark('nativeWriteOneByOneEnd');
    performance.measure('NativeLocalStorage Write (One by One)', 'nativeWriteOneByOneStart', 'nativeWriteOneByOneEnd');
    
    // Test NativeLocalStorage Write (Bulk)
    performance.mark('nativeWriteBulkStart');
    NativeLocalStorage?.setStringArrayBulk(testData, 'performanceTestBulk');
    performance.mark('nativeWriteBulkEnd');
    performance.measure('NativeLocalStorage Write (Bulk)', 'nativeWriteBulkStart', 'nativeWriteBulkEnd');
    
    // Test AsyncStorage Write (Bulk)
    performance.mark('asyncWriteBulkStart');
    await AsyncStorage.setItem('asyncStorageTest', JSON.stringify(testData));
    performance.mark('asyncWriteBulkEnd');
    performance.measure('AsyncStorage Write (Bulk)', 'asyncWriteBulkStart', 'asyncWriteBulkEnd');

    // Test AsyncStorage Write (One by One)
    performance.mark('asyncWriteOneByOneStart');
    for (let word of testData) {
      const existing = await AsyncStorage.getItem('asyncStorageTestOneByOne');
      const existingArray = existing ? JSON.parse(existing) : [];
      existingArray.push(word);
      await AsyncStorage.setItem('asyncStorageTestOneByOne', JSON.stringify(existingArray));
    }
    performance.mark('asyncWriteOneByOneEnd');
    performance.measure('AsyncStorage Write (One by One)', 'asyncWriteOneByOneStart', 'asyncWriteOneByOneEnd');

    // Test NativeLocalStorage Read (Array from One by One)
    performance.mark('nativeReadOneByOneStart');
    const nativeResultOneByOne = NativeLocalStorage?.getStringArray('performanceTestOneByOne');
    performance.mark('nativeReadOneByOneEnd');
    performance.measure('NativeLocalStorage Read (One by One Array)', 'nativeReadOneByOneStart', 'nativeReadOneByOneEnd');

    // Test NativeLocalStorage Read (Array from Bulk)
    performance.mark('nativeReadBulkStart');
    const nativeResultBulk = NativeLocalStorage?.getStringArray('performanceTestBulk');
    performance.mark('nativeReadBulkEnd');
    performance.measure('NativeLocalStorage Read (Bulk Array)', 'nativeReadBulkStart', 'nativeReadBulkEnd');

    // Test AsyncStorage Read (Array)
    performance.mark('asyncReadBulkStart');
    const asyncResultBulk = await AsyncStorage.getItem('asyncStorageTest');
    const parsedAsyncResultBulk = asyncResultBulk ? JSON.parse(asyncResultBulk) : [];
    performance.mark('asyncReadBulkEnd');
    performance.measure('AsyncStorage Read (Bulk Array)', 'asyncReadBulkStart', 'asyncReadBulkEnd');

    // Test AsyncStorage Read (One by One Array)
    performance.mark('asyncReadOneByOneStart');
    const asyncResultOneByOne = await AsyncStorage.getItem('asyncStorageTestOneByOne');
    const parsedAsyncResultOneByOne = asyncResultOneByOne ? JSON.parse(asyncResultOneByOne) : [];
    performance.mark('asyncReadOneByOneEnd');
    performance.measure('AsyncStorage Read (One by One Array)', 'asyncReadOneByOneStart', 'asyncReadOneByOneEnd');

    // Test Single Item Operations
    performance.mark('nativeSingleWriteStart');
    NativeLocalStorage?.setItem('test-single', 'test-value');
    performance.mark('nativeSingleWriteEnd');
    performance.measure('NativeLocalStorage Write (Single)', 'nativeSingleWriteStart', 'nativeSingleWriteEnd');

    performance.mark('nativeSingleReadStart');
    const nativeSingleResult = NativeLocalStorage?.getItem('test-single');
    performance.mark('nativeSingleReadEnd');
    performance.measure('NativeLocalStorage Read (Single)', 'nativeSingleReadStart', 'nativeSingleReadEnd');

    performance.mark('asyncSingleWriteStart');
    await AsyncStorage.setItem('async-test-single', 'test-value');
    performance.mark('asyncSingleWriteEnd');
    performance.measure('AsyncStorage Write (Single)', 'asyncSingleWriteStart', 'asyncSingleWriteEnd');

    performance.mark('asyncSingleReadStart');
    const asyncSingleResult = await AsyncStorage.getItem('async-test-single');
    performance.mark('asyncSingleReadEnd');
    performance.measure('AsyncStorage Read (Single)', 'asyncSingleReadStart', 'asyncSingleReadEnd');

    // Get all measurements
    const measurements = performance.getEntriesByType('measure');
    
    // Format results
    results.push(`=== Performance Test Results (${TEST_ITERATIONS} items) ===\n`);
    
    results.push('Array Write Operations:');
    measurements
      .filter(m => m.name.includes('Write') && m.name.includes('Array') || m.name.includes('Write') && (m.name.includes('Bulk') || m.name.includes('One by One')))
      .forEach(measure => {
        results.push(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
      });

    results.push('\nArray Read Operations:');
    measurements
      .filter(m => m.name.includes('Read') && (m.name.includes('Bulk') || m.name.includes('One by One')))
      .forEach(measure => {
        results.push(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
      });

    results.push('\nSingle Item Operations:');
    measurements
      .filter(m => m.name.includes('Single'))
      .forEach(measure => {
        results.push(`${measure.name}: ${measure.duration.toFixed(2)}ms`);
      });

    // Calculate comparisons
    const nativeBulkWrite = measurements.find(m => m.name === 'NativeLocalStorage Write (Bulk)')?.duration || 0;
    const asyncBulkWrite = measurements.find(m => m.name === 'AsyncStorage Write (Bulk)')?.duration || 0;
    const nativeOneByOneWrite = measurements.find(m => m.name === 'NativeLocalStorage Write (One by One)')?.duration || 0;
    const asyncOneByOneWrite = measurements.find(m => m.name === 'AsyncStorage Write (One by One)')?.duration || 0;
    
    // Read speed measurements
    const nativeBulkRead = measurements.find(m => m.name === 'NativeLocalStorage Read (Bulk Array)')?.duration || 0;
    const asyncBulkRead = measurements.find(m => m.name === 'AsyncStorage Read (Bulk Array)')?.duration || 0;
    const nativeOneByOneRead = measurements.find(m => m.name === 'NativeLocalStorage Read (One by One Array)')?.duration || 0;
    const asyncOneByOneRead = measurements.find(m => m.name === 'AsyncStorage Read (One by One Array)')?.duration || 0;
    const nativeSingleRead = measurements.find(m => m.name === 'NativeLocalStorage Read (Single)')?.duration || 0;
    const asyncSingleRead = measurements.find(m => m.name === 'AsyncStorage Read (Single)')?.duration || 0;

    const bulkWriteDiff = ((asyncBulkWrite - nativeBulkWrite) / asyncBulkWrite * 100).toFixed(1);
    const oneByOneWriteDiff = ((asyncOneByOneWrite - nativeOneByOneWrite) / asyncOneByOneWrite * 100).toFixed(1);
    const bulkReadDiff = ((asyncBulkRead - nativeBulkRead) / asyncBulkRead * 100).toFixed(1);
    const oneByOneReadDiff = ((asyncOneByOneRead - nativeOneByOneRead) / asyncOneByOneRead * 100).toFixed(1);
    const singleReadDiff = ((asyncSingleRead - nativeSingleRead) / asyncSingleRead * 100).toFixed(1);

    results.push('\nWrite Speed Comparisons:');
    results.push(`Bulk Write: NativeLocalStorage is ${bulkWriteDiff}% ${Number(bulkWriteDiff) > 0 ? 'faster' : 'slower'}`);
    results.push(`One by One Write: NativeLocalStorage is ${oneByOneWriteDiff}% ${Number(oneByOneWriteDiff) > 0 ? 'faster' : 'slower'}`);

    results.push('\nRead Speed Comparisons:');
    results.push(`Bulk Read: NativeLocalStorage is ${bulkReadDiff}% ${Number(bulkReadDiff) > 0 ? 'faster' : 'slower'}`);
    results.push(`One by One Read: NativeLocalStorage is ${oneByOneReadDiff}% ${Number(oneByOneReadDiff) > 0 ? 'faster' : 'slower'}`);
    results.push(`Single Item Read: NativeLocalStorage is ${singleReadDiff}% ${Number(singleReadDiff) > 0 ? 'faster' : 'slower'}`);

    // Array lengths verification
    results.push(`\nArray Lengths (should all be ${TEST_ITERATIONS}):`);
    results.push(`NativeLocalStorage (One by One): ${nativeResultOneByOne?.length || 0}`);
    results.push(`NativeLocalStorage (Bulk): ${nativeResultBulk?.length || 0}`);
    results.push(`AsyncStorage (One by One): ${parsedAsyncResultOneByOne.length}`);
    results.push(`AsyncStorage (Bulk): ${parsedAsyncResultBulk.length}`);

    // Clear test data
    NativeLocalStorage?.removeItem('performanceTestOneByOne');
    NativeLocalStorage?.removeItem('performanceTestBulk');
    NativeLocalStorage?.removeItem('test-single');
    await AsyncStorage.removeItem('asyncStorageTest');
    await AsyncStorage.removeItem('asyncStorageTestOneByOne');
    await AsyncStorage.removeItem('async-test-single');
    
    // Clear performance entries
    performance.clearMarks();
    performance.clearMeasures();

    setTestResults(results);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Stored Words:</Text>
        {words.map((word, index) => (
          <Text key={index} style={styles.word}>
            {index + 1}. {word}
          </Text>
        ))}
        
        <TextInput
          placeholder="Enter a new word"
          style={styles.textInput}
          value={newWord}
          onChangeText={setNewWord}
        />
        <View style={styles.buttonContainer}>
          <Button title="Add Word" onPress={saveWord} />
          <Button title="Clear All" onPress={clearAll} />
        </View>

        <View style={styles.testSection}>
          <Text style={styles.subtitle}>Performance Testing</Text>
          <Button 
            title="Run Performance Test" 
            onPress={runPerformanceTest} 
          />
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  word: {
    fontSize: 18,
    marginVertical: 4,
  },
  textInput: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  testSection: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 16,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 4,
    color: '#666',
  },
});

export default Home;