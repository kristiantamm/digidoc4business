import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import axios from 'axios';
import { baseURL } from '../data';

interface AddMembersModalProps {
    visible: boolean;
    onClose: () => void;
    groupId: number;
    userId: string;
    onMembersAdded: (newMembers: string[]) => void;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({ visible, onClose, groupId, userId, onMembersAdded }) => {
    const [newMembers, setNewMembers] = useState<string>('');

    const handleAddMembers = async () => {
        const memberIds = newMembers.split(',').map((id) => id.trim());
        try {
            await axios.post(
                `${baseURL}/groups/${groupId}/addUsers`,
                memberIds,
                {
                    params: {
                        requestingUserId: userId,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            onMembersAdded(memberIds);
            onClose();
        } catch (error) {
            console.error('Error adding members:', error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalContent}>
                    <Text style={modalStyles.modalTitle}>Add Members</Text>
                    <TextInput
                        style={modalStyles.input}
                        placeholder="Enter user IDs, separated by commas"
                        value={newMembers}
                        onChangeText={setNewMembers}
                    />
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity style={modalStyles.button} onPress={handleAddMembers}>
                            <Text style={modalStyles.buttonText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.button} onPress={onClose}>
                            <Text style={modalStyles.buttonText}>Cancel</Text>
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
        justifyContent: 'space-between',
        width: '100%',
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
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddMembersModal;