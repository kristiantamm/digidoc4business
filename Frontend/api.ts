import axios from 'axios';
import { baseURL } from './data';

export const fetchUserGroups = async (userId: string) => {
    try {
        const response = await axios.get(`${baseURL}/groups/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user groups:", error);
        throw error;
    }
};
 