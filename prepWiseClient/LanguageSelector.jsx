
import React, { useState,useEffect  } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import languages from './languages.json';
import { useFonts } from 'expo-font';
import { Inter_400Regular,
  Inter_300Light, Inter_700Bold,Inter_100Thin,
  Inter_200ExtraLight } from '@expo-google-fonts/inter';


const LanguageSelector = ({ selectedLanguages, setSelectedLanguages,style }) => {

  const [selectedItems, setSelectedItems] = useState([]);
  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    handleSelectedLanguages(selectedItems)
  };
//send the name of the language and not the code to the signup page
const handleSelectedLanguages = (selectedItems) => {
    const selectedLanguageObjects = selectedItems
      .map(code => languages.find(lang => lang.code === code))
      .filter(lang => lang !== undefined);
    setSelectedLanguages(selectedLanguageObjects.map(lang => lang.name)); // Store names instead of objects
  };
  useEffect(() => {
    if (selectedLanguages && selectedLanguages.length > 0) {
      const codes = selectedLanguages
        .map(name => {
          const lang = languages.find(lang => lang.name === name);
          return lang ? lang.code : null;
        })
        .filter(code => code !== null);
  
      setSelectedItems(codes);
    }
  }, [selectedLanguages]);

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
         items={languages}
         uniqueKey="code"
         onSelectedItemsChange={onSelectedItemsChange}
         selectedItems={selectedItems}
         selectText="Pick Languages"
         searchInputPlaceholderText="Search Languages..."
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



export default LanguageSelector;