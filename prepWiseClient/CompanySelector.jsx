import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import companies from './Company.json'; // use your actual file path here
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight
} from '@expo-google-fonts/inter';

const CompanySelector = ({ selectedCompanies, setSelectedCompanies, style }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    handleSelectedCompanies(selectedItems);
  };

  // Convert selected codes into company names
  const handleSelectedCompanies = (selectedItems) => {
    const selectedCompanyObjects = selectedItems
      .map(code => companies.find(company => company.code === code))
      .filter(company => company !== undefined);
    setSelectedCompanies(selectedCompanyObjects.map(company => company.name));
  };

  useEffect(() => {
    if (selectedCompanies && selectedCompanies.length > 0) {
      const codes = selectedCompanies
        .map(name => {
          const company = companies.find(company => company.name === name);
          return company ? company.code : null;
        })
        .filter(code => code !== null);

      setSelectedItems(codes);
    }
  }, [selectedCompanies]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light
  });

  return (
    <View style={[styles.multiSelectWrapper, style]}>
      <MultiSelect
        hideTags={false}
        items={companies}
        uniqueKey="code"
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
        selectText="Pick Companies"
        searchInputPlaceholderText="Search Companies..."
        displayKey="name"
        fontSize={13}
        tagRemoveIconColor="#BFB4FF"
        tagBorderColor="#f9f9f9"
        tagTextColor="#888"
        altFontFamily="Inter_200ExtraLight"
        fontFamily='Inter_200ExtraLight'
        itemFontFamily='Inter_200ExtraLight'
        itemFontSize={13}
        selectedItemTextColor="#888"
        selectedItemIconColor="#BFB4FF"
        itemTextColor="#888"
        searchInputStyle={{ color: '#888', fontSize: 13, fontFamily: 'Inter_200ExtraLight' }}
        submitButtonColor="#BFB4FF"
        submitButtonText="Submit"
        styleListContainer={styles.listContainer}
        styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
        styleSelectorContainer={styles.selectorContainer}
        styleInputGroup={styles.inputGroup}
        styleMainWrapper={styles.mainWrapper}
        styleItemsContainer={styles.itemsContainer}
        styleTextDropdown={styles.dropdownText}
        styleTextDropdownSelected={styles.dropdownTextSelected}
      />
      <View style={styles.selectedItemsContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  multiSelectWrapper: {
    width: '100%',
  },
  listContainer: {
    maxHeight: 150,
    backgroundColor: 'white',
  },
  dropdownMenuSubsection: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 10,
  },
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputGroup: {
    backgroundColor: '#fff',
  },
  mainWrapper: {
    backgroundColor: '#fff',
  },
  itemsContainer: {
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Inter_200ExtraLight',
  },
  dropdownTextSelected: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Inter_200ExtraLight',
  },
  selectedItemsContainer: {
    marginTop: 10,
  }
});

export default CompanySelector;
