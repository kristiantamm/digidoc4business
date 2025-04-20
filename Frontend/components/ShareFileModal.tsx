import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles';
import { shareFileWithUsers, revokeFileAccess } from '../utils/fileOperations';
import axios from 'axios';
import { baseURL } from '../data';

interface ShareFileModalProps {
    visible: boolean;
    onClose: () => void;
    fileId: number;
    sharedById: string;
}

const ShareFileModal: React.FC<ShareFileModalProps> = ({ visible, onClose, fileId, sharedById }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string, }[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<{ id: string; name: string }[]>([]);
    const [sharedUsers, setSharedUsers] = useState<{ userId: string; userName: string }[]>([]);

    useEffect(() => {
        if (visible) {
            fetchUsersOnce();
            fetchSharedUsers();
        }
    }, [visible]);

    const fetchUsersOnce = async () => {
        try {
            const response = await axios.get(`${baseURL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            Alert.alert('Error', 'There was an issue fetching users.');
        }
    };

    const fetchSharedUsers = async () => {
        try {
            const response = await axios.get(`${baseURL}/files/${fileId}/sharedUsers`);
            setSharedUsers(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching shared users:", error);
            Alert.alert('Error', 'There was an issue fetching shared users.');
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers([]);
        } else {
            const isNumber = !isNaN(Number(searchQuery));
            const filtered = users.filter(
                (user) =>
                    user.id !== sharedById && // Exclude the file owner
                    (isNumber
                        ? user.id.includes(searchQuery)
                        : user.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    !selectedUsers.some((selected) => selected.id === user.id)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users, selectedUsers, sharedById]);

    const handleSelectUser = (user: { id: string; name: string }) => {
        setSelectedUsers((prev) => [...prev, user]);
        setSearchQuery('');
        setFilteredUsers([]);
    };

    const handleRemoveUser = (index: number) => {
        setSelectedUsers((prev) => {
            const updatedUsers = [...prev];
            updatedUsers.splice(index, 1);
            return updatedUsers;
        });
    };

    const handleRemoveSharedUser = async (index: number) => {
        const userToRemove = sharedUsers[index];
        try {
            await revokeFileAccess(fileId, userToRemove.userId, sharedById);
            setSharedUsers((prev) => {
                const updatedUsers = [...prev];
                updatedUsers.splice(index, 1);
                return updatedUsers;
            });
            Alert.alert('Success', 'User access revoked successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to revoke user access.');
        }
    };

    const handleShare = async () => {
        const targetUserIds = selectedUsers.map((user) => user.id);
        try {
            await shareFileWithUsers(fileId, targetUserIds, sharedById);
            Alert.alert('Success', 'File shared successfully!');
            setSelectedUsers([]); // Clear selected users
            onClose();
        } catch (error) {
            console.error('Error sharing file:', error);
            Alert.alert('Error', 'Failed to share the file.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={localStyles.modalContainer}>
                <View style={localStyles.modalContent}>
                    <Text style={localStyles.modalTitle}>Share File</Text>
                    <TextInput
                        style={localStyles.input}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {filteredUsers.length > 0 && (
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.userItem}
                                    onPress={() => handleSelectUser(item)}
                                >
                                    <Text>{item.name} ({item.id})</Text>
                                </TouchableOpacity>
                            )}
                            style={localStyles.dropdown}
                        />
                    )}
                    <View style={localStyles.selectedUsersContainer}>
                        <Text style={localStyles.selectedTitle}>Selected Users</Text>
                        {selectedUsers.length === 0 ? (
                            <Text style={localStyles.noSelectionText}>No users selected yet.</Text>
                        ) : (
                            <FlatList
                                data={selectedUsers}
                                keyExtractor={(item, index) => `${item.id}-${index}`} // Ensure unique keys
                                renderItem={({ item, index }) => (
                                    <View style={localStyles.selectedUserItem}>
                                        <Text style={localStyles.selectedUserText}>{item.name} ({item.id})</Text>
                                        <TouchableOpacity onPress={() => handleRemoveUser(index)}>
                                            <Icon name="times-circle" size={20} color="#ff0000" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />

                        )}
                    </View>
                    <View style={localStyles.sharedUsersContainer}>
                        <Text style={localStyles.selectedTitle}>Shared Users</Text>
                        {sharedUsers.length === 0 ? (
                            <Text style={localStyles.noSelectionText}>No users shared yet.</Text>
                        ) : (
                            <FlatList
                                data={sharedUsers}
                                keyExtractor={(item) => item.userId}
                                renderItem={({ item, index }) => (
                                    <View style={localStyles.selectedUserItem}>
                                        <Text style={localStyles.selectedUserText}>
                                            <Text style={{ fontWeight: 'bold' }}>{item.userName}</Text> ({item.userId})
                                        </Text>
                                        <TouchableOpacity onPress={() => handleRemoveSharedUser(index)}>
                                            <Icon name="times-circle" size={20} color="#ff0000" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                    <View style={localStyles.buttonContainer}>
                        <TouchableOpacity style={localStyles.button} onPress={handleShare}>
                            <Text style={localStyles.buttonText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={localStyles.outlinedButton} onPress={onClose}>
                            <Text style={localStyles.outlinedButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    dropdown: {
        width: '100%',
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    userItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedUsersContainer: {
        width: '100%',
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    sharedUsersContainer: {
        width: '100%',
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    selectedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    noSelectionText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#777',
    },
    selectedUserItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginVertical: 3,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderColor: '#00b6ab',
        borderWidth: 2,
    },
    selectedUserText: {
        fontSize: 14,
        color: 'black',
    },
});

export default ShareFileModal;