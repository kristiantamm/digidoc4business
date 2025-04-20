import React, {useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from "../styles";
import {deleteFile, downloadFile, signFile} from '../utils/fileOperations';
import ShareFileModal from './ShareFileModal';
import {VerificationType} from "../data";

type FilePreviewRouteProp = RouteProp<RootStackParamList, 'FilePreview'>;

export default function FilePreview() {
    const route = useRoute<FilePreviewRouteProp>();
    const navigation = useNavigation();
    const { file, authenticationData } = route.params;
    const [shareModalVisible, setShareModalVisible] = useState(false);

    const handleDelete = () => {
        deleteFile(file.id, file.name, () => {
            navigation.goBack();
        });
    };

    const handleSign = () => {
        signFile([file.id], authenticationData.identity.identityNumber, navigation, authenticationData, VerificationType.MY_FILES);
    };

    const handleShare = () => {
        setShareModalVisible(true);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.bigText}>{file.name}</Text>

            <View>
                <Text style={styles.smallText}>
                    Uploaded by: {file.uploadedBy}
                </Text>
                <Text style={styles.smallText}>
                    Upload date: {new Date(file.dateUploaded).toLocaleString()}
                </Text>
            </View>

            <View style={styles.container}>
                <Text style={styles.smallText}>File Content (Preview):</Text>
                {file.name.endsWith('.txt') ? (
                    <Text style={styles.smallText}>
                        {atob(file.fileContent)}
                    </Text>
                ) : (
                    <Text style={styles.smallText}>
                        Preview not supported for Expo
                    </Text>
                )}
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSign}>
                    <Icon name="pencil" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(file.name, file.fileContent)}>
                    <Icon name="download" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Icon name="share" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Icon name="trash" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ShareFileModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                fileId={file.id}
                sharedById={authenticationData.identity.identityNumber}
            />
        </ScrollView>
    );
}