import React, { useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import styles from '../styles';
import { RootStackParamList } from '../App';
import { showMessage } from 'react-native-flash-message';
import * as FileSystem from 'expo-file-system';
import { AuthenticationResponse, baseURL } from "../data";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from 'axios';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const route = useRoute<HomeScreenRouteProp>();
    const authenticationData = route.params.authenticationData;
    const identity = route.params.authenticationData.identity;

    useEffect(() => {
        showMessage({
            message: "You have successfully authenticated yourself using Smart ID!",
            type: "success",
            duration: 3000,
            floating: true,
        });
    }, []);

    const getFirstName = (name: string | undefined) => {
        if (!name) return 'ERROR';
        return name.charAt(0).toUpperCase() + name.split(" ")[0].slice(1).toLowerCase();
    };

    const navToMyFiles = async () => {
        navigation.navigate('MyFiles', { authenticationData: authenticationData, errorMessage: null, signingData: null });
    };

    const navToSharedFiles = async () => {
        navigation.navigate('SharedFiles', { authenticationData: authenticationData, errorMessage: null });
    };

    const navToMyGroups = async () => {
        const userId = authenticationData.identity.identityNumber; // Assuming userId is identityNumber
        navigation.navigate('MyGroups', { userId, authenticationData });
    };

    const uploadDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'text/plain', 'application/vnd.etsi.asic-e+zip']
            });

            if (result.canceled) {
                Alert.alert('Cancelled', 'No file selected.');
                return;
            }

            const { uri, name } = result.assets[0];
            const uploadedBy = authenticationData.identity.identityNumber;

            let fileBlob: Blob;

            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                fileBlob = await response.blob();
            } else {
                const base64Data = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                fileBlob = new Blob([byteArray], { type: 'application/octet-stream' });
            }

            const formData = new FormData();
            formData.append('file', fileBlob, name);
            formData.append('uploadedBy', uploadedBy);

            const response = await axios.post(`${baseURL}/files/uploadFile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                navToMyFiles();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Error choosing file: ${error}`);
        }
    };

    return (
        <>
            {authenticationData.identity && (
                <>
                    <View style={styles.top}>
                        <Text style={styles.bigText}>Hello, {getFirstName(authenticationData.identity.name)}!</Text>
                    </View>
                    <View style={styles.container}>
                        <Text style={styles.smallText}>Upload new document for signing</Text>
                        <TouchableOpacity style={{ width: '80%' }} onPress={uploadDocument}>
                            <Text style={styles.confirmButton}>Upload file</Text>
                        </TouchableOpacity>

                        <Text style={styles.smallText}>See all of your files</Text>
                        <TouchableOpacity style={{ width: '80%' }} onPress={navToMyFiles}>
                            <Text style={styles.confirmButton}>My files</Text>
                        </TouchableOpacity>

                        <Text style={styles.smallText}>See all of the files that have been shared to you</Text>
                        <TouchableOpacity style={{ width: '80%' }} onPress={navToSharedFiles}>
                            <Text style={styles.confirmButton}>Shared with me</Text>
                        </TouchableOpacity>

                        <Text style={styles.smallText}>See all of your groups</Text>
                        <TouchableOpacity style={{ width: '80%' }} onPress={navToMyGroups}>
                            <Text style={styles.confirmButton}>My groups</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </>

    );
}
