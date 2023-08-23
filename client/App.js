import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Main from './App/Pages/Main';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './App/Pages/Register'; 
import Login from './App/Pages/Login';       
import { AuthProvider, AuthContext } from './AuthContext';
import Dashboard from './App/Pages/Dashboard';
import { useContext } from 'react';
import Toast from 'react-native-toast-message';
import SubjectStack from './App/Pages/SubjectStack';
import Library from './App/Pages/Library';
import UserProfile from './App/Pages/Profile';
import Reading from './App/Pages/Reading';
import libraryPic from './App/Pages/Images/library.jpg'
import { Image } from 'react-native';

const Stack = createStackNavigator();

function AppNavigation() {
    const { isAuthenticated } = useContext(AuthContext);
    
    
    return (
        <NavigationContainer>
           <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff', 
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
                { 
                  isAuthenticated 
                  ? (
                      <>
                          <Stack.Screen name="Dashboard" component={Dashboard} options={{headerShown: false}} />
                          <Stack.Screen 
                            name="SubjectScreen" 
                            component={SubjectStack} 
                            options={({ route }) => ({ title: route.params.subject })}
                        />
                        <Stack.Screen
                            name="Library"
                            component={Library}
                        />
                        <Stack.Screen
                        name="Profile"
                        component={UserProfile}
                        />
                        <Stack.Screen
                        name="Reading"
                        component={Reading}
                        />
                            
                      

                      </>
                  )
                  : (
                      <>
                          <Stack.Screen name="Back" component={Main} options={{headerShown: false}} />
                          <Stack.Screen name="Register" component={Register} />
                          <Stack.Screen name="Login" component={Login} />
                      </>
                  ) 
                }
            </Stack.Navigator>

        </NavigationContainer>
    );
}



export default function App() {

Image.prefetch(libraryPic);
    return (
        <><AuthProvider>
            <AppNavigation />
        </AuthProvider>
        <Toast style ={{zIndex:'999999'}}/>

        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
