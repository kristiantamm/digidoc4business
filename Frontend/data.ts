import Constants from 'expo-constants';
import { NetworkInfo } from 'react-native-network-info';


const { manifest2 } = Constants;

export const developerMode = false;

export interface AuthenticationIdentity {
    name: string,
    identityNumber: string,
}

export interface SigningResult {
    result: string | null;
    valid: boolean | null;
    timestamp: Date | null;
    containerFilePath: string | null;
}

export interface AuthenticationResponse {
    authenticated: boolean;
    message: string;
    identity: AuthenticationIdentity | null;
}

export interface SigningResponse {
    signed: boolean,
    message: string,
    signingResult: SigningResult | null,
}

export interface FileInFileList {
    id: number;
    name: string;
    uploadedBy: string;
    fileContent: string;
    dateUploaded: string;
}
export enum VerificationType {
    HOME = "HOME",
    MY_FILES = "MY FILES",
    GROUP = "GROUP",
}


//Change this to your local network ip (for development)
const ip = "127.0.0.1"
export const baseURL = `http://${ip}:8064`;
