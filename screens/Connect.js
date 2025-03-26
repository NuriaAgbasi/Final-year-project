import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

const API_URL = 'http://10.131.56.29:5000/api';

const ConnectPage = () => {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Function to fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => {
        const userData = doc.data();
        console.log('Fetched user data:', userData); // Log the data to check if the 'name' field exists
        return userData;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
    }
  };

  // AI function (replace with OpenAI or TensorFlow.js if needed)
  const getMatchSuggestionsFromAI = async (user1, user2) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/completions', 
        {
          model: 'gpt-3.5-turbo',
          prompt: `Match user1 with user2 based on these details: user1 (Age: ${user1.age}, School: ${user1.school}, Gym: ${user1.goToGym}), user2 (Age: ${user2.age}, School: ${user2.school}, Gym: ${user2.goToGym}). Provide a score from 0 to 10.`,
          temperature: 0.5,
          max_tokens: 60,
        },
        {
          headers: {
            'Authorization': `Bearer YOUR_API_KEY`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = response.data.choices[0].text.trim();
      return data;
    } catch (error) {
      console.error('Error fetching match suggestions from AI:', error);
      return null;
    }
  };

  // Function to generate match suggestions and scores
  const getMatchSuggestions = async () => {
    const currentUserData = users.find(user => user.userId === userId);
    
    if (!currentUserData) {
      console.error("Current user data not found");
      return;
    }
  
    const matchList = users.filter(user => user.userId !== userId);
    const suggestions = [];
  
    for (const user of matchList) {
      if (!user.age || !user.school || user.goToGym === undefined) {
        console.warn(`Skipping user due to missing data: ${JSON.stringify(user)}`);
        continue;
      }
  
      const matchScore = await getMatchSuggestionsFromAI(currentUserData, user);
      suggestions.push({ ...user, matchScore });
    }
  
    suggestions.sort((a, b) => b.matchScore - a.matchScore);
    setMatches(suggestions);
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && userId) {
      getMatchSuggestions();
    }
  }, [users, userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with People</Text>
      <FlatList
  data={matches}
  renderItem={({ item }) => (
    <View style={styles.matchCard}>
      <Text>{item.name}</Text>  
      <Text>{item.matchScore >= 3 ? 'Great Match!' : 'Low Match'}</Text> {/* Ensure match reason text is also wrapped in Text */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log(`Connect with ${item.userId}`)}
      >
        <Text style={styles.buttonText}>Add</Text> {/* Ensure button text is wrapped */}
      </TouchableOpacity>
    </View>
  )}
  keyExtractor={(item) => item.userId}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FAF3E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchReason: {
    fontSize: 16,
    marginVertical: 5,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#FF6B3C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConnectPage;
