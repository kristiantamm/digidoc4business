import './gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList} from '@react-navigation/drawer';
import SignIn from './components/SignIn';
import Home from './components/Home';
import StartScreen from './components/StartScreen';
import Verification from './components/Verification';
import FlashMessage from "react-native-flash-message";
import {AuthenticationResponse, FileInFileList, SigningResponse, VerificationType} from './data';
import MyGroups from "./components/MyGroups";
import GroupMembers from "./components/GroupMembers";
import MyFiles from './components/MyFiles';
import Sharing from "./components/Sharing";
import Notifications from "./components/Notifications";
import {Image, TouchableOpacity, View} from 'react-native';
import FilePreview from './components/FilePreview';
import SharedFiles from "./components/SharedFiles";
import styles from "./styles";
import React from "react";
import ReportProblemScreen from "./components/ReportProblemScreen";

// Define the type for your stack
export type RootStackParamList = {
    StartScreen: undefined;
    SignIn: { errorMessage: string };
    Verification: { verificationCode: string, verificationType: VerificationType, authenticationData: AuthenticationResponse };
    Home: { 
        authenticationData: AuthenticationResponse;
        screen?: string;
        params?: {
            errorMessage?: string | null;
            signingData?: SigningResponse | null;
        };
    };
    MyFiles: { authenticationData: AuthenticationResponse, errorMessage: string, signingData: SigningResponse };
    SharedFiles: { authenticationData: AuthenticationResponse, errorMessage: string };
    MyGroups: { userId: string, authenticationData: AuthenticationResponse };
    GroupMembers: { groupId: number, owner: { id: string; name: string }, userId: string, groupName: string, authenticationData: AuthenticationResponse };
    FilePreview: {
        file: FileInFileList
        authenticationData: AuthenticationResponse
    };
    ReportProblemScreen: { authenticationData: AuthenticationResponse }
};

// Drawer Navigator Param List
export type DrawerParamList = {
    Home: { authenticationData: AuthenticationResponse };
    MyFiles: { authenticationData: AuthenticationResponse, errorMessage?: string, signingData?: SigningResponse };
    Sharing: { authenticationData: AuthenticationResponse }
    Notifications: { authenticationData: AuthenticationResponse };
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: any) {
    const { authenticationData } = props;
    console.log(authenticationData)

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <View style={styles.feedbackContainer}>
                    <DrawerItem
                        label="Report a problem"
                        onPress={() => props.navigation.navigate('ReportProblemScreen', { authenticationData })}
                        labelStyle={{ color: 'red' }}
                    />
            </View>
        </DrawerContentScrollView>
    );
}

// Drawer Navigator Component
function DrawerNavigator({ route }: any) {
    const { authenticationData } = route.params;

    return (
        <Drawer.Navigator initialRouteName="Home"
                          drawerContent={(props) => <CustomDrawerContent {...props} authenticationData={authenticationData} />}
                          screenOptions={{
                              headerTitle: () => (
                                  <Image
                                      source={require('./assets/smartsignlogo.png')}
                                      style={{ width: 120, height: 40, resizeMode: 'contain' }}
                                  />
                              ),
                              headerTitleAlign: 'center',
                              headerStyle: {
                                  backgroundColor: '#f8f9fa',
                              },
                              drawerActiveTintColor: '#00b6ab',
                              drawerInactiveTintColor: 'black',
                              drawerStyle: {
                                  backgroundColor: '#ecf0f1',
                              },
                              drawerLabelStyle: {
                                  fontSize: 20,
                              },
                          }}
        >
            <Drawer.Screen name="Home" component={Home} initialParams={{ authenticationData }} />
            <Drawer.Screen name="MyFiles" component={MyFiles}

                           initialParams={{ authenticationData, errorMessage: null, signingData: null }}
                           options={{ title: 'My files' }} />
            <Drawer.Screen name="Notifications" component={Notifications} initialParams={{ authenticationData }} />
        </Drawer.Navigator>
    );
}

//<Drawer.Screen name="Sharing" component={Sharing} initialParams={{ authenticationData }} />


export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="StartScreen">
                <Stack.Screen name="StartScreen" component={StartScreen} />
                <Stack.Screen name="SignIn" component={SignIn} />
                <Stack.Screen name="Verification" component={Verification} />
                <Stack.Screen name="MyFiles" component={MyFiles} />
                <Stack.Screen name="SharedFiles" component={SharedFiles} />
                <Stack.Screen name="MyGroups" component={MyGroups}/>
                <Stack.Screen name="GroupMembers" component={GroupMembers} />
                <Stack.Screen
                    name="Home"
                    component={DrawerNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="FilePreview" component={FilePreview} />
                <Stack.Screen name="ReportProblemScreen" component={ReportProblemScreen} />
            </Stack.Navigator>
            <FlashMessage position="top" />
        </NavigationContainer>
    );
}