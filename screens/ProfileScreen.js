import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
import { fetch } from 'expo/fetch';

const API_URL = 'http://10.131.56.29:8081/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    age: "",
    school: "",
    goToGym: "",
    gymName: "",
    bio: "",
  });  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Check if the token exists in AsyncStorage
  const checkToken = async () => {
    const token = await AsyncStorage.getItem("token");
    console.log("Stored Token:", token);  // Log the token to verify if it's being saved
    return token;
  };

  // Fetch user profile from the backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await checkToken();  // Get token from storage
      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // Update profile in the backend
  const updateProfile = async () => {
    try {
      const token = await checkToken();
      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      await axios.post(
        `${API_URL}/profile`,  // Correct URL for update
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Profile updated!");
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="blue" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Age:</Text>
      <TextInput
        style={styles.input}
        value={profile.age.toString()}
        editable={editing}
        onChangeText={(text) => setProfile({ ...profile, age: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>School:</Text>
      <TextInput
        style={styles.input}
        value={profile.school}
        editable={editing}
        onChangeText={(text) => setProfile({ ...profile, school: text })}
      />

      <Text style={styles.label}>Do you go to the gym?</Text>
      <TextInput
        style={styles.input}
        value={profile.goToGym.toString()}
        editable={editing}
        onChangeText={(text) => setProfile({ ...profile, goToGym: text })}
      />
      <Text style={styles.label}>Bio:</Text>
        <TextInput
          style={styles.input}
          value={profile.bio}
          editable={editing}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          multiline
        />


      <Text style={styles.label}>Gym Name:</Text>
      <TextInput
        style={styles.input}
        value={profile.gymName}
        editable={editing}
        onChangeText={(text) => setProfile({ ...profile, gymName: text })}
      />

      {editing ? (
        <Button title="Save Profile" onPress={updateProfile} />
      ) : (
        <Button title="Edit Profile" onPress={() => setEditing(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
});

export default ProfilePage;
