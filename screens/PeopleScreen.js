import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { GOOGLE_API_KEY } from '@env'; // ✅ Use Google API Key
import axios from 'axios'; // ✅ Use Axios for API requests

const PeopleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [recommendedPeople, setRecommendedPeople] = useState([]);

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
        // ✅ Get logged-in user's profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("User document does not exist.");
          setLoading(false);
          return;
        }

        const userProfile = userDoc.data();

        // ✅ Fetch all other users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        let otherUsers = [];
        usersSnapshot.forEach(doc => {
          if (doc.id !== user.uid) otherUsers.push(doc.data());
        });

        if (otherUsers.length === 0) {
          console.warn("No other users found.");
          setLoading(false);
          return;
        }

        // ✅ Correct Gemini API Endpoint
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
        

        console.log("AI Response:", response.data);

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


        setRecommendedPeople(recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }

      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#FF6B3C" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Gym Buddies</Text>
      <FlatList
        data={recommendedPeople}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.profilePicture || "https://via.placeholder.com/150" }} style={styles.image} />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.details}>Gym: {item.gymName || "Unknown"}</Text>
              <Text style={styles.details}>Age: {item.age}</Text>
              <Text style={styles.details}>Bio: {item.bio}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
});

export default PeopleScreen;
