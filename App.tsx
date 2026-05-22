import {
  Alert,
  LogBox,
  PermissionsAndroid,
  Platform,
  StatusBar,
  ToastAndroid,
  View,
} from 'react-native';
import {Provider} from 'react-redux';
import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PersistGate} from 'redux-persist/integration/react';

import SplashScreen from 'react-native-splash-screen';
import {
  notificationListeners,
  requestUserPermission,
} from './src/styles/utils/notificationServices';
import {requestLocationPermission} from './src/styles/utils/location';
import {moderateScale, textScale} from './src/styles/responsiveSize';
import store, {persistor} from './src/redux/Store';
import Routes from './src/navigation/Route';
import SpInAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import UpdatePopup from './src/Components/UpdatePopup';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
const App = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  LogBox.ignoreLogs(['Require cycle:']);
  useEffect(() => {
    SplashScreen.hide();
    checkUpdate();
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Only request POST_NOTIFICATIONS for Android 13 and above
      if (Platform.Version >= 33) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        )
          .then(() => {
            requestUserPermission();
            notificationListeners();
          })
          .catch(error => {
            console.log('Error requesting notification permissions:', error);
            requestUserPermission();
            notificationListeners();
          });
      } else {
        requestUserPermission();
        notificationListeners();
      }
    } else {
      requestUserPermission();
      notificationListeners();
    }
  }, []);

  const checkUpdate = async () => {
    const inAppUpdates = new SpInAppUpdates(false); // isDebug = false
    try {
      const result = await inAppUpdates.checkNeedsUpdate();
      console.log('checkUpdate', result);
      if (result.shouldUpdate) {
        setPopupVisible(true); // Show the update popup
      }
    } catch (e) {
      console.log('Error checking for update:', e);
    }
  };

  const handleUpdate = async () => {
    setPopupVisible(false); // Hide the popup
    const inAppUpdates = new SpInAppUpdates(false);

    let updateOptions: StartUpdateOptions = {};
    if (Platform.OS === 'android') {
      updateOptions = {
        updateType: IAUUpdateKind.IMMEDIATE,
      };
    } else if (Platform.OS === 'ios') {
      updateOptions = {
        title: 'Update available',
        message:
          'There is a new version of the app available on the App Store. Do you want to update it?',
        buttonUpgradeText: 'Update',
        buttonCancelText: 'Cancel',
      };
    }

    try {
      inAppUpdates.addStatusUpdateListener(downloadStatus => {
        console.log('Download status:', downloadStatus);
        if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
          console.log('Update downloaded, installing...');
          inAppUpdates.installUpdate();
        }
      });
      await inAppUpdates.startUpdate(updateOptions);
    } catch (e) {
      console.log('Error during update:', e);
    }
  };
  return (
     <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <View style={{flex:1, }}>
  <Routes />


  <UpdatePopup
    visible={isPopupVisible}
    handleUpdate={handleUpdate}
    onClose={() => setPopupVisible(false)}
  />

  <Toast />
</View>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
