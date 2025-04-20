import React, { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, FlatList, Alert, Platform} from 'react-native';
import axios from 'axios';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import {AuthenticationResponse, baseURL, FileInFileList} from "../data";
import styles from "../styles";
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigationProp } from "@react-navigation/stack";
import {showMessage} from "react-native-flash-message";
import * as FileSystem from "expo-file-system";


type SharedFilesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SharedFiles'>;
type SharedFilesScreenRouteProp = RouteProp<RootStackParamList, 'SharedFiles'>;

export default function SharedFiles() {
    const navigation = useNavigation<SharedFilesScreenNavigationProp>();
    const route = useRoute<SharedFilesScreenRouteProp>();
    const authenticationData = route.params.authenticationData;
    const errorMessage = route.params.errorMessage;

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const downloadFile = async (fileName: string, base64Data: string) => {
        try {
            if (Platform.OS === 'web') {
                // For web: Use a Blob and create a download link
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);

                const blob = new Blob([byteArray], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);

                // Create a temporary anchor element for downloading
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);

                console.log(`File ${fileName} downloaded to your browser.`);
                showMessage({
                    message: `File ${fileName} successfully downloaded!`,
                    type: "success",
                    duration: 3000,
                    floating: true,
                });
            } else {
                // For native platforms: Use expo-file-system
                const uri = FileSystem.documentDirectory + fileName;
                console.log("downoald uri:", uri)

                // Write the file to the device's file system
                await FileSystem.writeAsStringAsync(uri, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (Platform.OS === 'android') {
                    /*// Request permission to access external storage
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission required', 'We need permission to save the file to your device.');
                        return;
                    }
                    const fileInfo = await FileSystem.getInfoAsync(uri);
                    console.log("fileinfo:", fileInfo)

                    // Save the file to the Downloads directory
                    const asset = await MediaLibrary.createAssetAsync(uri);
                    const album = await MediaLibrary.getAlbumAsync('Download');
                    if (album == null) {
                        await MediaLibrary.createAlbumAsync('Download', asset, false);
                    } else {
                        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                    }*/
                    try {
                        const uri = FileSystem.documentDirectory + fileName;

                        await FileSystem.writeAsStringAsync(uri, base64Data, {
                            encoding: FileSystem.EncodingType.Base64,
                        });

                    } catch (error) {
                        console.error('Error downloading the file:', error);
                    }
                }

                console.log('File downloaded to:', uri);
                showMessage({
                    message: `File ${fileName} successfully downloaded!`,
                    type: 'success',
                    duration: 3000,
                    floating: true,
                });
            }
        } catch (error) {
            console.error('Error downloading the file:', error);
            Alert.alert('Error', 'There was an issue downloading the file.');
        }
    };

    const loadSharedFiles = async () => {
        if (!authenticationData.identity || !authenticationData.identity.identityNumber) {
            alert('Personal ID not available.');
            return;
        }

        const userId = authenticationData.identity.identityNumber;
        setLoading(true);

        try {
            const response = await axios.get(`${baseURL}/files/sharedWithUser`, {
                params: { userId },
            });

            if (response.status === 200) {
                setFiles(response.data);
            } else {
                alert(`Failed to fetch files: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('An error occurred while fetching files.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSharedFiles();
        if (errorMessage != null) {
            Alert.alert("Error", errorMessage);
        }
    }, [route.params, errorMessage]);

    return (
        <View style={styles.container}>
            {loading && <Text>Loading...</Text>}
            <FlatList
                data={files}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }: { item: FileInFileList }) => (
                    <View style={styles.fileItem}>
                        <Text style={styles.fileName}>{item.name}</Text>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(item.name, item.fileContent)}>
                                <Icon name="download" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListHeaderComponent={<Text style={styles.label}>Files shared with you:</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}