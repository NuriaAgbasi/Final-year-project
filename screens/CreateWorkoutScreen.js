import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Switch } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp, getDocs, getFirestore, doc, getDoc } from "firebase/firestore";
import * as Notifications from 'expo-notifications';  // Import expo-notifications
import DateTimePicker from '@react-native-community/datetimepicker';  // Import DateTimePicker

const CreateWorkoutScreen = () => {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [workoutTime, setWorkoutTime] = useState(new Date()); // Time to start workout
  const [showTimePicker, setShowTimePicker] = useState(false); // Show/hide time picker
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const friendsRef = collection(db, 'users', user.uid, 'friends');
          const friendsSnapshot = await getDocs(friendsRef);
          const friends = [];
          friendsSnapshot.forEach(doc => {
            friends.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setFriendsList(friends);
        } catch (error) {
          console.error("Error fetching friends:", error);
        }
      }
    };

    fetchFriends();
  }, []);

  const handleCreateWorkout = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      return;
    }
  
    if (!workoutName || !workoutDescription || !workoutDuration || !workoutTime) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
  
    try {
      const userWorkoutRef = collection(db, "users", user.uid, "workouts");
      const newWorkout = {
        name: workoutName,
        description: workoutDescription,
        duration: workoutDuration,
        intensity: "medium",
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        startTime: workoutTime, // Store the workout start time
      };
  
      const workoutDoc = await addDoc(userWorkoutRef, newWorkout);
      console.log('Workout created with ID:', workoutDoc.id);
  
      // Calculate the workout start time in seconds
      const workoutStartTimeInSeconds = workoutTime.getTime() / 1000;
  
      // Send notifications for 30 minutes before, 20 minutes before, and at the workout start time
      selectedFriends.forEach(async (friendId) => {
        // Fetch friend's name from Firestore
        const friendDocRef = doc(db, "users", user.uid, "friends", friendId);
        const friendDoc = await getDoc(friendDocRef);
  
        if (friendDoc.exists()) {
          const friendName = friendDoc.data().name;
  
          // Send notifications for this specific friend
          scheduleNotification({
            name: workoutName,
            description: workoutDescription,
            friendName: friendName,
          }, new Date(workoutStartTimeInSeconds * 1000), friendId, user.uid);
          
          // Add workout to friend's "workouts" subcollection
          const friendWorkoutRef = collection(db, "users", friendId, "workouts");
          await addDoc(friendWorkoutRef, newWorkout);
          console.log(`Workout added to friend ${friendId}'s workouts subcollection`);
        } else {
          console.error(`Friend with ID ${friendId} not found.`);
        }
      });
  
      Alert.alert('Success', 'Workout created and notifications sent!');
      resetForm();
    } catch (error) {
      console.error("Error creating workout:", error);
      Alert.alert('Error', 'There was an issue creating the workout.');
    }
  };
  
  // Modify scheduleNotification to accept friendName and other necessary details
  const scheduleNotification = async (workoutDetails, workoutStartTime, friendId, userUid) => {
    const db = getFirestore();
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission for notifications not granted');
      return;
    }
  
    try {
      // Ensure workoutStartTime is a valid Date object
      workoutStartTime = new Date(workoutStartTime);
  
      // Check if the workoutStartTime is valid
      if (isNaN(workoutStartTime)) {
        throw new Error('Invalid workout start time');
      }
  
      const workoutName = workoutDetails.name;
      const friendName = workoutDetails.friendName;
  
      const now = new Date();
  
      // Send immediate notification when workout is created
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${workoutName} Scheduled!`,
          body: `Your workout "${workoutName}" with ${friendName} is scheduled for ${workoutStartTime.toLocaleString()}`,
        },
        trigger: null,  // Sends it immediately
      });
  
      // Calculate times for 30 minutes before, 20 minutes before, and at the workout start time
      const reminderTimes = [
        { label: "30 Minutes", offset: 30 * 60 * 1000 },
        { label: "20 Minutes", offset: 20 * 60 * 1000 },
        { label: "Starting Now", offset: 0 },
      ];
  
      // Schedule notifications for each reminder time
      for (let { label, offset } of reminderTimes) {
        const notificationTime = new Date(workoutStartTime.getTime() - offset);
  
        // Only schedule if the notification time is in the future
        if (notificationTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${workoutName} ${label}!`,
              body: `Your workout "${workoutName}" with ${friendName} ${label} at ${notificationTime.toLocaleString()}.`,
            },
            trigger: { date: notificationTime },
          });
          console.log(`Scheduled "${label}" notification for ${notificationTime.toLocaleString()}`);
        } else {
          console.log(`Skipped "${label}" notification – time already passed.`);
        }
      }
  
      console.log('Workout notifications scheduled!');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };
  
  
  
  const handleSelectFriend = (friendId) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  const resetForm = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setWorkoutDuration(30);
    setSelectedFriends([]);
    setIsTrackingEnabled(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Workout</Text>
      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />
      <TextInput
        style={styles.input}
        placeholder="Workout Description"
        value={workoutDescription}
        onChangeText={setWorkoutDescription}
      />

      <Text style={styles.label}>Duration (mins)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(workoutDuration)}
        onChangeText={(text) => setWorkoutDuration(Number(text))}
      />

      {/* Workout Start Time Picker */}
      <Text style={styles.label}>Workout Start Time</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.buttonText}>
          {workoutTime.toLocaleString()} {/* Display selected time */}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={workoutTime}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || workoutTime;
            setShowTimePicker(false);
            setWorkoutTime(currentDate); // Set workout time
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Select Friends</Text>
      </TouchableOpacity>

      {selectedFriends.length > 0 && (
        <View style={styles.selectedFriends}>
          <Text>Selected Friends:</Text>
          {selectedFriends.map((friendId) => {
            const friend = friendsList.find(f => f.id === friendId);
            return (
              <Text key={friendId} style={styles.selectedFriend}>{friend?.name}</Text>
            );
          })}
        </View>
      )}

      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Enable Tracking</Text>
        <Switch
          value={isTrackingEnabled}
          onValueChange={setIsTrackingEnabled}
        />
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
        <Text style={styles.createButtonText}>Create Workout</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Friends</Text>
            <FlatList
              data={friendsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendCard,
                    selectedFriends.includes(item.id) && styles.selectedCard
                  ]}
                  onPress={() => handleSelectFriend(item.id)}
                >
                  <Text style={styles.friendName}>{item.name}</Text>
                  {selectedFriends.includes(item.id) && <Text style={styles.selectedText}>Selected</Text>}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
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
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 },
  button: { backgroundColor: '#FF6B3C', padding: 10, borderRadius: 5, marginBottom: 15 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  selectedFriends: { marginVertical: 10 },
  selectedFriend: { fontSize: 16, marginVertical: 5, fontStyle: 'italic' },
  createButton: { backgroundColor: '#FF6B3C', padding: 15, borderRadius: 5 },
  createButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  friendCard: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  selectedCard: { backgroundColor: '#FF6B3C' },
  friendName: { fontSize: 18 },
  selectedText: { color: '#FF6B3C', fontWeight: 'bold' },
  closeButton: { marginTop: 10, alignItems: 'center' },
  closeButtonText: { color: '#FF6B3C', fontWeight: 'bold' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 },
});

export default CreateWorkoutScreen;
