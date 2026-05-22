import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

import imgPath from '../constants/imgPath';
import { ScrollView } from 'react-native-gesture-handler';
import TextInputCompo from '../Components/TextInputCompo';
import commonStyles from '../styles/commonStyles';
import Buttons from '../Components/Buttons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { moderateScale, scale } from '../styles/responsiveSize';
import { resendOtpMethod } from '../redux/actions/AuthAction';

const ResetPassword = () => {
    const [errors, setErrors] = useState({});
    const [inputs, setInputs] = useState({
        user_name: '',
    });

    const dispatch = useDispatch();
    const colors = useTheme().colors;
    const navigation = useNavigation()


const handleSubmit = async () => {
    console.log("👉 Submit Clicked");

    let isValid = true;

    const user_name = /^[0-9]+$/;

    console.log("📱 Entered Number:", inputs.user_name);

    if (!inputs.user_name) {
        console.log("❌ Empty number");
        handleError('Please input number', 'user_name');
        isValid = false;
    } else if (inputs.user_name.length !== 10) {
        console.log("❌ Length issue:", inputs.user_name.length);
        handleError('Mobile number must be 10 digits long', 'user_name');
        isValid = false;
    } else if (!user_name.test(inputs.user_name)) {
        console.log("❌ Contains non-digit values");
        handleError('Mobile number should contain only digits', 'user_name');
        isValid = false;
    } else {
        console.log("✅ Validation Passed");
        isValid = true;
    }

    console.log("🧾 Final isValid:", isValid);

    if (isValid) {
        try {
            console.log("📡 Calling resendOtp API...");

            const resp = await dispatch(resendOtpMethod(inputs?.user_name));

            console.log("📥 API Response:", resp);

            if (resp) {
                console.log("➡️ Navigating to OTP Screen");
                navigation.navigate('OtpVerification', {
                    number: inputs.user_name,
                    reset: true
                });
            } else {
                console.log("❌ API returned false");
            }

        } catch (error) {
            console.log("🔥 API Error:", error);
        }
    }
};


    const handleOnchange = (text, input) => {
        setInputs(prevState => ({ ...prevState, [input]: text }));
    };

    const handleError = (error, input) => {

        setErrors(prevState => ({ ...prevState, [input]: error }));
    };
    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.formContainer, {}]}>
               <Image
  style={{ height: 150, width: 150, alignSelf: 'center', marginBottom: 20 }}
  source={imgPath.applogo}
  resizeMode="center"
/>
                <Text style={[commonStyles.fontBold24, { color: colors.text, fontWeight: 'bold', marginBottom: scale(10), alignSelf: 'center', }]}>Password Reset</Text>

                <TextInputCompo
                    onChangeText={text => handleOnchange(text, 'user_name')}
                    onFocus={() => handleError(null, 'user_name')}
                    iconName="phone"
                    placeholder="Enter Registered Number"
                    error={errors.user_name}
                    maxLength={10}
                    keyboardType={'numeric'}
                    autoFocus={true}
                />

                <Buttons onPress={() => handleSubmit()} titel="Get Reset Otp" style={{}} />



            </View>
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',

    },
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#FFF'
    },
    formContainer: {
        // justifyContent: 'center',
        marginBottom: moderateScale(100)
    },
    signupTextContainer: {
        flexDirection: 'row',
    },
    signupText: {
        color: 'gray',

    },
});

export default ResetPassword;
