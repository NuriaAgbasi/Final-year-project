import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Make sure to import AsyncStorage

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save the token to AsyncStorage
      const token = await user.getIdToken();
      await AsyncStorage.setItem("token", token);  // Store the token in AsyncStorage
      console.log("Token saved successfully:", token); // Log to verify if it's saved

      if (!user.emailVerified) {
        Alert.alert("Email Not Verified", "Please verify your email before logging in.");
        return;
      }
  
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastLogin = userData.lastLogin;
  
        // Update lastLogin to the current date
        await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
  
        if (!lastLogin) {
          navigation.navigate("HowToUse");
        } else {
          navigation.navigate("HomeTabs");
        }
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#A9A9A9"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A9A9A9"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF2DA',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  loginButton: {
    width: '85%',
    backgroundColor: '#FF6F3C',
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
  forgotPassword: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 25,
    borderColor: '#ddd',
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 10,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
