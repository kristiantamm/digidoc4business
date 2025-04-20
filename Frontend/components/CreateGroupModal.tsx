import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import axios from 'axios';
import { baseURL } from '../data';
import styles from '../styles';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    userId: string;
    onGroupCreated: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ visible, onClose, userId, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');

    const handleCreateGroup = async () => {
        try {
            await axios.post(`${baseURL}/groups/create`, { ownerId: userId, name: groupName });
            onGroupCreated();
            onClose();
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalContent}>
                    <Text style={modalStyles.modalTitle}>Create New Group</Text>
                    <Text style={modalStyles.label}>Group Name</Text>
                    <TextInput
                        style={modalStyles.input}
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.confirmButton]}
                            onPress={handleCreateGroup}
                        >
                            <Text style={modalStyles.confirmButtonText}>Create</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
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
    label: {
        alignSelf: 'flex-start',
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Add equal spacing between buttons
        alignItems: 'center', // Align buttons vertically
        width: '100%',
        marginTop: 10,
    },
    button: {
        flex: 1, // Ensure buttons take equal width
        height: 45, // Set a fixed height for consistent alignment
        borderRadius: 20,
        justifyContent: 'center', // Centers text vertically
        alignItems: 'center', // Centers text horizontally
        marginHorizontal: 5, // Space between buttons
    },
    confirmButton: {
        backgroundColor: '#00b6ab',
    },
    cancelButton: {
        borderColor: '#00b6ab',
        borderWidth: 2,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: '#00b6ab',
        fontSize: 16,
        fontWeight: 'bold',
    },
});



export default CreateGroupModal;