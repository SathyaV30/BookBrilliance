import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from './GlobalStyles';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';


export default function Register({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {login} = useContext(AuthContext);


  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.130:4000/register', {
        username,
        password,
        email,
      });
      
      const { data } = response;
      
      if (data.message === "User registered and logged in successfully") {
        // Registration was successful
        const { token } = data;
        login(token);

        // Navigate to the dashboard
        navigation.navigate('Dashboard');

      } else {
        // Handle the error based on your backend response structure
        alert('Registration failed! Please try again.');
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error registering. Please try again later.');
    }
};

  return (
    <View style={styles.container}>
      <MaskedView
        style={styles.maskedContainer}
        maskElement={
          <Text style={[styles.headerText, { opacity: 1 }]}>
            Welcome!
          </Text>
        }>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
          style={styles.gradientStyle}>
          <Text style={[styles.headerText, { opacity: 0 }]}>
            Welcome!
          </Text>
        </LinearGradient>
      </MaskedView>

      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={24} color="grey" style={styles.inputIcon} />
        <TextInput 
          placeholder="Username" 
          value={username} 
          onChangeText={setUsername} 
          style={styles.inputField}
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={24} color="grey" style={styles.inputIcon} />
        <TextInput 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          style={styles.inputField}
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={24} color="grey" style={styles.inputIcon} />
        <TextInput 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          style={styles.inputField}
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={24} color="grey" style={styles.inputIcon} />
        <TextInput 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry 
          style={styles.inputField}
        />
      </View>

      <TouchableOpacity onPress={handleRegister}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
          style={styles.gradientButton}>
          <Text style={styles.buttonText}>Register</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#d3d3d3'
  },
  gradientStyle: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 50,
    textAlign: 'center'
  },
  maskedContainer: {
    flexDirection: 'row',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 2
  },
  inputField: {
    flex: 1,
    height: 60,
    borderColor: '#B9B9B9',
    borderWidth: 1,
    paddingHorizontal: 45,
    borderRadius: 5,
    fontSize: 18,
    backgroundColor: '#FFFFFF'
  },
  gradientButton: {
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    color: 'white'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  loginText: {
    color: '#4859b2',
    textDecorationLine: 'underline'
  }
});
