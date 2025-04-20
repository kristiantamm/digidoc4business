import axios from 'axios';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { showMessage } from "react-native-flash-message";
import { baseURL, VerificationType } from "../data";

export const deleteFile = async (fileId: number, fileName: string, onSuccess?: () => void) => {
    try {
        await axios.delete(`${baseURL}/files`, {
            params: { fileId }
        });
        showMessage({
            message: `File ${fileName} successfully deleted!`,
            type: "success",
            duration: 3000,
            floating: true,
        });
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error("Error deleting file:", error);
        Alert.alert('Error', 'There was an issue deleting the file.');
    }
};

export const downloadFile = async (fileName: string, base64Data: string) => {
    try {
        if (Platform.OS === 'web') {
            console.log(base64Data)
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

export const signFile = async (fileIds: number[], personalId: string, navigation: any, authenticationData: any, verificationType: VerificationType) => {
    try {
        const response = await axios.post(
            `${baseURL}/sid/startSign`,
            { personalId, fileIds },
        );
        if (response.status === 200) {
            navigation.navigate('Verification', { 
                verificationCode: response.data, 
                verificationType: verificationType,
                authenticationData: authenticationData 
            });
        } else {
            Alert.alert("Error", `Server returned status: ${response.status}`)
        }
    } catch (error) {
        Alert.alert('Error', `Error signing: ${error}`);
    }
};

export const shareFileWithUsers = async (fileId: number, targetUserIds: string[], sharedById: string) => {
    try {
        const response = await axios.post(`${baseURL}/files/${fileId}/share`, null, {
            params: {
                targetUserIds: targetUserIds.join(','), // Join the array into a comma-separated string
                sharedById
            }
        });
        if (response.status === 200) {
            showMessage({
                message: `File shared successfully with selected users!`,
                type: "success",
                duration: 3000,
                floating: true,
            });
        } else {
            Alert.alert("Error", `Server returned status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error sharing file:", error);
        Alert.alert('Error', 'There was an issue sharing the file.');
    }
};

export const revokeFileAccess = async (fileId: number, targetUserId: string, revokingUserId: string) => {
    try {
        const response = await axios.delete(`${baseURL}/files/${fileId}/revoke`, {
            params: {
                targetUserId,
                revokingUserId
            }
        });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to revoke file access');
        }
    } catch (error) {
        console.error('Error revoking file access:', error);
        throw error;
    }
};