import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from './GlobalStyles';
import Svg, { Circle, Rect } from 'react-native-svg';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import { backendUrl } from '../../config';

export default function Login({ navigation }) {
  const [emailOrUsername, setEmailOrUserName] = useState('');
  const [password, setPassword] = useState('');
  const {login} = useContext(AuthContext)
  const [loading, setLoading] = useState(false);
 

  const handleLogin = async () => {
    setLoading(true);
      try {
          const response = await axios.post(`${backendUrl}/login`, {
              emailOrUsername,
              password
          });
  
          const { token } = response.data;
  
          if (token) {
            setLoading(false);
              login(token);
              navigation.navigate('Dashboard');
          } else {
              alert('Login failed! Please try again.');
          }
      } catch (error) {
          setLoading(false);
          console.error('Error:', error);
          alert('There was an error logging in. Please check your credentials and try again.');
      }

  };
  
  return (
    <View style={styles.container}>
      <MaskedView
        style={styles.maskedContainer}
        maskElement={
          <Text style={[styles.headerText, { opacity: 1 }]}>
            Welcome Back!
          </Text>
        }>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
          style={styles.gradientStyle}>
          <Text style={[styles.headerText, { opacity: 0 }]}>
            Welcome Back!
          </Text>
        </LinearGradient>
      </MaskedView>

      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={24} color="grey" style={styles.inputIcon} />
        <TextInput 
          placeholder="Email or Username" 
          value={emailOrUsername} 
          onChangeText={setEmailOrUserName} 
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

      <TouchableOpacity onPress={handleLogin}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
          style={styles.gradientButton}>
          <Text style={styles.buttonText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>

      <View style ={{margin:5}}>
        {loading && <ActivityIndicator/>}
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
  registerText: {
    color: '#4859b2',
    textDecorationLine: 'underline'
  }
});
