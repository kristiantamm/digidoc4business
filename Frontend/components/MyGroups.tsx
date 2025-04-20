import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchUserGroups } from '../api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import styles from '../styles';
import ConfirmationModal from './ConfirmationModal';
import CreateGroupModal from './CreateGroupModal';
import {AuthenticationResponse, baseURL} from "../data";
import axios from "axios";

interface Group {
    id: number;
    name: string;
    owner: {
        id: string;
        name: string;
    };
    dateCreated: string;
}

type MyGroupsNavigationProp = StackNavigationProp<RootStackParamList, 'MyGroups'>;

interface MyGroupsProps {
    route: {
        params: {
            userId: string;
            authenticationData: AuthenticationResponse;
        };
    };
}

const MyGroups: React.FC<MyGroupsProps> = ({ route }) => {
    const { userId } = route.params;
    const navigation = useNavigation<MyGroupsNavigationProp>();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const authenticationData = route.params.authenticationData;

    useEffect(() => {
        fetchGroups();
    }, [userId]);

    const fetchGroups = async () => {
        try {
            const data = await fetchUserGroups(userId);
            setGroups(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToGroupMembers = (groupId: number, owner: { id: string; name: string }, userId: string, groupName: string) => {
        navigation.navigate('GroupMembers', { groupId, owner, userId, groupName, authenticationData });
    };
    const openCreateGroupModal = () => {
        setModalVisible(true);
    };

    const closeCreateGroupModal = () => {
        setModalVisible(false);
    };

    const confirmDeleteOrLeave = (group: Group, isOwner: boolean) => {
        setSelectedGroup(group);
        setIsOwner(isOwner);
        setConfirmationModalVisible(true);
    };

    const handleConfirm = () => {
        if (selectedGroup) {
            deleteOrLeaveGroup(selectedGroup.id, isOwner);
        }
        setConfirmationModalVisible(false);
    };

    const deleteOrLeaveGroup = async (groupId: number, isOwner: boolean) => {
        try {
            if (isOwner) {
                await axios.delete(`${baseURL}/groups/${groupId}/delete`, {
                    params: { ownerId: userId },
                });
            } else {
                await axios.post(`${baseURL}/groups/${groupId}/leave`, null, {
                    params: { userId: userId },
                });
            }
            await fetchGroups(); // Refresh the groups list
        } catch (error) {
            console.error('Error deleting or leaving group:', error);
            Alert.alert('Error', 'An error occurred while trying to delete or leave the group.');
        }
    };

    if (loading) {
        return (
            <View style={localStyles.container}>
                <ActivityIndicator size="large" color="#00b6ab" />
            </View>
        );
    }

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.label}>Your Groups</Text>
                <TouchableOpacity style={localStyles.buttonWrapper} onPress={openCreateGroupModal}>
                    <Text style={styles.confirmButton}>Create new group</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={groups}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={localStyles.columnWrapper}
                renderItem={({ item }) => (
                    <View style={localStyles.groupItem}>
                        <TouchableOpacity
                            style={localStyles.groupContent}
                            onPress={() => navigateToGroupMembers(item.id, item.owner, userId, item.name)}
                        >
                            <Text style={localStyles.groupName}>{item.name}</Text>
                            <Text style={localStyles.groupOwner}>Owner: {item.owner.name}</Text>
                            <Text style={localStyles.groupDate}>
                                Created: {new Date(item.dateCreated).toLocaleDateString('en-GB')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={localStyles.deleteButton}
                            onPress={() => confirmDeleteOrLeave(item, item.owner.id === userId)}
                        >
                            <Text style={localStyles.deleteButtonText}>
                                {item.owner.id === userId ? 'Delete' : 'Leave group'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <CreateGroupModal
                visible={modalVisible}
                onClose={closeCreateGroupModal}
                userId={userId}
                onGroupCreated={fetchGroups}
            />
            <ConfirmationModal
                visible={confirmationModalVisible}
                onClose={() => setConfirmationModalVisible(false)}
                onConfirm={handleConfirm}
                message={isOwner ? 'Are you sure you want to delete this group?' : 'Are you sure you want to leave this group?'}
                confirmText={isOwner ? 'Delete' : 'Leave'}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonWrapper: {
        width: '50%',
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    groupItem: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
        marginHorizontal: 3,
        width: '47%',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    groupContent: {
        flex: 1,
    },
    groupName: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
        textAlign: 'center',
    },
    groupOwner: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 5,
        textAlign: 'center',
    },
    groupDate: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'center',
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderColor: '#f85959', // Red color for delete/leave button
        borderWidth: 2,
        borderRadius: 20,
        padding: 11,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#f85959', // Red color for delete/leave button text
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 36,
        marginBottom: 20,
    },
});

export default MyGroups;