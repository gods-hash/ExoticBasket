// ProfileScreen.js


import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Share,
  Modal,
} from 'react-native';
import React, { useState } from 'react';


import Icon from 'react-native-vector-icons/Ionicons';
import imgPath from '../constants/imgPath';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteCustomerAction } from '../redux/actions/UserAction';

import { useNavigation } from '@react-navigation/native';
import Orders from './Orders';
import Profile from './Profile';
import Address from './Address';
import Help from '../Components/Help';
import Aboutus from '../Components/Aboutus';
import store from '../redux/Store';
import PrivacyPolicy from '../Components/PrivacyPolicy';
import Return from '../Components/Return';
import { SafeAreaView } from 'react-native-safe-area-context';


// ✅ FIXED SHARE FUNCTION
export const ShareAppLink = async (appLink, storeName) => {
  try {
    // 🔥 smart check
    const finalLink = appLink?.startsWith("http")
      ? appLink
      : `https://play.google.com/store/apps/details?id=${appLink}`;

    await Share.share({
      message: `Download ${storeName} app:\n${finalLink}`,
    });
  } catch (error) {
    console.log("Share Error 👉", error);
  }
};

const Account = () => {
  const { customer_data } = useSelector(state => state?.auth?.data);

  const {
    futterLine7: appLink,
  } = useSelector(state => state?.auth?.data?.store_data) || {};

  const storeName = useSelector(state => state?.auth?.data?.store_name);

  const navigation = useNavigation();

  const dispatch = useDispatch();
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    store.dispatch({ type: "RESET" });
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const response = await dispatch(DeleteCustomerAction());
    console.log("response delete--", response);

    setLoading(false);
    if (response?.status) {
      setModalVisible(false);
      handleLogout();
    }
  };


  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Image source={imgPath.avtar} style={styles.profileImage} />

          <View style={styles.headerTextContainer}>
            <Text style={styles.name}>{customer_data?.name}</Text>

            {customer_data?.email && (
              <TouchableOpacity style={styles.emailContainer}>
                <Text style={styles.email}>
                  {customer_data?.email}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.action === 'share') {
                  ShareAppLink(appLink, storeName);
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Icon name={item.icon} size={24} color="black" />
              <Text style={styles.menuText}>{item.title}</Text>
              <Icon name="chevron-forward-outline" size={24} color="black" />
            </Pressable>
          ))}
        </View>

        {/* DELETE ACCOUNT */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#ffebee', marginBottom: 0 }]}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="trash-outline" size={24} color="red" />
          <Text style={[styles.logoutText, { color: 'red' }]}>Delete Account</Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="green" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* DELETE MODAL */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalMessage}>Are you sure you want to delete your account? This action cannot be undone.</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteAccount}
                  disabled={loading}
                >
                  <Text style={styles.deleteButtonText}>
                    {loading ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>

    </SafeAreaView>
  );
};

export default Account;


// MENU ITEMS
const menuItems = [
  { title: 'Profile', icon: 'person-outline', screen: Profile },
  { title: 'Orders', icon: 'cart-outline', screen: Orders },
  { title: 'Delivery Address', icon: 'location-outline', screen: Address },
  { title: 'Privacy Policy', icon: 'book', screen: PrivacyPolicy },
  { title: 'Return', icon: 'return-down-back', screen: Return },
  { title: 'Help', icon: 'help-circle-outline', screen: Help },
  { title: 'Share', icon: 'share', action: 'share' },
  { title: 'About', icon: 'information-circle-outline', screen: Aboutus },
];


// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerTextContainer: {
    marginLeft: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emailContainer: {
    marginTop: 5,
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuText: {
    flex: 1,
    marginLeft: 20,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginVertical: 20,
    backgroundColor: '#F2F3F2',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 4,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
