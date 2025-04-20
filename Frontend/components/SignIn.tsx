import React, {useEffect, useState} from 'react';
import { TextInput, View, TouchableOpacity, Image, ActivityIndicator, Text } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import styles from '../styles';
import { RootStackParamList } from '../App';
import {log} from "expo/build/devtools/logger";
import {AuthenticationResponse, baseURL, VerificationType} from "../data";
import { Picker } from '@react-native-picker/picker';
import { developerMode } from '../data';


type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignIn'>;
type SignInScreenRouteProp = RouteProp<RootStackParamList, 'SignIn'>;

export default function SignIn() {
    const navigation = useNavigation<SignInScreenNavigationProp>();
    const route = useRoute<SignInScreenRouteProp>();

    const [personalId, setPersonalId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(route.params?.errorMessage || null);
    const [country, setCountry] = useState('EE');

    const isButtonEnabled = () => {
        return personalId.length >= 11;
    };

    const startAuthentication = async () => {
        setLoading(true);
        setErrorMessage(null);


        try {
            const response = await axios.post(`${baseURL}/sid/startAuthentication`, { personalId: personalId, country: country });
            if (response.status === 200) {
                navigation.navigate('Verification', { verificationCode: response.data, verificationType: VerificationType.HOME, authenticationData: null });
            } else {
                setErrorMessage('Invalid isikukood. Please try again.');
            }
        } catch (error) {
            console.error('Error sending isikukood:', error);
            setErrorMessage('Error sending isikukood. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        console.log("Received params:", route.params);
        console.log("url", baseURL);
        if (route.params != null) {
            setErrorMessage(route.params.errorMessage);
        }
    }, [route.params]);

    const navToHome = async () => {
        const testData: AuthenticationResponse = {
            authenticated: true,
            message: "Authentication successful",
            identity: {
                name: "John Doe",
                identityNumber: "hash123",
            }
        };
        navigation.navigate('Home', { authenticationData: testData });
    };

    const navToHomeSecond = async () => {
        const testData: AuthenticationResponse = {
            authenticated: true,
            message: "Authentication successful",
            identity: {
                name: "Rasmus Made",
                identityNumber: "hash789",
            }
        };
        navigation.navigate('Home', { authenticationData: testData });
    };


    return (
        <>
        <View style={styles.container}>
            <Text style={styles.label}>SmartSign</Text>

            {/* Country Picker */}
            <Picker
                selectedValue={country}
                onValueChange={(itemValue) => setCountry(itemValue)}
                style={styles.picker}
            >
                <Picker.Item style={styles.picker} label="Estonia" value="EE" />
                <Picker.Item style={styles.picker} label="Latvia" value="LV" />
                <Picker.Item style={styles.picker} label="Lithuania" value="LT" />
            </Picker>

            <TextInput
                style={styles.input}
                placeholder="Personal ID"
                value={personalId}
                onChangeText={setPersonalId}
                keyboardType="numeric"
            />
            <TouchableOpacity 
                onPress={startAuthentication}
                disabled={!isButtonEnabled()}
                style={{ opacity: isButtonEnabled() ? 1 : 0.5 }}
            >
                <Image
                    source={require('../assets/smart_id_buttons/Smart-ID_login_btn_round.png')}
                    style={styles.buttonImage}
                />
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
        </View>

        {developerMode && (
            <View style={styles.container}>
                <TouchableOpacity style={{width: '80%'}} onPress={navToHome}>
                    <Text style={styles.confirmButton}>Navigate To  Home Without Verification (John Doe - hash123)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{width: '80%'}} onPress={navToHomeSecond}>
                    <Text style={styles.confirmButton}>Navigate To  Home Without Verification (Rasmus Made - hash789)</Text>
                </TouchableOpacity>
            </View>
        )}
        </>

);
}
