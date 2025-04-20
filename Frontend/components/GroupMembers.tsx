import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import axios from 'axios';
import styles from '../styles';
import {baseURL, FileInFileList, VerificationType} from '../data';
import MembersModal from './MembersModal';
import AddMembersModal from './AddMembersModal';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import AddFilesToGroupModal from './AddFilesToGroupModal';
import SignatureOrderModal from './SignatureOrderModal';
import ConfirmationModal from './ConfirmationModal';
import Icon from "react-native-vector-icons/FontAwesome";
import {downloadFile, signFile} from "../utils/fileOperations";
import SignatureStateModal from "./SignatureStateModal";
import {StackNavigationProp} from "@react-navigation/stack";

type GroupMembersRouteProp = RouteProp<RootStackParamList, 'GroupMembers'>;
type GroupMembersNavigationProp = StackNavigationProp<RootStackParamList, 'GroupMembers'>;

interface GroupMember {
    id: string;
    name: string;
}

export default function GroupMembers() {
    const route = useRoute<GroupMembersRouteProp>();
    const { groupId, owner, userId, groupName } = route.params;
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [addFilesModalVisible, setAddFilesModalVisible] = useState<boolean>(false);
    const [signatureOrderModalVisible, setSignatureOrderModalVisible] = useState<boolean>(false);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState<boolean>(false);
    const [fileToRemove, setFileToRemove] = useState<FileInFileList | null>(null);
    const [signaturesModalVisible, setSignaturesModalVisible] = useState<boolean>(false);
    const [signatures, setSignatures] = useState<{ ordered: any[], unordered: any[] }>({ ordered: [], unordered: [] });
    const authenticationData = route.params.authenticationData;
    const navigation = useNavigation<GroupMembersNavigationProp>();

    useEffect(() => {
        fetchGroupMembers();
        fetchGroupFiles(); // Call fetchGroupFiles when the component mounts
    }, [groupId]);

    const fetchGroupMembers = async () => {
        try {
            const response = await axios.get(`${baseURL}/groups/${groupId}/members`);
            setMembers(response.data);
            setIsOwner(owner.id === userId);
        } catch (error) {
            console.error('Error fetching group members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupFiles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseURL}/files/group/${groupId}`);

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

    const fetchSignatures = async (fileId: number) => {
        try {
            const response = await axios.get(`${baseURL}/files/${fileId}/signatures`, {
                params: {
                    requestingUserId: userId,
                    groupId: groupId
                }
            });

            if (response.status === 200) {
                const ordered = response.data.filter((signature: any) => signature.signatureOrder > 0);
                const unordered = response.data.filter((signature: any) => signature.signatureOrder === 0);
                setSignatures({ ordered, unordered });

                if (ordered.length === 0 && unordered.length === 0) {
                    setSignatureOrderModalVisible(true);
                } else {
                    setSignaturesModalVisible(true);
                }
            } else {
                alert(`Failed to fetch signatures: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching signatures:', error);
            alert('An error occurred while fetching signatures.');
        }
    };

    const handleMembersAdded = async () => {
        await fetchGroupMembers();
    };

    const handleRemoveFile = async () => {
        if (fileToRemove) {
            try {
                const response = await axios.delete(`${baseURL}/files/${fileToRemove.id}/removeFromGroup`, {
                    params: {
                        groupId: groupId,
                        userId: userId
                    }
                });

                if (response.status === 200) {
                    fetchGroupFiles(); // Refresh the file list
                    setConfirmationModalVisible(false);
                    setFileToRemove(null);
                } else {
                    alert(`Failed to remove file: ${response.status}`);
                }
            } catch (error) {
                console.error('Error removing file:', error);
                alert('An error occurred while removing the file.');
            }
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#00b6ab" style={{ flex: 1 }} />;
    }

    const filteredFiles = files.filter(file =>
        file.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    ).sort((a, b) => {
        const isAAsice = a.name?.toLowerCase().endsWith('.asice') ? 1 : 0;
        const isBAsice = b.name?.toLowerCase().endsWith('.asice') ? 1 : 0;
        return isBAsice - isAAsice;
    });

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
            const uploadedBy = userId;
            const group = groupId.toString();

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
            formData.append('groupId', group);

            const response = await axios.post(`${baseURL}/files/uploadToGroup`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                fetchGroupFiles(); // Update the list of group files
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Error choosing file: ${error}`);
        }
    };

    function shortenFileName(name: string) {
        if (name.split(".")[0].length < 20) {
            return name;
        } else {
            const extension = name.split(".")[1];
            const beginning = name.substring(0, 20);
            return beginning + "[...]." + extension
        }
    }

    function formatDate(dateString: string) {
        if (!dateString) return 'Unknown';

        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return 'Unknown'; // If the date is invalid

        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${hours}:${minutes}, ${day}.${month}.${year}`;
    }

    function isAsice(name: string) {
        return name.split('.').pop() === 'asice'
    }

    const handleSign = async (fileIds: number[]) => {
        console.log(authenticationData)
        await signFile(fileIds, authenticationData.identity.identityNumber, navigation, authenticationData, VerificationType.GROUP);
    };

    return (
        <View style={[styles.container, { alignItems: 'center', justifyContent: 'flex-start' }]}>
            <Text style={styles.label}>{groupName}</Text>
            <Text style={styles.smallText}>Owner: {owner.name}</Text>

            {/* Buttons in one row */}
            <View style={localStyles.buttonRow}>
                <TouchableOpacity style={[localStyles.filledButton, localStyles.button]} onPress={() => setModalVisible(true)}>
                    <Text style={localStyles.buttonText}>View Members ({members.length})</Text>
                </TouchableOpacity>
                {isOwner && (
                    <TouchableOpacity style={[localStyles.outlinedButton, localStyles.button]} onPress={() => setAddModalVisible(true)}>
                        <Text style={localStyles.outlinedButtonText}>Add Members</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={localStyles.buttonRow}>
                <TouchableOpacity style={[localStyles.filledButton, localStyles.button]} onPress={uploadDocument}>
                    <Text style={localStyles.buttonText}>Upload group file</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[localStyles.outlinedButton, localStyles.button]} onPress={() => setAddFilesModalVisible(true)}>
                    <Text style={localStyles.outlinedButtonText}>Add file to group</Text>
                </TouchableOpacity>
            </View>

            {/* Wrap FlatList in a View with width: '80%' */}
            <View style={{ width: '80%' }}>
                <FlatList
                    data={filteredFiles}
                    keyExtractor={(item, index) => `${item.fileName}-${index}`}
                    renderItem={({ item }: { item: FileInFileList }) => (
                        <TouchableOpacity
                            style={[
                                styles.fileItem,
                                {
                                    backgroundColor: item.name.split('.').pop() === 'asice' ? 'rgba(0,182,171,0.08)' : '#ececec'
                                }
                            ]}
                        >
                            {/* Left side: file details */}
                            <View style={{ flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text style={{ fontStyle: 'italic', fontWeight: '600', marginTop: 2, fontSize: 12 }}>
                                    Uploaded at:{' '}
                                    <Text style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: 12 }}>
                                        {formatDate(item.dateUploaded)}
                                    </Text>
                                </Text>
                                <Text style={{ fontStyle: 'italic', fontWeight: '600', marginTop: 2, fontSize: 12 }}>
                                    Uploaded by:{' '}
                                    <Text style={{ fontStyle: 'italic', fontWeight: 'normal', fontSize: 12 }}>
                                        {item.uploadedBy || 'Unknown'}
                                    </Text>
                                </Text>
                            </View>

                            {/* Right side: buttons */}
                            <View style={styles.buttonsContainer}>
                                {isAsice(item.name) &&
                                    <TouchableOpacity style={styles.button} onPress={() => handleSign([item.id])}>
                                        <Icon name="pencil" size={20} color="#fff" />
                                    </TouchableOpacity>
                                }
                                <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(item.name, item.fileContent)}>
                                    <Icon name="download" size={20} color="#fff" />
                                </TouchableOpacity>
                                {isOwner && (
                                    <>
                                        <TouchableOpacity style={styles.signatureOrderButton} onPress={async () => {
                                            setSelectedFileId(item.id);
                                            await fetchSignatures(item.id);
                                        }}>
                                            <Icon name="list" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                )}
                                {(isOwner || item.uploadedBy === userId) && (
                                    <TouchableOpacity style={styles.deleteButton} onPress={() => {
                                        setFileToRemove(item);
                                        setConfirmationModalVisible(true);
                                    }}>
                                        <Icon name="trash" size={20} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>

                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>

            <MembersModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                members={members}
                isOwner={isOwner}
                ownerId={owner.id}
                groupId={groupId}
                onMembersUpdated={setMembers}
                userId={userId}
            />
            <AddMembersModal
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                groupId={groupId}
                userId={userId}
                onMembersAdded={handleMembersAdded}
            />

            <AddFilesToGroupModal
                visible={addFilesModalVisible}
                onClose={() => setAddFilesModalVisible(false)}
                groupId={groupId}
                userId={userId}
                onFilesAdded={fetchGroupFiles}
            />

            <SignatureOrderModal
                visible={signatureOrderModalVisible}
                onClose={() => {
                    fetchGroupFiles();
                    setSignatureOrderModalVisible(false);
                }}
                members={members}
                currentUserId={userId}
                fileId={selectedFileId}
                groupId={groupId}
            />

            <ConfirmationModal
                visible={confirmationModalVisible}
                onClose={() => setConfirmationModalVisible(false)}
                onConfirm={handleRemoveFile}
                message="Are you sure you want to remove this file from the group?"
                confirmText="Remove"
            />

            <SignatureStateModal
                visible={signaturesModalVisible}
                onClose={() => setSignaturesModalVisible(false)}
                signatures={signatures}
            />
        </View>
    );
}

const localStyles = StyleSheet.create({
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%', // Adjusted to a wider width for better layout
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    button: {
        flex: 1, // Equal space for both buttons
        marginHorizontal: 5,
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        height: 45, // Fixed height for consistent button size
        borderRadius: 20,
    },
    filledButton: {
        backgroundColor: '#00b6ab',
    },
    outlinedButton: {
        borderWidth: 2,
        borderColor: '#00b6ab',
        backgroundColor: 'transparent',
    },
    buttonText: {
        color: '#fff', // Default text color for filled button
        fontWeight: 'bold',
    },
    outlinedButtonText: {
        color: '#00b6ab', // Text color for outlined button
        fontWeight: 'bold'
    },
    signatureStateButton: {
        backgroundColor: '#ff69b4', // Pink color
        borderRadius: 5, // Square/rectangle shape
        padding: 10,
        marginLeft: 10,
    },
    removeButton: {
        backgroundColor: '#ff0000', // Red color
        borderRadius: 5, // Square/rectangle shape
        padding: 10,
        marginLeft: 10,
    }
});