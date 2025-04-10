import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Modal, TouchableOpacity, Pressable } from "react-native";
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp, writeBatch, getDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const PeopleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addingBuddy, setAddingBuddy] = useState(false);
  const navigation = useNavigation();

  // Refresh recommendations when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, refreshing recommendations");
      fetchRecommendedUsers();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Set up listeners for real-time updates
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Listen for changes to the user's friend list
    const unsubscribeFriends = onSnapshot(
      collection(db, "users", currentUser.uid, "friends"),
      (snapshot) => {
        console.log("Friends collection changed, refreshing recommendations");
        fetchRecommendedUsers();
      },
      (error) => {
        console.error("Error listening to friends collection:", error);
      }
    );

    // Listen for changes to the user's own profile
    const unsubscribeProfile = onSnapshot(
      doc(db, "users", currentUser.uid),
      (snapshot) => {
        console.log("User profile changed, refreshing recommendations");
        fetchRecommendedUsers();
      },
      (error) => {
        console.error("Error listening to user profile:", error);
      }
    );

    // Clean up listeners when component unmounts
    return () => {
      unsubscribeFriends();
      unsubscribeProfile();
    };
  }, []);

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
        if (Array.isArray(responseData)) {
          setRecommendedUsers(responseData);
          if (responseData.length === 0) {
            console.log("No recommendations available");
          }
        } else {
          console.error("Invalid response format:", responseData);
          Alert.alert("Error", "Invalid response format from server");
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

  const openUserModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const addBuddy = async (user) => {
    try {
      setAddingBuddy(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser?.uid) {
        throw new Error('You must be logged in to add friends');
      }
      
      // Get or generate a user ID for the friend
      let friendId = user.userId;
      if (!friendId) {
        // If no userId exists, check if we have email
        if (!user.email) {
          throw new Error('Cannot add user - missing identification');
        }
        // Look up user by email to get their ID
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('User not found in system');
        }
        
        friendId = querySnapshot.docs[0].id;
      }
      
      // Get current user's data
      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const currentUserData = currentUserDoc.data();
      
      // Prepare friend data
      const currentUserFriendData = {
        userId: currentUser.uid,
        name: currentUser.displayName || currentUser.email.split('@')[0] || 'You',
        addedAt: serverTimestamp(),
        gym: currentUserData?.gym || null
      };
      
      const newFriendData = {
        userId: friendId,
        name: user.username || 'New Friend',
        addedAt: serverTimestamp(),
        gym: user.gymName || null
      };
      
      // Batch write to ensure atomic operation
      const batch = writeBatch(db);
      
      // Add friend to current user's list
      batch.set(
        doc(db, 'users', currentUser.uid, 'friends', friendId),
        newFriendData
      );
      
      // Add current user to friend's list
      batch.set(
        doc(db, 'users', friendId, 'friends', currentUser.uid),
        currentUserFriendData
      );
      
      await batch.commit();
      Alert.alert('Success', `You and ${newFriendData.name} are now buddies!`);
      fetchRecommendedUsers();
      
    } catch (error) {
      console.error('Add friend error:', error);
      Alert.alert('Error', error.message || 'Failed to add friend');
    } finally {
      setAddingBuddy(false);
      setModalVisible(false);
    }
  };

  const fetchRecommendedUsers = async () => {
    console.log("Fetching recommended users...");

    if (!auth.currentUser) {
      console.log("User not logged in, skipping recommendations fetch");
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      console.log("Authorization token obtained");

      // Get current friends list first
      const friendsRef = collection(db, 'users', auth.currentUser.uid, 'friends');
      const friendsSnapshot = await getDocs(friendsRef);
      const friendIds = friendsSnapshot.docs.map(doc => doc.id);

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
        if (Array.isArray(responseData)) {
          // Filter out already added friends
          const filteredRecommendations = responseData.filter(
            user => !friendIds.includes(user.userId)
          );
          
          // Prioritize same gym members
          const sameGymRecommendations = filteredRecommendations.filter(
            user => user.gymName === auth.currentUser.gym
          );
          
          const otherRecommendations = filteredRecommendations.filter(
            user => user.gymName !== auth.currentUser.gym
          );
          
          // Combine with same gym first
          setRecommendedUsers([
            ...sameGymRecommendations,
            ...otherRecommendations
          ]);
        }
      } else {
        Alert.alert("Error", responseData.error || "Failed to get recommendations");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      Alert.alert("Error", "Failed to get recommendations");
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
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => openUserModal(user)}
                >
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
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noRecommendationsContainer}>
              <Text style={styles.noRecommendationsText}>No recommendations available</Text>
            </View>
          )}

          {/* User Details Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {selectedUser && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{selectedUser.username}</Text>
                      <TouchableOpacity
                        style={styles.closeModalButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.closeModalButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Age:</Text>
                        <Text style={styles.modalInfoValue}>{selectedUser.age || 'N/A'}</Text>
                      </View>

                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Gym:</Text>
                        <Text style={styles.modalInfoValue}>{selectedUser.gymName || 'N/A'}</Text>
                      </View>

                      {selectedUser.bio && (
                        <View style={styles.modalBioContainer}>
                          <Text style={styles.modalInfoLabel}>Bio:</Text>
                          <Text style={styles.modalBioText}>{selectedUser.bio}</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.addBuddyButton}
                      onPress={() => addBuddy(selectedUser)}
                      disabled={addingBuddy}
                    >
                      {addingBuddy ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.addBuddyButtonText}>Add Buddy</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>
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
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden"
  },
  modalHeader: {
    backgroundColor: "#FF6B3C",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white"
  },
  closeModalButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  closeModalButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold"
  },
  modalContent: {
    padding: 20
  },
  modalInfoItem: {
    flexDirection: "row",
    marginBottom: 12
  },
  modalInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    width: 50
  },
  modalInfoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1
  },
  modalBioContainer: {
    marginTop: 5
  },
  modalBioText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
    lineHeight: 22
  },
  addBuddyButton: {
    backgroundColor: "#FF6B3C",
    padding: 15,
    alignItems: "center",
    marginTop: 10
  },
  addBuddyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
});

export default PeopleScreen;
