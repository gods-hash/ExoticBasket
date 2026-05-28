import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler,
  Alert,
  Keyboard
} from 'react-native';
import { useDispatch } from 'react-redux';
import { OtpVerificationMethod } from '../redux/actions/AuthAction';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerification = ({ route }) => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { number } = route?.params;

  // 🔥 VERIFY OTP
  const handleVerifyOtp = async (otpValue) => {
    if (otpValue.length < 4) return;

    const body = {
      mobile_no: number,
      otp: otpValue,
    };

    const resp = await dispatch(OtpVerificationMethod(body));

    if (resp) {
      await AsyncStorage.setItem('isVerified', 'true');
      navigation.replace('Signup', { number, otpFromApi: otpValue });
    }
  };

  // 🔥 HANDLE INPUT (AUTOFILL + PASTE FIX)
  const handleChangeText = (value) => {
    const clean = value.replace(/[^0-9]/g, '');

    // FULL OTP autofill detect
    if (clean.length >= 4) {
      const finalOtp = clean.slice(0, 4);
      setOtp(finalOtp);
      handleVerifyOtp(finalOtp);
      return;
    }

    setOtp(clean);
  };



  // 🔥 AUTO FOCUS (ONLY ON LOAD)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subText}>
        Your OTP sent on {number}
      </Text>

      <View style={styles.inputContainer}>

        {/* 🔥 HIDDEN INPUT */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          showSoftInputOnFocus={true}
          style={styles.hiddenInput}
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          importantForAutofill="yes"
        />

        {/* 🔥 OTP BOXES */}
        {[0, 1, 2, 3].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => inputRef.current?.focus()}
          >
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>
                {otp[index] || ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 VERIFY BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleVerifyOtp(otp)}
      >
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>

      {/* 🔥 OPEN KEYBOARD BUTTON (IMPORTANT UX) */}
      {/* <TouchableOpacity
        onPress={() => inputRef.current?.focus()}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: 'blue' }}>Tap to reopen keyboard</Text>
      </TouchableOpacity> */}

    </View>
  );
};

export default OtpVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ECE447',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 40,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});