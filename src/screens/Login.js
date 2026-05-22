import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import TextInputCompo from '../Components/TextInputCompo';
import Buttons from '../Components/Buttons';
import {useDispatch} from 'react-redux';
import {LoginAction} from '../redux/actions/AuthAction';
import {useTheme, useNavigation} from '@react-navigation/native';
import commonStyles from '../styles/commonStyles';

import {
  moderateScale,
  moderateScaleVertical,
  scale,
} from '../styles/responsiveSize';
import GetOtp from './GetOtp';
import imgPath from '../constants/imgPath';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from '../styles/utils/toast';

const Login = () => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    user_name: '7867867867',
    password: '1234',
  });

  const dispatch = useDispatch();
  const colors = useTheme().colors;
  const navigation = useNavigation();



const handleSubmit = async () => {
  let isValid = true;

  const user_name_regex = /^[0-9]+$/;

  if (!inputs.user_name) {
    handleError("Please input number", "user_name");
    isValid = false;
  } else if (inputs.user_name.length !== 10) {
    handleError("Mobile number must be 10 digits", "user_name");
    isValid = false;
  } else if (!user_name_regex.test(inputs.user_name)) {
    handleError("Only digits allowed", "user_name");
    isValid = false;
  }

  if (!inputs.password) {
    handleError("Please input password", "password");
    isValid = false;
  } else if (inputs.password.length < 3) {
    handleError("Min 3 characters", "password");
    isValid = false;
  }

  if (!isValid) return;

  const data = JSON.stringify({
    user_name: inputs.user_name,
    password: inputs.password,
  });

  try {
    setLoading(true);

    const res = await dispatch(LoginAction(data));

    console.log("LOGIN RESPONSE 👉", res);

    if (res?.status === true) {

      // ✅ CHECK OTP VERIFIED
      const isVerified = await AsyncStorage.getItem('isVerified');

      if (isVerified === 'true') {

        showToast("Login Successful ✅");

        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });

      } else {

        // ❗ FIRST TIME USER → OTP SCREEN
        navigation.navigate('GetOtp', {
          number: inputs.user_name
        });

      }

    } else {
      showToast(res?.message || "Wrong password ❌");
    }

  } catch (error) {
    console.log("LOGIN ERROR 👉", error);
    showToast("Invalid Password Or ID❌");
  } finally {
    setLoading(false);
  }
};


  const handleOnchange = (text, input) => {
    setInputs(prevState => ({...prevState, [input]: text}));
  };

  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };

  const handleRegister = async () => {
    const db = await AsyncStorage.getItem('STORE');
    const objectDB = await JSON.parse(db);

    if (objectDB == null) {
      showToast('select store first');
      navigation.goBack();
    } else {
      navigation.navigate('GetOtp');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}>
      {/* <ImageBackground
        source={imgPath.bg}
        // resizeMode='contain'
        style={{ height: '100%', justifyContent: 'center' }}
      > */}

      <View style={[styles.formContainer, {}]}>
   <Image
  style={{
    height: 150,
    width: 150,
    alignSelf: 'center',
    marginBottom: 20,
  }}
  source={imgPath.applogo}
  resizeMode="cover"
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
          ]}>
          LogIn
        </Text>

        <TextInputCompo
          onChangeText={text => handleOnchange(text, 'user_name')}
          onFocus={() => handleError(null, 'user_name')}
          iconName="phone"
          placeholder="Enter Phone Number"
          error={errors.user_name}
          maxLength={10}
          keyboardType={'numeric'}
          autoFocus={true}
        />
        <TextInputCompo
          onChangeText={text => handleOnchange(text, 'password')}
          onFocus={() => handleError(null, 'password')}
          iconName="lock-outline"
          label="Password"
          placeholder="Enter your password"
          error={errors.password}
          password
          reset
        />
        {loading ? (
          <ActivityIndicator size={25} />
        ) : (
          <Buttons onPress={() => handleSubmit()} titel="Login" style={{}} />
        )}
        {/* <Buttons onPress={() => navigation.push('Signup', { number: '7380526718' })} titel="Sigup" style={{}} /> */}
        <View
          style={[
            styles.signupTextContainer,
            {
              marginTop: moderateScaleVertical(10),
              alignItems: 'center',
              alignSelf: 'center',
            },
          ]}>
          <Text
            style={[
              styles.signupText,
              {
                fontSize: moderateScale(16),
                marginLeft: moderateScale(5),
              },
            ]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => handleRegister()}>
            <Text
              style={[
                styles.signupText,
                {
                  color: 'blue',
                  fontWeight: 'bold',
                  fontSize: moderateScale(16),
                },
              ]}>
              {' '}
              Register
            </Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.demoview}>
          <Text style={styles.demoTitle}>Demo Account</Text>
          <Text style={styles.demoValue}>Phone Number:- 9312011558</Text>
          <Text style={styles.demoValue}>Password:- 12345678</Text>
        </View> */}
      </View>
      {/* </ImageBackground> */}
    </ScrollView>
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
    // backgroundColor:'pink'
  },
  signupTextContainer: {
    flexDirection: 'row',
  },
  signupText: {
    color: 'gray',
  },
  demoview: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  demoTitle: {
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#000',
  },
  demoValue: {
    textAlign: 'left',
  },
});

export default Login;
