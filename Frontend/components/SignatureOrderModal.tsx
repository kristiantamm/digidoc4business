import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles';
import axios from "axios";
import {baseURL} from "../data";

interface SignatureOrderModalProps {
    visible: boolean;
    onClose: () => void;
    members: { id: string; name: string }[];
    currentUserId: string;
    fileId: number;
    groupId: number;
}

const SignatureOrderModal: React.FC<SignatureOrderModalProps> = ({ visible, onClose, members, currentUserId, fileId, groupId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<{ id: string; name: string; order: number }[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        if (!visible) {
            setSelectedMembers([]);
        }
    }, [visible]);

    const filteredMembers = members.filter((member) =>
        (isNaN(Number(searchQuery))
            ? member.name.toLowerCase().includes(searchQuery.toLowerCase())
            : member.id.includes(searchQuery)) &&
        !selectedMembers.some(selected => selected.id === member.id)
    );

    const handleSelectMember = (member: { id: string; name: string }) => {
        setSelectedMembers((prev) => [...prev, { ...member, order: prev.length + 1 }]);
        setSearchQuery('');
        setIsInputFocused(false);
    };

    const handleRemoveMember = (index: number) => {
        setSelectedMembers((prev) => {
            const newSelectedMembers = [...prev];
            newSelectedMembers[index].order = 0;
            newSelectedMembers.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
            let order = 1;
            newSelectedMembers.forEach((member) => {
                if (member.order !== 0) {
                    member.order = order++;
                }
            });
            return newSelectedMembers;
        });
    };

    const handleDeleteMember = (index: number) => {
        setSelectedMembers((prev) => {
            const updatedMembers = [...prev];
            updatedMembers.splice(index, 1); // Remove the member at the given index

            // Recalculate order starting from 0
            return updatedMembers.map((member, idx) => ({
                ...member,
                order: idx, // Reassign orders starting from 0
            }));
        });
    };



    const handleSetOrder = async () => {
        try {
            const signers = selectedMembers.map(member => ({
                userId: member.id,
                signatureOrder: member.order
            }));

            const requestBody = {
                signers,
                assigningUserId: currentUserId
            };

            await axios.post(`${baseURL}/files/file/${fileId}/group/${groupId}/assignSigners`, requestBody);

            console.log('Signers assigned successfully');
            onClose();
        } catch (error) {
            console.error('Error assigning signers:', error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={localStyles.modalContainer}>
                <View style={localStyles.modalContent}>
                    <Text style={localStyles.modalTitle}>Select Signature Order</Text>
                    <TextInput
                        style={localStyles.input}
                        placeholder="Search members..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsInputFocused(true)}
                    />
                    {isInputFocused && (
                        <FlatList
                            data={filteredMembers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.memberItem}
                                    onPress={() => handleSelectMember(item)}
                                >
                                    <Text>{item.name} ({item.id})</Text>
                                </TouchableOpacity>
                            )}
                            style={localStyles.dropdown}
                        />
                    )}
                    <View style={localStyles.selectedMembersContainer}>
                        <Text style={localStyles.selectedTitle}>Selected Members</Text>
                        {selectedMembers.length === 0 ? (
                            <Text style={localStyles.noSelectionText}>No members selected yet.</Text>
                        ) : (
                            <FlatList
                                data={selectedMembers}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => (
                                    <View style={localStyles.selectedMemberItem}>
                                        <TouchableOpacity
                                            style={localStyles.orderBox}
                                            onPress={() => handleRemoveMember(index)}
                                        >
                                            <Text style={localStyles.orderBoxText}>{item.order}</Text>
                                        </TouchableOpacity>
                                        <Text style={localStyles.selectedMemberText}>
                                            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text> ({item.id})
                                        </Text>
                                        <TouchableOpacity onPress={() => handleDeleteMember(index)}>
                                            <Icon name="times-circle" size={20} color="#ff0000" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                    <View style={localStyles.buttonContainer}>
                        <TouchableOpacity style={localStyles.button} onPress={handleSetOrder}>
                            <Text style={localStyles.buttonText}>Set order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={localStyles.outlinedButton} onPress={onClose}>
                            <Text style={localStyles.outlinedButtonText}>Cancel</Text>
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
    memberItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedMembersContainer: {
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
    selectedMemberItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginVertical: 3,
        backgroundColor: '#e0f7fa',
        borderRadius: 5,
        borderColor: '#00b6ab',
        borderWidth: 2,
    },
    selectedMemberText: {
        fontSize: 14,
        color: 'black',
    },
    orderBox: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#00b6ab',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    orderBoxText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default SignatureOrderModal;