import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Text, TextInput, TouchableOpacity, View} from 'react-native';
import axios from 'axios';
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {RootStackParamList} from "../App";
import {baseURL, FileInFileList, VerificationType} from "../data";
import styles from "../styles";
import Icon from 'react-native-vector-icons/FontAwesome';
import {StackNavigationProp} from "@react-navigation/stack";
import {deleteFile, downloadFile, signFile} from '../utils/fileOperations';

type MyFilesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyFiles'>;
type MyFilesScreenRouteProp = RouteProp<RootStackParamList, 'MyFiles'>;

export default function MyFiles() {

    const navigation = useNavigation<MyFilesScreenNavigationProp>();
    const route = useRoute<MyFilesScreenRouteProp>();
    const authenticationData = route.params.authenticationData;
    const errorMessage = route.params.errorMessage;

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState([]);


    const loadMyFiles = async () => {
        if (!authenticationData.identity || !authenticationData.identity.identityNumber) {
            alert('Personal ID not available.');
            return;
        }

        const userId = authenticationData.identity.identityNumber;
        setLoading(true);

        try {
            const response = await axios.get(`${baseURL}/files/filesForUser`, {
                params: { userId },
            });

            if (response.status === 200) {
                console.log(response.data)
                setFiles(response.data);
            } else {
                alert(`Failed to fetch files: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('An error occurred while fetching files.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId: number, fileName: string) => {
        await deleteFile(fileId, fileName, loadMyFiles);
    };

    const handleSign = async (fileIds: number[]) => {
        await signFile(fileIds, authenticationData.identity.identityNumber, navigation, authenticationData, VerificationType.MY_FILES);
    };

    const bulkSignFiles = () => {
        handleSign(selectedFiles).then(r => setSelectedFiles([]));
    };

    const toggleFileSelection = (fileId) => {
        setSelectedFiles((prevSelected) =>
            prevSelected.includes(fileId)
                ? prevSelected.filter((id) => id !== fileId)
                : [...prevSelected, fileId]
        );
    }

    const filteredFiles = files.filter(file =>
        file.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    ).sort((a, b) => {
        const isAAsice = a.name?.toLowerCase().endsWith('.asice') ? 1 : 0;
        const isBAsice = b.name?.toLowerCase().endsWith('.asice') ? 1 : 0;
        return isBAsice - isAAsice;
    });

    useEffect(() => {
        loadMyFiles().then(() => console.log("List refreshed"))
        if (errorMessage != null) {
            Alert.alert("Error", errorMessage)
        }
    }, [route.params, errorMessage]);

    function shortenFileName(name: string) {
        if (name.split(".")[0].length < 20){
            return name;
        } else {
            const extension = name.split(".")[1];
            const beginning = name.substring(0,20);
            return beginning + "[...]." + extension
        }
    }

    function isAsice(name: string) {
        return name.split('.').pop() === 'asice'
    }

    return (
        <>
            {authenticationData.identity && (
                <>

                    <View style={styles.container}>

                        <Text style={styles.label}>List of your files:</Text>

                        <View style={styles.search}>
                            {!searchVisible && (
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => setSearchVisible(!searchVisible)}
                                >
                                    <Icon name="search" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}

                            {searchVisible && (
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onBlur={() => setSearchVisible(false)}
                                />
                            )}
                        </View>

                        {loading && <Text>Loading...</Text>}


                        <FlatList
                            data={filteredFiles}
                            keyExtractor={(item, index) => `${item.fileName}-${index}`}
                            renderItem={({ item }: { item: FileInFileList }) => (
                                <TouchableOpacity
                                    style={{
                                        ...styles.fileItem,
                                        backgroundColor: isAsice(item.name) ? 'rgba(0,182,171,0.08)' : '#ececec',
                                    }}
                                    onPress={() => {
                                        navigation.navigate('FilePreview', { file: item, authenticationData: authenticationData })
                                }}
                                >
                                    <View style={styles.checkboxContainer}>
                                        {!isAsice(item.name) && (<TouchableOpacity
                                            style={[
                                                styles.checkbox,
                                                selectedFiles.includes(item.id) && styles.checkboxSelected,
                                            ]}
                                            onPress={() => toggleFileSelection(item.id)}
                                        />)}
                                        <Text style={styles.fileName}>{shortenFileName(item.name)}</Text>
                                    </View>
                                    <View style={styles.buttonsContainer}>
                                        <TouchableOpacity style={styles.button} onPress={() => handleSign([item.id])}>
                                            <Icon name="pencil" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(item.name, item.fileContent)}>
                                            <Icon name="download" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
                                            <Icon name="trash" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                        {selectedFiles.length > 0 && (
                            <TouchableOpacity style={{ width: '80%' }} onPress={bulkSignFiles}>
                                <Text style={styles.confirmButton}>Sign Selected Files</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                </>
            )}
        </>
    );
};
