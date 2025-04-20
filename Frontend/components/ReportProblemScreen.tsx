// ReportProblemScreen.tsx
import React, { useState } from 'react';
import {View, TextInput, Button, Text, StyleSheet, TouchableOpacity} from 'react-native';
import styles from "../styles";
import axios from "axios";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {RootStackParamList} from "../App";
import {StackNavigationProp} from "@react-navigation/stack";
import {baseURL} from "../data";
import {showMessage} from "react-native-flash-message";

type ReportProblemScreenRouteProp = RouteProp<RootStackParamList, 'ReportProblemScreen'>;
type ReportProblemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReportProblemScreen'>;

function ReportProblemScreen() {
    const navigation = useNavigation<ReportProblemScreenNavigationProp>();
    const route = useRoute<ReportProblemScreenRouteProp>();
    const identity = route.params.authenticationData.identity;

    const [report, setReport] = useState('');

    const handleSendReport = async () => {
        try {
            const requestData = {
                text: report,
                reporterPersonalId: identity.identityNumber,
            };

            const response = await axios.post(`${baseURL}/report`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                showMessage({
                    message: 'Report sent successfully',
                    type: "success",
                    duration: 3000,
                    floating: true,
                });
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error sending report:', error);
        }
    };

    return (
        <>
            <View style={styles.reportContainer}>
                <Text style={styles.bigText}>Report a Problem</Text>
                <TextInput
                    style={styles.reportInput}
                    placeholder="Describe the problem"
                    value={report}
                    onChangeText={setReport}
                    multiline
                />
                <TouchableOpacity style={{ width: '80%' }} onPress={handleSendReport}>
                    <Text style={styles.confirmButton}>Send Report</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

export default ReportProblemScreen;
