import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import fields from './CareerFields.json';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight
} from '@expo-google-fonts/inter';

const CareerFieldSelector = ({ selectedField, setSelectedField, style }) => {
  const [value, setValue] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light
  });

  useEffect(() => {
    if (selectedField) {
      const field = fields.find(f => f.name === selectedField.name || f.id === selectedField.id);
      if (field) {
        setValue(field.id);
      }
    }
  }, [selectedField]);

  const handleSelect = (item) => {
    setValue(item.id);
    setSelectedField(item); // Pass the full field object or adapt to your needs
  };

  return (
    <View style={[styles.container, style]}>
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        data={fields}
        labelField="name"
        valueField="id"
        placeholder="Select Career Field"
        value={value}
        onChange={handleSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Inter_200ExtraLight',
  },
  selectedTextStyle: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Inter_200ExtraLight',
  },
  itemTextStyle: {
    fontFamily: 'Inter_200ExtraLight',
    fontSize: 13,
    color: '#888',
  },
});

export default CareerFieldSelector;
