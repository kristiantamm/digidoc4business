import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { baseURL } from "../data";

const Notifications = ({ route }) => {
    const { authenticationData } = route.params;
    const personalId = authenticationData.identity.identityNumber;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${baseURL}/notifications`, {
                params: { personalId }
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`${baseURL}/notifications/${id}/read`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id ? { ...notification, isRead: true } : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAsUnread = async (id) => {
        try {
            await axios.post(`${baseURL}/notifications/${id}/unread`);
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.id === id ? { ...notification, isRead: false } : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as unread:', error);
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.notification,
                            item.isRead ? styles.readNotification : styles.unreadNotification,
                        ]}
                        onPress={() =>
                            item.isRead ? markAsUnread(item.id) : markAsRead(item.id)
                        }
                    >
                        <Text
                            style={[
                                styles.title,
                                item.isRead ? styles.readText : styles.unreadText
                            ]}
                        >
                            Notification #{item.id}
                        </Text>
                        <Text
                            style={[
                                styles.message,
                                item.isRead ? styles.readText : styles.unreadText
                            ]}
                        >
                            {item.text}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    notification: {
        padding: 15,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },
    unreadNotification: {
        backgroundColor: '#f9f9f9',
        borderColor: '#007bff',
    },
    readNotification: {
        backgroundColor: '#e0e0e0',
        borderColor: '#aaa',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 14,
    },
    unreadText: {
        color: '#000',
    },
    readText: {
        color: '#555',
    },
    button: {
        marginHorizontal: 10,
        padding: 8,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default Notifications;