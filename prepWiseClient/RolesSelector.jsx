import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import roles from './Roles.json';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_300Light,
  Inter_700Bold,
  Inter_100Thin,
  Inter_200ExtraLight,
} from '@expo-google-fonts/inter';

const RolesSelector = ({ careerFieldId, selectedRoles, setSelectedRoles, style }) => {
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (careerFieldId) {
        const relevantRoles = roles.filter(
            role => String(role.CareerFieldID) === String(careerFieldId)
          );
          
      console.log('Filtered roles:', relevantRoles); // Debug here
      setFilteredRoles(relevantRoles);
    }
  }, [careerFieldId]);
  

  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    const selectedRoleObjects = selectedItems
    .map(id => filteredRoles.find(role => role.RoleID === id))
    .filter(role => role !== undefined);
  
  setSelectedRoles(selectedRoleObjects.map(role => role.RoleName));
  
  }  

  useEffect(() => {
    if (selectedRoles && selectedRoles.length > 0 && filteredRoles.length > 0) {
        const ids = selectedRoles
        .map(name => {
          const role = filteredRoles.find(role => role.RoleName === name);
          return role ? role.RoleID : null;
        })
        .filter(id => id !== null);
      
      setSelectedItems(ids);
    }
  }, [selectedRoles, filteredRoles]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
  });

  return (
    <View style={[styles.multiSelectWrapper, style]}>
      <MultiSelect
        hideTags={false}
        items={filteredRoles}
        uniqueKey="RoleID"
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
        selectText="Pick Roles"
        searchInputPlaceholderText="Search Roles..."
        displayKey="RoleName"
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
        searchInputStyle={{ color: '#888',fontSize:13,fontFamily:'Inter_200ExtraLight' }}
        submitButtonColor="#BFB4FF"
        submitButtonText="Submit"
        styleListContainer={styles.listContainer}
        styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
        styleSelectorContainer={styles.selectorContainer}
        styleInputGroup={styles.inputGroup}
        styleMainWrapper={styles.mainWrapper} // Custom text styling
        styleItemsContainer={styles.itemsContainer}
        styleTextDropdown={styles.dropdownText}
        styleTextDropdownSelected={styles.dropdownTextSelected}
     />
     {/* Display selected items in a row */}
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
});

export default RolesSelector;
