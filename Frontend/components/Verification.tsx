import React, {useEffect} from 'react';
import {ActivityIndicator, Alert, Text, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import styles from '../styles';
import axios from 'axios';
import {RootStackParamList} from '../App';
import {AuthenticationResponse, baseURL, SigningResponse, VerificationType} from "../data";

type VerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Verification'>;
type VerificationScreenRouteProp = RouteProp<RootStackParamList, 'Verification'>;

export default function Verification() {
    const navigation = useNavigation<VerificationScreenNavigationProp>();
    const route = useRoute<VerificationScreenRouteProp>();
    const authenticationData = route.params.authenticationData;
    const verificationCode = route.params.verificationCode;
    const verificationType = route.params.verificationType;

    const authenticate = async() => {
        try {
            const response = await axios.post<AuthenticationResponse>(`${baseURL}/sid/authenticate`);
            if (response.status === 200) {
                const data = response.data;
                console.log(data)
                if (data.authenticated) {
                    return data
                } else {
                    navigation.navigate('SignIn', { errorMessage: data.message });
                }
            } else {
                navigation.navigate('SignIn', { errorMessage: response.statusText });
            }
        } catch (error) {
            navigation.navigate('SignIn', { errorMessage: "Something went wrong!" });
        }
    };
    const sign = async() => {
        try {
            const response = await axios.post<SigningResponse>(
                `${baseURL}/sid/sign`,
            );
            if (response.status === 200) {
                const data = response.data;
                console.log(data)
                if (data.signed) {
                    return data;
                } else {
                    navigation.navigate('Home', { 
                        authenticationData: authenticationData,
                        screen: 'MyFiles',
                        params: { errorMessage: data.message, signingData: null }
                    });
                    return null;
                }
            } else {
                navigation.navigate('Home', { 
                    authenticationData: authenticationData,
                    screen: 'MyFiles',
                    params: { errorMessage: response.statusText, signingData: null }
                });
                return null;
            }
        } catch (error) {
            navigation.navigate('Home', { 
                authenticationData: authenticationData,
                screen: 'MyFiles',
                params: { errorMessage: "Something went wrong!", signingData: null }
            });
            return null;
        }
    };

    useEffect(() => {
        if (verificationType == VerificationType.HOME) {
            authenticate().then(data  => {
                console.log("auth done")
                navigation.navigate('Home', { authenticationData: data });
            });
        } else if (verificationType == VerificationType.MY_FILES) {
            sign().then(data  => {
                if (data) {
                    console.log("sign done");
                    navigation.navigate('Home', {
                        authenticationData: authenticationData,
                        screen: 'MyFiles',
                        params: { errorMessage: null, signingData: data }
                    });
                }
            });
        } else if (verificationType == VerificationType.GROUP) {
            sign().then(data  => {
                if (data) {
                    console.log("sign done");
                    navigation.navigate('MyGroups', { 
                        userId: authenticationData.identity.identityNumber, 
                        authenticationData: authenticationData 
                    });
                }
            });
        } else {
            Alert.alert("Error", `Verification type: ${verificationType} does not exist`)
        }
    }, [verificationType]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Verification Code</Text>
            <Text style={styles.code}>{verificationCode}</Text>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
}
