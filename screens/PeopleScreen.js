import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { auth, db } from "../firebaseConfig";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const PeopleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const q = collection(db, "users");
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map((doc) => {
        const userData = doc.data();
        if (typeof userData.goToGym === "string") {
          userData.goToGym = userData.goToGym.toLowerCase() === "true";
        }
        // Handle Firestore Timestamp fields like 'createdAt' and 'lastLogin'
        if (userData.createdAt instanceof Date) {
          userData.createdAt = userData.createdAt.toDate();
        }
        if (userData.lastLogin instanceof Date) {
          userData.lastLogin = userData.lastLogin.toDate();
        }
        return userData;
      });
      console.log("Fetched users from Firestore:", userList);
      setUsers(userList);
      setLoading(false);
      
      // Automatically fetch recommendations after users are loaded
      handleRecommendation();
    };
    

    fetchUsers();
  }, []);

  const handleRecommendation = async () => {
    console.log("Recommendation button clicked.");
  
    if (!auth.currentUser) {
      Alert.alert("Error", "Please log in to get recommendations");
      return;
    }
  
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();  
      console.log("Authorization token obtained");
  
      // Make API request with the Firebase ID token
      const response = await fetch('http://10.131.56.29:5000/api/recommended', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      const responseData = await response.json();
      console.log("Response data:", responseData);
  
      if (response.ok) {
        if (Array.isArray(responseData) && responseData.length > 0) {
          setRecommendedUsers(responseData);
        } else {
          Alert.alert("No Matches", "No recommendations found based on your preferences");
        }
      } else {
        Alert.alert("Error", responseData.error || "Failed to fetch recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      Alert.alert("Error", "Failed to fetch recommendations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Friendship Recommendations</Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FF6B3C" />
        </View>
      ) : (
        <>
          {recommendedUsers.length > 0 ? (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.sectionTitle}>Recommended Workout Partners</Text>
              
              {recommendedUsers.map((user, index) => (
                <View key={index} style={styles.card}>
                  <View style={styles.infoContainer}>
                    <Text style={styles.name}>{user.username}</Text>
                    <Text style={styles.details}>Age: {user.age || 'N/A'}</Text>
                    <Text style={styles.details}>Gym: {user.gymName || 'N/A'}</Text>
                    {user.school && <Text style={styles.details}>School: {user.school}</Text>}
                    {user.bio && <Text style={styles.details}>Bio: {user.bio}</Text>}
                    {user.reason && (
                      <View style={styles.reasonContainer}>
                        <Text style={styles.reasonTitle}>Why you might connect:</Text>
                        <Text style={styles.reasonText}>{user.reason}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noRecommendationsContainer}>
              <Text style={styles.noRecommendationsText}>Loading recommendations...</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#FAF3E0" 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  loader: { 
    flex: 1, 
    justifyContent: "center",
    height: 200
  },
  recommendationsContainer: {
    marginTop: 20
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  reasonContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B3C",
    marginBottom: 3,
  },
  reasonText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  noRecommendationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200
  },
  noRecommendationsText: {
    fontSize: 18,
    color: "#666"
  }
});

export default PeopleScreen;
