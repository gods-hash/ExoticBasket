// New Code of LogIn
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import TextInputCompo from '../Components/TextInputCompo';
import Buttons from '../Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import { LoginAction, sendOtpMethod } from '../redux/actions/AuthAction';
import { useTheme, useNavigation } from '@react-navigation/native';
import commonStyles from '../styles/commonStyles';
import { scale } from '../styles/responsiveSize';

import imgPath from '../constants/imgPath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../styles/utils/toast';
import Headers from '../Components/Headers';

const GetOtp = () => {
  const [errors, setErrors] = useState({});
  const [inputs, setInputs] = useState({
    user_name: '',
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const colors = useTheme().colors;
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const actionType = e.data.action.type;
      if (actionType === 'POP' || actionType === 'GO_BACK') {
        AsyncStorage.removeItem('STORE');
      }
    });
    return unsubscribe;
  }, [navigation]);

  //   const handleSubmit = async () => {
  //     // Your form validation logic here
  //     let isValid = true;

  //     const user_name = /^[0-9]+$/; // Regular expression to match digits only
  //     if (!inputs.user_name) {
  //       handleError('Please input number', 'user_name');
  //       isValid = false;
  //     } else if (inputs.user_name.length !== 10) {
  //       handleError('Mobile number must be 10 digits long', 'user_name');
  //       isValid = false;
  //     } else if (!user_name.test(inputs.user_name)) {
  //       handleError('Mobile number should contain only digits', 'user_name');
  //       isValid = false;
  //     } else {
  //       isValid = true;
  //     }

  //     // if (isValid) {
  //     //   const resp = await dispatch(sendOtpMethod(inputs?.user_name)).unwrap();
  //     //   console.log('data---',resp);

  //     //   if (resp) {
  //     //     navigation.navigate('OtpVerification', {number: inputs.user_name});
  //     //   }
  //     // } else {

  //     // }
  //   if (isValid) {
  //   try {
  //     console.log("API CALL START");

  //     const resp = await dispatch(sendOtpMethod(inputs?.user_name));

  //     console.log('data---', resp);

  //     if (resp?.password === null) {
  //       navigation.navigate('OtpVerification', {
  //         number: inputs.user_name,
  //         otp: resp?.otp, // testing ke liye
  //       });
  //     }else{
  //        const data = JSON.stringify({
  //     user_name: inputs?.mobileNumber,
  //     password: resp?.password,
  //   });
  //    try {

  //     const res = await dispatch(LoginAction(data));

  //     console.log("LOGIN RESPONSE 👉", res);

  //     if (res?.status === true) {

  //       // ✅ CHECK OTP VERIFIED
  //       const isVerified = await AsyncStorage.getItem('isVerified');

  //       if (isVerified === 'true') {

  //         showToast("Login Successful ✅");

  //         navigation.reset({
  //           index: 0,
  //           routes: [{ name: 'MainTabs' }],
  //         });

  //       }
  //     } else {
  //       showToast(res?.message || "Wrong password ❌");
  //     }

  //   } catch (error) {
  //     console.log("LOGIN ERROR 👉", error);
  //     showToast("Invalid Password Or ID❌");
  //   } finally {
  //     setLoading(false);
  //   }

  //     }

  //   } catch (error) {
  //     console.log("ERROR 🔴", error);
  //   }
  // }
  //   };
  // const handleSubmit = async () => {
  //   let isValid = true;

  //   const user_name_regex = /^[0-9]+$/;

  //   if (!inputs.user_name) {
  //     handleError('Please input number', 'user_name');
  //     isValid = false;
  //   } else if (inputs.user_name.length !== 10) {
  //     handleError('Mobile number must be 10 digits long', 'user_name');
  //     isValid = false;
  //   } else if (!user_name_regex.test(inputs.user_name)) {
  //     handleError('Mobile number should contain only digits', 'user_name');
  //     isValid = false;
  //   }

  //   if (!isValid) return;

  //   try {
  //     setLoading(true);
  //     console.log('API CALL START');

  //     const resp = await dispatch(sendOtpMethod(inputs?.user_name)).unwrap();
  //     console.log('OTP RESPONSE 👉', resp);

  //     // 🟢 CASE 1: New user → OTP flow
  //     if (resp?.password === null) {
  //       navigation.navigate('OtpVerification', {
  //         number: inputs.user_name,
  //         otp: resp?.otp,
  //       });
  //       return;
  //     }

  //     // 🟢 CASE 2: Existing user → Direct login
  //     const data = JSON.stringify({
  //       user_name: resp?.mobileNumber,
  //       password: resp?.password,
  //     });

  //     const res = await dispatch(LoginAction(data)).unwrap();
  //     console.log('LOGIN RESPONSE 👉', res);

  //     if (res?.status === true) {
  //       const isVerified = await AsyncStorage.getItem('isVerified');

  //       if (isVerified === 'true') {
  //         showToast('Login Successful ✅');

  //         navigation.reset({
  //           index: 0,
  //           routes: [{ name: 'MainTabs' }],
  //         });
  //       }
  //     } else {
  //       showToast(res?.message || 'Wrong password ❌');
  //     }
  //   } catch (error) {
  //     console.log('ERROR 🔴', error);
  //     showToast('Something went wrong ❌');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    // Keyboard.dismiss();

    let isValid = true;
    const user_name = /^[0-9]+$/;

    if (!inputs.user_name) {
      handleError('Please input number', 'user_name');
      isValid = false;
    } else if (inputs.user_name.length !== 10) {
      handleError('Mobile number must be 10 digits long', 'user_name');
      isValid = false;
    } else if (!user_name.test(inputs.user_name)) {
      handleError('Mobile number should contain only digits', 'user_name');
      isValid = false;
    }

    if (!isValid) return;

    const resp = await dispatch(sendOtpMethod(inputs.user_name));

    console.log("OTP RESPONSE 👉", resp);

    if (resp?.status === true) {

      // 🔥 CONDITION HERE
      if (resp?.message === "Already Registered") {

        // ✅ DIRECT LOGIN (NO OTP SCREEN)
        const loginData = JSON.stringify({
          user_name: inputs.user_name,
          password: resp?.password
        });

        console.log("login data ----", loginData);


        const loginRes = await dispatch(LoginAction(loginData));

        console.log("loginresp---", loginRes);


        if (loginRes?.status === true) {

          await AsyncStorage.setItem(
            'userToken',
            loginRes?.data?.jwt_response
          );

          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });

        } else {
          Alert.alert(loginRes?.message || "Login Failed ❌");
        }

      } else {

        // 🟡 NEW USER → GO TO OTP SCREEN
        navigation.navigate('OtpVerification', {
          number: inputs.user_name,
          otp: resp?.otp,
        });

      }

    } else {
      Alert.alert(resp?.message || "Something went wrong");
    }
  };
  const handleOnchange = (text, input) => {
    setInputs(prevState => ({ ...prevState, [input]: text }));
  };

  const handleError = (error, input) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  return (
    <>
      <Headers title="Login" showBack />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formContainer, {}]}>
          <Image
            style={{
              height: 150,
              width: 150,
              alignSelf: 'center',
              marginBottom: 20,
            }}
            source={imgPath.applogo}
            resizeMode="center"
          />
          <Text
            style={[
              commonStyles.fontBold24,
              {
                color: colors.text,
                fontWeight: 'bold',
                marginBottom: scale(10),
                alignSelf: 'center',
              },
            ]}
          >
            Login with Mobile Number
          </Text>
          <TextInputCompo
            onChangeText={text => handleOnchange(text, 'user_name')}
            onFocus={() => handleError(null, 'user_name')}
            iconName="phone"
            placeholder="Enter Phone Number"
            error={errors.user_name}
            maxLength={10}
            keyboardType={'number-pad'}
            autoFocus={true}
          />
          <Buttons
            onPress={handleSubmit}
            titel={loading ? '' : 'Get Started'}
            disabled={loading}
            style={{}}
          >
            {loading && <ActivityIndicator size="small" color="#fff" />}
          </Buttons>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              alignSelf: 'center',
              marginTop: 10,
              padding: 10,
            }}
          >
            <Text
              style={{
                color: '#007BFF',
                fontWeight: 'bold',
                fontSize: 16,
                textDecorationLine: 'underline',
              }}
            >
              Change Store
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  formContainer: {
    justifyContent: 'center',
    gap: 20,
  },
  signupTextContainer: {
    flexDirection: 'row',
  },
  signupText: {
    color: 'gray',
  },
});

export default GetOtp;
