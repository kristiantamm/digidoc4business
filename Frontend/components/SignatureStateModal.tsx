import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";

interface SignatureStateModalProps {
    visible: boolean;
    onClose: () => void;
    signatures: { ordered: any[], unordered: any[] };
}

const SignatureStateModal: React.FC<SignatureStateModalProps> = ({ visible, onClose, signatures }) => {

    const orderedSignatures = signatures.ordered
        .filter(signature => signature.signatureOrder > 0)
        .sort((a, b) => a.signatureOrder - b.signatureOrder);

    const unorderedSignatures = signatures.unordered.filter(signature => signature.signatureOrder === 0);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown';

        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return 'Unknown';

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.selectedMembersContainer}>
                        <Text style={styles.sectionTitle}>Ordered Signatures</Text>
                        {orderedSignatures.length > 0 ? (
                            <FlatList
                                data={orderedSignatures}
                                keyExtractor={(item, index) => `${item.userId}-${index}`}
                                renderItem={({ item }) => (
                                    <View style={styles.signatureItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.signatureName}>({item.signatureOrder}) {item.signedBy.name}</Text>
                                            <Text style={styles.signatureDetails}>{item.signedBy.id}</Text>
                                            {item.isSigned && <Text style={styles.signatureDetails}>Signed on: {formatDate(item.dateSigned)}</Text>}
                                        </View>
                                        <Text style={item.isSigned ? styles.signedText : styles.pendingText}>
                                            {item.isSigned ? 'Signed' : 'Pending'}
                                        </Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <Text style={styles.noSignaturesText}>No ordered signatures found for this file.</Text>
                        )}
                    </View>

                    <View style={styles.selectedMembersContainer}>
                    <Text style={styles.sectionTitle}>Unordered Signatures</Text>
                    {unorderedSignatures.length > 0 ? (
                        <FlatList
                            data={unorderedSignatures}
                            keyExtractor={(item, index) => `${item.userId}-${index}`}
                            renderItem={({ item }) => (
                                <View style={styles.signatureItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.signatureName}>{item.signedBy.name}</Text>
                                        <Text style={styles.signatureDetails}>{item.signedBy.id}</Text>
                                        {item.isSigned && <Text style={styles.signatureDetails}>Signed on: {formatDate(item.dateSigned)}</Text>}
                                    </View>

                                    <Text style={item.isSigned ? styles.signedText : styles.pendingText}>
                                        {item.isSigned ? 'Signed' : 'Pending'}
                                    </Text>

                                </View>
                            )}
                        />
                    ) : (
                        <Text style={styles.noSignaturesText}>No unordered signatures found for this file.</Text>
                    )}
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
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
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    signatureItem: {
        flexDirection: 'row', // Arrange items horizontally
        justifyContent: 'space-between', // Push items to opposite ends
        alignItems: 'center', // Align items vertically
        padding: 10,
        marginVertical: 3,
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        backgroundColor: '#fff',
    },
    signatureName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    signatureDetails: {
        fontSize: 12,
        fontStyle: 'italic',
        color: 'gray',
    },
    noSignaturesText: {
        fontSize: 14,
        color: 'gray',
        fontStyle: 'italic',
        marginTop: 10,
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
    signedText: {
        color: '#00b6ab',
        fontWeight: 'bold',
    },
    pendingText: {
        color: '#f85959',
        fontWeight: 'bold',
    },
    closeButton: {
        flex: 1,
        height: 45,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderColor: '#00b6ab',
        borderWidth: 2,
        marginTop: 20,
    },
    closeButtonText: {
        color: '#00b6ab',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
});

export default SignatureStateModal;