import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { baseURL, FileInFileList } from '../data';
import Icon from 'react-native-vector-icons/FontAwesome';

interface AddFilesToGroupModalProps {
    visible: boolean;
    onClose: () => void;
    groupId: number;
    userId: string;
    onFilesAdded: () => void;
}

const AddFilesToGroupModal: React.FC<AddFilesToGroupModalProps> = ({ visible, onClose, groupId, userId, onFilesAdded }) => {
    const [files, setFiles] = useState<FileInFileList[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

    useEffect(() => {
        if (visible) {
            fetchUserFiles();
        }
    }, [visible]);

    const fetchUserFiles = async () => {
        try {
            const userFilesResponse = await axios.get(`${baseURL}/files/filesForUser`, {
                params: { userId },
            });

            const groupFilesResponse = await axios.get(`${baseURL}/files/group/${groupId}`);

            if (userFilesResponse.status === 200 && groupFilesResponse.status === 200) {
                const groupFileIds = new Set(groupFilesResponse.data.map((file: FileInFileList) => file.id));
                const filteredFiles = userFilesResponse.data.filter((file: FileInFileList) => !groupFileIds.has(file.id));
                setFiles(filteredFiles);
            } else {
                alert(`Failed to fetch files: ${userFilesResponse.status} or ${groupFilesResponse.status}`);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('An error occurred while fetching files.');
        }
    };

    const toggleFileSelection = (fileId: number) => {
        setSelectedFiles((prevSelected) =>
            prevSelected.includes(fileId)
                ? prevSelected.filter((id) => id !== fileId)
                : [...prevSelected, fileId]
        );
    };

    const handleAddFiles = async () => {
        try {
            const params = new URLSearchParams();
            selectedFiles.forEach(fileId => params.append('fileIds', fileId.toString()));
            params.append('groupId', groupId.toString());
            params.append('userId', userId);

            await axios.post(`${baseURL}/files/addToGroup`, null, {
                params: params,
            });
            onFilesAdded();
            onClose();
        } catch (error) {
            console.error('Error adding files to group:', error);
            Alert.alert('Error', 'An error occurred while adding files to the group.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Files to Group</Text>
                    {files.length === 0 ? (
                        <>
                            <Text style={styles.noFilesText}>All your files are already uploaded to this group.</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.button} onPress={onClose}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <FlatList
                                data={files}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.fileItem}
                                        onPress={() => toggleFileSelection(item.id)}
                                    >
                                        <View style={styles.checkboxContainer}>
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    selectedFiles.includes(item.id) && styles.checkboxSelected,
                                                ]}
                                            />
                                            <Text style={styles.fileName}>{item.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.button} onPress={handleAddFiles}>
                                    <Text style={styles.buttonText}>Add</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.outlinedButton} onPress={onClose}>
                                    <Text style={styles.outlinedButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    noFilesText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginVertical: 20,
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
    },
    checkboxSelected: {
        backgroundColor: '#00b6ab',
    },
    fileName: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        flex: 1,
        height: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: '#00b6ab',
    },
    outlinedButton: {
        flex: 1,
        height: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderColor: '#00b6ab',
        borderWidth: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlinedButtonText: {
        color: '#00b6ab',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddFilesToGroupModal;