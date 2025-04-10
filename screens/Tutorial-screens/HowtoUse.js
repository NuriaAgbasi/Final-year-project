import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const HowToUse = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>WELCOME NEW USER!</Text>
      <Text style={styles.subText}>Let's show you how to use this app</Text>

      {/* <Image 
        source={require('../../assets/quote.gif')}
        style={styles.quoteGif} 
        resizeMode="contain"
      /> */}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProfileSetup')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Skip to Home Option */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')}> 
        <Text style={styles.skipText}>Not a new user? Skip to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1', // Light beige background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  quoteGif: {
    width: 300, // Adjust width to fit screen
    height: 150, // Adjust height as needed
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF7F50', // Orange button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10, // Space between button and skip text
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  skipText: {
    fontSize: 14,
    color: '#777',
    textDecorationLine: 'underline',
  },
});

export default HowToUse;
