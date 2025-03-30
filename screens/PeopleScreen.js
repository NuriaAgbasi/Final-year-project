import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Modal, Button, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, Timestamp} from "firebase/firestore";
import { GOOGLE_API_KEY } from '@env'; // ✅ Use Google API Key
import axios from 'axios'; // ✅ Use Axios for API requests

const PeopleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [recommendedPeople, setRecommendedPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null); // Store selected person for the modal
  const [isModalVisible, setIsModalVisible] = useState(false); // Control modal visibility

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        setLoading(false);
        return;
      }
  
      try {
        // Get logged-in user's profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (!userDoc.exists()) {
          console.error("User document does not exist.");
          setLoading(false);
          return;
        }
  
        const userProfile = userDoc.data();
  
        // Fetch logged-in user's friends
        const friendsCollection = collection(db, "users", user.uid, "friends");
        const friendsSnapshot = await getDocs(friendsCollection);
        let friendsList = [];
        friendsSnapshot.forEach(doc => {
          friendsList.push(doc.id);  // Store only friend IDs
        });
  
        // Fetch all other users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        let otherUsers = [];
        usersSnapshot.forEach(doc => {
          if (doc.id !== user.uid && !friendsList.includes(doc.id)) {
            otherUsers.push({
              id: doc.id, // Adding document ID as 'id'
              ...doc.data()
            });
          }
        });
  
        if (otherUsers.length === 0) {
          console.warn("No other users found.");
          setLoading(false);
          return;
        }
  
        // Process AI response as before...
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
          {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are a fitness AI that suggests compatible workout partners based on gym preferences, age, and interests.
                    Given this user: ${JSON.stringify(userProfile)}, suggest 5 gym partners from this list: ${JSON.stringify(otherUsers)}.
                    Reply ONLY with a valid JSON array, with NO extra text or explanations.`
                  }
                ]
              }
            ]
          }
        );
  
        if (!response.data || !response.data.candidates || !response.data.candidates[0].content.parts[0].text) {
          console.error("Invalid AI Response:", response.data);
          setLoading(false);
          return;
        }
  
        let recommendations;
        try {
          const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) {
            console.error("AI response does not contain text:", response.data);
            setLoading(false);
            return;
          }
  
          // Extract JSON array using regex (in case AI wraps it in extra text)
          const jsonMatch = rawText.match(/\[.*\]/s);
          if (jsonMatch) {
            recommendations = JSON.parse(jsonMatch[0]);
          } else {
            console.error("AI response is not a valid JSON array:", rawText);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing AI response:", error);
          setLoading(false);
          return;
        }
  
        // Add fallback matchReason
        recommendations = recommendations.map(item => ({
          ...item,
          matchReason: item.matchReason || "Based on similar gym habits and preferences." // Fallback reason
        }));
  
        setRecommendedPeople(recommendations);
  
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
      setLoading(false);
    };
  
    fetchRecommendations();
  }, []);
  
  // Show modal with the selected person’s profile
  const openModal = (person) => {
    console.log('Selected Person:', person); // Check the data structure here
    setSelectedPerson(person);
    setIsModalVisible(true);
  };
  

  // Close the modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPerson(null);
  };

  // Add the friend to the logged-in user's "friends" subcollection
const addFriend = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("No authenticated user found.");
    return;
  }

  const friend = selectedPerson;

  if (!friend) {
    console.error("No friend selected.");
    Alert.alert('Error', 'No friend selected.');
    return;
  }

  // Ensure all required fields are available, including 'username' as 'name'
  if (!friend.id || !friend.username) {
    console.error("Invalid friend selected. Missing required data.");
    Alert.alert('Error', 'Invalid friend data. Please try again.');
    return;
  }

  const friendRef = doc(db, "users", user.uid, "friends", friend.id); // Create subcollection for friends

  try {
    // Add friend data to the subcollection
    await setDoc(friendRef, {
      friendId: friend.id,
      name: friend.username,  // Use username as the name
      profilePicture: friend.profilePicture || "https://via.placeholder.com/150" // Fallback value for profile picture
    });

    // Add a notification to the 'notifications' subcollection
    const notificationRef = collection(db, "users", user.uid, "notifications");
    await addDoc(notificationRef, {
      type: "friendAdded",
      message: `You are now friends with ${friend.username}!`,
      date: Timestamp.now(),
      read: false,
      friendId: friend.id,
      friendName: friend.username,
    });

    // Remove the added friend from the recommended list
    setRecommendedPeople((prevPeople) =>
      prevPeople.filter((person) => person.id !== friend.id)
    );

    // Show success message
    Alert.alert('Success', `${friend.username} has been added as a friend!`);
    closeModal(); // Close the modal after adding friend
  } catch (error) {
    console.error("Error adding friend:", error);
    Alert.alert('Error', 'There was an issue adding the friend. Please try again later.');
  }
};

  
  

  if (loading) return <ActivityIndicator size="large" color="#FF6B3C" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Gym Buddies</Text>
      <FlatList
        data={recommendedPeople}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
            <Image source={{ uri: item.profilePicture || "https://via.placeholder.com/150" }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.details}>
                <Text style={styles.label}>🏋️ Gym: </Text>
                {item.gymName || "Unknown"}
              </Text>
              <Text style={styles.details}>
                <Text style={styles.label}>🎂 Age: </Text>
                {item.age}
              </Text>
              <Text style={styles.details}>
                <Text style={styles.label}>📖 Bio: </Text>
                {item.bio}
              </Text>
              <Text style={styles.matchReason}>
                {item.matchReason || "✨ Based on similar gym habits and preferences."}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal to show selected person’s full profile */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPerson?.name}</Text>
            <Image source={{ uri: selectedPerson?.profilePicture }} style={styles.modalImage} />
            <Text style={styles.modalDetails}>Age: {selectedPerson?.age}</Text>
            <Text style={styles.modalDetails}>Gym: {selectedPerson?.gymName}</Text>
            <Text style={styles.modalDetails}>Bio: {selectedPerson?.bio}</Text>
            <TouchableOpacity style={styles.addButton} onPress={addFriend}>
              <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAF3E0' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  loader: { flex: 1, justifyContent: 'center' },
  card: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#555' },
  infoContainer: { flex: 1, paddingHorizontal: 10, justifyContent: 'center' },
  label: { fontWeight: '600', color: '#000' },
  matchReason: { fontSize: 14, fontStyle: 'italic', color: '#FF6B3C', marginTop: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  modalImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
  modalDetails: { fontSize: 16, marginVertical: 5 },
  addButton: { backgroundColor: '#FF6B3C', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  closeButton: { marginTop: 10, alignItems: 'center' },
  closeButtonText: { color: '#FF6B3C', fontWeight: 'bold' },
});

export default PeopleScreen;
