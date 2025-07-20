import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MultiSelect from "react-native-multiple-select";
import fields from "./CareerFields.json";

const CareerFieldMultiSelector = ({ selectedFields, setSelectedFields }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Career Fields</Text>
      <MultiSelect
        items={fields.map((field) => ({ id: field.id, name: field.name }))}
        uniqueKey="id"
        onSelectedItemsChange={setSelectedFields}
        selectedItems={selectedFields}
        selectText="Select Career Fields"
        searchInputPlaceholderText="Search Fields..."
        tagRemoveIconColor="#9FF9D5"
        tagBorderColor="#9FF9D5"
        tagTextColor="#003D5B"
        selectedItemTextColor="#9FF9D5"
        selectedItemIconColor="#9FF9D5"
        itemTextColor="#000"
        displayKey="name"
        searchInputStyle={{ color: "#003D5B" }}
        submitButtonColor="#BFB4FF"
        submitButtonText="Confirm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    color: "#003D5B",
    fontFamily: "Inter_200ExtraLight",
  },
});

export default CareerFieldMultiSelector;