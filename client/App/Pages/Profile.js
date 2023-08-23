import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Button } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { backendUrl } from '../../config';


function UserProfile() {
    const [bio, setBio] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const {userToken, logout} = useContext(AuthContext);

 

    const handleSave = async () => {
        try {
            const response = await axios.post(`${backendUrl}/saveUserDetails`, {
                name,
                username,
                email,
                bio,
             
            }, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.data.success) {
                alert('Profile saved')
            } else {
                console.error("Failed to save user details:", response.data.message);
            }
        } catch (error) {
            alert('Server error')
            console.error("Error saving user details:", error);
        }
    }

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${backendUrl}/userDetails`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (response.data.success && response.data.data) {
                const { name, username, email, bio } = response.data.data;
                setName(name || '');
                setUsername(username || '');
                setEmail(email || '');
                setBio(bio || '');
            } else {
                console.error("Failed to fetch user details:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1 , y: 1 }}
        colors={['#5A5A5A', '#FFFFFF']}
        style={styles.container}>
       
            <Text style={styles.label}>Name:</Text>
            <TextInput 
                style={styles.editableInfo} 
                value={name} 
                onChangeText={setName}
            />

            <Text style={styles.label}>Username:</Text>
            <TextInput 
                style={styles.editableInfo} 
                value={username} 
                onChangeText={setUsername}
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput 
                style={styles.editableInfo} 
                value={email} 
                onChangeText={setEmail}
            />

            <Text style={styles.label}>Bio/Description:</Text>
            <TextInput
                style={styles.bioInput}
                multiline={true}
                value={bio}
                onChangeText={setBio}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <FontAwesome name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}> Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={logout}>
                <FontAwesome name="sign-out" size={20} color="white" />
                <Text style={styles.saveButtonText}> Logout</Text>
            </TouchableOpacity>

        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5'
    },

    label: {
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5
    },
    info: {
        fontSize: 16,
        marginBottom: 10
    },
    bioInput: {
        height: 80,
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
        fontSize: 16
    },
    editableInfo: {
        fontSize: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: 5,
        padding: 5,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        padding: 10,
        marginTop: 20,
        borderRadius: 5,
    },
    saveButtonText: {
        color: 'white',
        marginLeft: 10,
    }
});

export default UserProfile;
