import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import {useState} from "react";

const SharingScreen = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');

    const sendEmail = async () => {
        try {
            // Predefined subject and body
            const emailData = {
                to: email,
                subject: "Document to SmartSign",
                body: "Someone has sent you a document to sign. Please sign up with SmartSign to access it.",
            };

            // Send a POST request to the backend
            await axios.post('http://localhost:8064/api/email/send', emailData);
            setStatus('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            setStatus('Failed to send email.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Send Notification Email</Text>
            <TextInput
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={sendEmail} style={styles.button}>
                <Text style={styles.buttonText}>Send Email</Text>
            </TouchableOpacity>
            {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: 'turquoise',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    status: { marginTop: 20, fontSize: 16, color: 'gray' },
});
/*const [isSmartSignUser, setIsSmartSignUser] = useState(false);

const handleSmartSignUserSelection = (value) => {
    setIsSmartSignUser(value);
};

return (
    <View style={styles.container}>
        <Text style={styles.question}>Is the recipient a SmartSign user?</Text>
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={() => handleSmartSignUserSelection(true)}
            >
                <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={() => handleSmartSignUserSelection(false)}
            >
                <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
        </View>
    </View>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

},
question: {
    fontSize: 18,
    marginBottom: 20,
},
buttonContainer: {
    flexDirection: 'row',
},
button: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
    elevation: 5,
},
yesButton: {
    backgroundColor: 'green',
},
noButton: {
    backgroundColor: 'red',
},
buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
},
});*/

export default SharingScreen;