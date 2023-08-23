
// IOS 513993015987-6htfa6rul6r5nfp3g5mlk7du1bcumdhm.apps.googleusercontent.com
// Andriod 513993015987-ghpb75868dsh4vuks4edlag8rk2sojgl.apps.googleusercontent.com
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { globalStyles } from './GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GoogleSvg from './Images/Google.js';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

const  width  = Dimensions.get('window').width;
const buttonWidth = width * 0.85; // 85% of screen width
const deviceHeight = Dimensions.get('window').height;

const responsiveHeight = (value) => (deviceHeight / 926) * value;
const buttonHeight = responsiveHeight(50);

export default function Main({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '513993015987-ghpb75868dsh4vuks4edlag8rk2sojgl.apps.googleusercontent.com',
    iosClientId: '513993015987-6htfa6rul6r5nfp3g5mlk7du1bcumdhm.apps.googleusercontent.com',
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    
    <View style={styles.container}>
      <Image
        source={require('./Images/BookMain.png')}
        resizeMode="cover"
        style={styles.headerImage}
      />
      <View style={styles.mainContentView}>
        <View style={styles.topContainer}>
          <MaskedView
            style={{ flexDirection: 'row', height: 'auto' }}
            maskElement={
              <Text style={[styles.headerText, { opacity: 1 }]}>
                Welcome to BookBrilliance!
              </Text>
            }>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
              style={{ padding: 10 }}>
              <Text style={[styles.headerText, { opacity: 0 }]}>
                Welcome to BookBrilliance!
              </Text>
            </LinearGradient>
          </MaskedView>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
              style={styles.buttons}>
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              colors={[globalStyles.COLORS_PRIMARY, globalStyles.COLORS_SECONDARY]}
              style={styles.buttons}>
              <Text style={styles.buttonText}>Register</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>Or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity onPress={handleGoogleLogin}>
            <View style={[styles.buttons, styles.googleButton]}>
              <GoogleSvg width={45} height={30} style ={{margin:0, padding:0}} />
              <Text style={[styles.buttonText, styles.googleText]}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { /* Apple Auth Logic Here */ }}>
            <View style={[styles.buttons, styles.appleButton]}>
              <Icon name="apple" size={25} color="#FFF9E9" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Continue with Apple</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
  },
  topContainer: {
    paddingTop: 40,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    marginTop: -20,
    width: '100%',
    backgroundColor: '#d3d3d3',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: responsiveHeight(300), 
  },
  headerText: {
    marginTop: responsiveHeight(70),
    marginBottom: responsiveHeight(20), 
    fontSize: responsiveHeight(32.5), 
    textAlign: 'center',
  },
  mainContentView: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    borderRadius: 8,
    height: buttonHeight, 
    padding: 10,
    margin: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: buttonWidth,
},

  buttonText: {
    color: '#FFF9E9',
    fontSize: 20, 
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: buttonWidth,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'gray',
  },
  separatorText: {
    marginLeft: 10,
    marginRight: 10,
  },
  googleButton: {
    backgroundColor: 'gray',
  },
  googleText: {
    marginLeft: 0,
    color: '#FFF9E9',
  },
  appleButton: {
    backgroundColor: '#000',
  },

});


