import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Menu, MenuItem, MenuDivider} from 'react-native-material-menu';
import {moderateScale} from './Matrics';
import {getDataInDB} from '../styles/utils/commonFunctions';

export default function Units({title = 'Select Weight', onSelect}) {
  const [visible, setVisible] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [weightOptions, setWeightOptions] = useState([]);

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);

  const handleSelect = weight => {
    setSelectedWeight(weight);
    hideMenu();
    if (onSelect) {
      onSelect(weight);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const retrievedArray = await getDataInDB('UOM');
      setWeightOptions(retrievedArray || [50, 100, 250, 500, 750]);
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Specify only the required weight options
  // const weightOptions = [50, 100, 250, 500, 750];

  return (
    <View
      style={{
        backgroundColor: '#fff',
      }}>
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity onPress={showMenu}>
          <Text
  style={{
    fontSize: 12,
    color: "#34A853",
    fontWeight: "700",
    backgroundColor: "#E6F4EA",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  }}
>
  {selectedWeight ? `${selectedWeight} g` : "Wgt ⌄"}
</Text>

          </TouchableOpacity>
        }
        onRequestClose={hideMenu}>
        {weightOptions?.map((weight, index) => (
          <MenuItem key={index} onPress={() => handleSelect(weight)}>
            {weight} gms
          </MenuItem>
        ))}
        <MenuDivider />
      </Menu>
    </View>
  );
}