import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native'; // Import the hook
import CustomButton from '../components/Button'; 

const OnboardingScreen = () => {
  const navigation = useNavigation(); // Initialize navigation

  // Handler functions for button presses
  const handleRegister = () => {
    navigation.navigate('SignUp');  // Navigate to SignUp screen
  };

  const handleLogin = () => {
    navigation.navigate('Login');  // Navigate to Login screen
  };

  const handleSignIn = () => {
    navigation.navigate('GoogleLogin');
  };  

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../assets/cute-working-out.gif')}
        style={styles.image}
        contentFit="contain"
      /> */}
      <Text style={styles.title}>WELCOME TO FFF</Text>
      <Text style={styles.subtitle}>Your fitness friend found</Text>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="SignUp"
          style={styles.registerButton}
          textStyle={styles.registerText}
          onPress={handleRegister} // Trigger register navigation
        />
        <CustomButton
          title="Login"
          style={styles.loginButton}
          textStyle={styles.loginText}
          onPress={handleLogin} // Trigger login navigation
        />
        <CustomButton
          title="Login with Google"
          style={styles.googleButton}
          textStyle={styles.googleText}
          onPress={handleSignIn} // Trigger sign-in navigation
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF2DA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#000',
  },
  loginButton: {
    backgroundColor: '#FF6F3C',
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  registerText: {
    color: '#000',
  },
  loginText: {
    color: '#FFF',
  },
  googleText: {
    color: '#000',
    marginLeft: 8,
  },
});

export default OnboardingScreen;
