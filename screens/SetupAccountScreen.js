import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updateDoc, doc } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';

export default function SetupAccountScreen({ navigation }) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const handleSetupComplete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        age: age,
        gender: gender,
        setupComplete: true,
      });

      Alert.alert("Setup Complete", "Your account is ready!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} />
      <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} />
      <TouchableOpacity style={styles.button} onPress={handleSetupComplete}>
        <Text style={styles.buttonText}>Finish Setup</Text>
      </TouchableOpacity>
    </View>
  );
}
