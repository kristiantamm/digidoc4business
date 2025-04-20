import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    confirmText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ visible, onClose, onConfirm, message, confirmText }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={modalStyles.modalContainer}>
                <View style={modalStyles.modalContent}>
                    <Text style={modalStyles.modalTitle}>Confirmation</Text>
                    <Text style={modalStyles.message}>{message}</Text>
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={modalStyles.confirmButtonText}>{confirmText}</Text>
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
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
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
    },
    confirmButton: {
        borderColor: '#00b6ab', // Match the background color of the "Create new group" button
        borderWidth: 2,
    },
    cancelButton: {
        borderColor: '#f85959',
        borderWidth: 2,
    },
    confirmButtonText: {
        color: '#00b6ab', // Match the background color of the "Create new group" button
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: '#f85959',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConfirmationModal;