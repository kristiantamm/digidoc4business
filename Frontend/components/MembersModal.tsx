import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { baseURL } from '../data';

interface Member {
    id: string;
    name: string;
}

interface MembersModalProps {
    visible: boolean;
    onClose: () => void;
    members: Member[];
    isOwner: boolean;
    ownerId: string;
    groupId: number;
    userId: string; // Add userId prop
    onMembersUpdated: (updatedMembers: Member[]) => void;
}

const MembersModal: React.FC<MembersModalProps> = ({ visible, onClose, members, isOwner, ownerId, groupId, userId, onMembersUpdated }) => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const toggleSelectMember = (memberId: string) => {
        setSelectedMembers(prevSelected =>
            prevSelected.includes(memberId)
                ? prevSelected.filter(id => id !== memberId)
                : [...prevSelected, memberId]
        );
    };

    const handleRemoveSelectedMembers = async () => {
        try {
            console.log(userId);
            console.log(selectedMembers);
            const queryParams = new URLSearchParams({
                requestingUserId: userId,
            });
            selectedMembers.forEach((id) => queryParams.append("targetUserIds", id)); // Append each user ID to the query

            await axios.delete(
                `${baseURL}/groups/${groupId}/removeUsers?${queryParams.toString()}`
            );

            const updatedMembers = members.filter(
                (member) => !selectedMembers.includes(member.id)
            );
            onMembersUpdated(updatedMembers);
            setSelectedMembers([]);
        } catch (error) {
            console.error("Error removing members:", error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalContent}>
                    <Text style={modalStyles.modalTitle}>List of all members</Text>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={modalStyles.memberItem}>
                                <View>
                                    <Text style={modalStyles.memberName}>{item.name}</Text>
                                    <Text style={modalStyles.memberId}>{item.id}</Text>
                                </View>
                                {isOwner && item.id !== ownerId && (
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.removeButton,
                                            selectedMembers.includes(item.id) && modalStyles.selectedButton
                                        ]}
                                        onPress={() => toggleSelectMember(item.id)}
                                    >
                                        <Text style={modalStyles.removeButtonText}>X</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                            <Text style={modalStyles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                        {selectedMembers.length > 0 && (
                            <TouchableOpacity
                                style={[modalStyles.closeButton, modalStyles.removeSelectedButton]}
                                onPress={handleRemoveSelectedMembers}
                            >
                                <Text style={modalStyles.removeSelectedButtonText}>Remove Selected</Text>
                            </TouchableOpacity>
                        )}
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
    memberItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    memberName: {
        fontWeight: 'bold',
    },
    memberId: {
        fontStyle: 'italic',
    },
    removeButton: {
        backgroundColor: '#f85959',
        borderRadius: 15,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    selectedButton: {
        backgroundColor: '#ffcccc',
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    closeButton: {
        backgroundColor: '#00b6ab',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    removeSelectedButton: {
        borderColor: '#f85959',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    removeSelectedButtonText: {
        color: '#f85959',
        fontWeight: 'bold',
    },
});

export default MembersModal;