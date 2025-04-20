import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import styles from '../styles';
import { useNavigation, NavigationProp } from '@react-navigation/native';


export default function StartScreen() {
    const navigation = useNavigation<NavigationProp<any>>();

    return (
        <>
            <View style={styles.containerSmall}>
                <Image source={require('../assets/smartsignlogo.png')} style = {[{resizeMode: 'contain'}, {width: 300}, {marginTop: 150}]} />
            </View>
            <View  style={styles.container}>
                <Text style={styles.smallText}>Authenticate with Smart ID</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Image
                        source={require('../assets/smart_id_buttons/Smart-ID_login_btn_round.png')}
                        style={styles.buttonImage}
                    />
                </TouchableOpacity>
                <Text style={styles.smallText}>Don't have a Smart ID?</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.smart-id.com/register')}>
    <Text style={styles.smartIDText}>Register now!</Text>
</TouchableOpacity>
            </View>
        </>
    );
}
