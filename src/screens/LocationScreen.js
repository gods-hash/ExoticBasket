/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Pressable,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_API_KEY } from '../apiEndpoints/Base_Url';
import {
  extractPincode,
  requestLocationPermission,
} from '../styles/utils/location';
import Buttons from '../Components/Buttons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { getStoreListMethod, LoginGuest } from '../redux/actions/AuthAction';
import { scale } from '../styles/responsiveSize';
import { showToast } from '../styles/utils/toast';
import Headers from '../Components/Headers';
import imgPath from '../constants/imgPath';
import { useNavigation } from '@react-navigation/native';
import Login from './Login';

const LocationScreen = () => {
  const [formData, setFormData] = useState({
    address: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedLocation, setSelectedLocation] = useState(false);
  const [store, setStore] = useState([]);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbString = await AsyncStorage.getItem('STORE');
        if (dbString !== null) {
          const objectDB = JSON.parse(dbString);
          navigation.replace('GetOtp');
        } else {
          console.log('No data found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    hasPermissionPosition();   // ✅ ADD THIS

    const fetchData = async () => {
      try {
        const dbString = await AsyncStorage.getItem('STORE');
        if (dbString !== null) {
          const objectDB = JSON.parse(dbString);
          navigation.navigate(GetOtp);
        } else {
          console.log('No data found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchData();
  }, []);

  const hasPermissionPosition = async () => {
    setLoading(true);

    const hasPermission = await requestLocationPermission();

    if (hasPermission) {
      getCurrentPosition();
    } else {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to fetch location.',
      );
      setLoading(false);
    }
  };

  const getCurrentPosition = async () => {
    console.log('getCurrentPosition');
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        reverseGeocode(latitude, longitude);
        console.log('latitude, longitude', latitude, longitude);
      },
      error => {
        showToast('Not Gettig location Please open app again ');
        setLoading(false);
      },
    );
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`,
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const formattedAddress = data.results[0].formatted_address;
        const pincode = extractPincode(formattedAddress);
        setFormData(prevState => ({
          ...prevState,
          ['address']: formattedAddress,
        }));
        setFormData(prevState => ({ ...prevState, ['pincode']: pincode }));
        setSelectedLocation(true);
        handleGetStore(pincode);
      } else {
        Alert.alert('Error', 'Unable to get address for the given location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reverse geocode location');
    }
  };

  const handleGetStore = async pincode => {
    try {
      const resp = await dispatch(getStoreListMethod(pincode));
      if (resp?.status == true) {
        console.log('resp', resp);
        setStore(resp?.data);
        setLoading(false);
      } else {
        showToast('No Store Available in your pincode');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', error);
      setLoading(false);
    }
  };

  const handleSelectStore = async () => {
    const data = {
      id: 290001,
      userId: 210817,
      storeId: '290001',
      saasId: '29',
      storeName: 'Exotic Basket',
      empId: 'Online',
      format: null,
      city: '',
      state: '',
      country: 'India',
      address: null,
      taxable: true,
      gstCode: null,
      tnc: null,
      hsnCode: '',
      storeType: 'MULTICHANNEL',
      pincode: '',
      exclusiveTax: 0,
      deliveryCharges: null,
      minimumOrderValue: null,
      inclusiveTax: 0,
      storeLogo: null,
      bankAccount: 'INR',
      bankIfsc: '0',
      bankBranch: '0',
      paymentQRCode: 'a2039681-feb1-46f1-a992-3d67770921c1.jpg',
      receiptFormat: 1,
      phoneNo: null,
      checkInventory: 'Y',
      key_id: null,
      key_secret: null,
      scan_bill: false,
      routeType: 'sub',
      email: null,
      pincodeWisecategory: false,
      showonlycategory: 'N',
    };
    // if (store?.length == []) {
    //   showToast('No Store Available in your pincode');
    // } else {
    // }
    AsyncStorage.setItem('STORE', JSON.stringify(data));
    dispatch(LoginGuest(data));
    console.log('handleSelectStore', data);
  };

  const RenderStoreItem = ({ item, handleSelectStore }) => {
    return (
      <Pressable style={styles.storeContainer}>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text>Address: {item.address}</Text>
      </Pressable>
    );
  };

  const ListHeader = ({ item }) => (
    <View style={styles.storeContainer}>
      <Text>Select Store</Text>
    </View>
  );

  return (
    <>
      <Headers
        title={'Welcome'}
        style={styles.title}
        showLogin={!formData.pincode ? false : true}
      />
      <ScrollView
        contentContainerStyle={[styles.container]}
        keyboardShouldPersistTaps="handled">
        <View style={{}}>
          {store?.length > 0 ? (
            <FlatList
              data={store.slice(0, 1)}
              keyExtractor={item => item.id.toString()}
              renderItem={item => (
                <RenderStoreItem
                  handleSelectStore={handleSelectStore}
                  item={item.item}
                />
              )}
              ListHeaderComponent={<ListHeader />}
            />
          ) : null}
        </View>
        <View>
          {store?.length == 0 && loading == false ? (
            <Image
              style={{
                height: scale(300),
                width: scale(300),
                alignSelf: 'center',
              }}
              source={imgPath.applogo}
            />
          ) : store?.length > 0 ? null : (
            <ActivityIndicator size="small" color="#0000ff" />
          )}
        </View>

        <View style={{}}>
          {formData && formData?.pincode?.length > 0 && (
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationText}>Your Location</Text>
              {selectedLocation ? (
                <Text style={styles.selectedLocationCoords}>
                  {formData.address}
                </Text>
              ) : (
                <Image
                  style={{ height: 50, width: 50, alignSelf: 'center' }}
                  source={{
                    uri: 'https://img.freepik.com/free-vector/hand-drawn-location-pin-with-cross_78370-1049.jpg?t=st=1729766451~exp=1729770051~hmac=7f288141fef0852669dc5cd67724b0c6ea31639c1e841e5a2671029664a5a907&w=740',
                  }}
                />
              )}
            </View>
          )}
          <Buttons
            onPress={() => {
              handleSelectStore(store[0]);
            }}
            titel={`Get Exotic Basket Store`}
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,

    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  enableText: {
    color: 'green',
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
  },
  savedLocationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  savedLocationText: {
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  selectButtonText: {
    color: '#fff',
  },
  selectedLocationContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectedLocationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedLocationCoords: {
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  storeName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  storeContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
});

export default LocationScreen;
