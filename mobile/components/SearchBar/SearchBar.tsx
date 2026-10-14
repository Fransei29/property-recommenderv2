import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { styles } from './SearchBar.module';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar propiedades...',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        setIsSearching(true);
        onChange(inputValue);
        setTimeout(() => setIsSearching(false), 300);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {isSearching ? (
          <ActivityIndicator size="small" color="#666" style={styles.icon} />
        ) : (
          <View style={styles.icon}>
            <Text style={styles.iconText}>🔍</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


