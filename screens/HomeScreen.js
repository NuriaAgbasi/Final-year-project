import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged  } from 'firebase/auth';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import Chart from '../components/Chart.js';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.error('No user is signed in.');
        setLoading(false);
        return;
      }
  
      console.log('Fetching real-time data for:', user.email);
      const db = getFirestore();
      const userId = user.uid;
  
      // Real-time listeners
      const friendsUnsub = onSnapshot(collection(db, 'users', userId, 'friends'), (snapshot) => {
        setFriends(snapshot.docs.map(doc => doc.data()));
      });
  
      const workoutsUnsub = onSnapshot(collection(db, 'users', userId, 'workouts'), (snapshot) => {
        setWorkouts(snapshot.docs.map(doc => doc.data()));
      });
  
      const notificationsUnsub = onSnapshot(collection(db, 'users', userId, 'notifications'), (snapshot) => {
        setNotifications(snapshot.docs.map(doc => doc.data()));
      });
  
      setLoading(false);
  
      return () => {
        friendsUnsub();
        workoutsUnsub();
        notificationsUnsub();
        unsubscribeAuth(); // Cleanup authentication listener
      };
    });
  
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#FF6F3C" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FFF</Text>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={28} color="#333" />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#333" style={styles.profileIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Friends List */}
      <Text style={styles.subtitle}>Your FFF's</Text>
      <FlatList
        data={friends}
        horizontal
        keyExtractor={(item) => item.friendId}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image 
              source={{ uri: item.profilePicture || 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg' }} 
              style={styles.friendImage} 
              resizeMode="cover"
            />
            <Text style={styles.friendName}>{item.name || 'Unknown'}</Text>
          </View>
        )}
      />

      {/* Chart */}
      <Chart />

      {/* Workouts List */}
      <Text style={styles.subtitle}>Your Workouts</Text>
      {workouts.length > 0 ? (
        workouts.map((workout, index) => (
          <View key={index} style={styles.workoutItem}>
            <Text style={styles.workoutText}>
              {workout.name} - {workout.date ? new Date(workout.date.seconds * 1000).toLocaleDateString() : 'No date available'}
            </Text>
            <Text>{workout.duration} minutes | Intensity: {workout.intensity}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noWorkoutsText}>No workouts available.</Text>
      )}

      {/* Notifications */}
      <Text style={styles.subtitle}>Notifications</Text>
      {notifications.length > 0 ? (
        notifications.map((notif, index) => (
          <View key={index} style={styles.notificationContainer}>
            <Text style={styles.notificationText}>{notif.message}</Text>
            <Text style={styles.notificationDate}>
              {notif.date ? new Date(notif.date.seconds * 1000).toLocaleDateString() : 'No date available'}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noNotificationsText}>No notifications available.</Text>
      )}

      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Create a Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAF2DA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  iconContainer: { flexDirection: 'row' },
  profileIcon: { marginLeft: 15 },
  subtitle: { marginTop: 20, fontSize: 20, color: '#333' },
  friendItem: { alignItems: 'center', marginHorizontal: 10 },
  friendImage: { width: 60, height: 60, borderRadius: 30 },
  friendName: { marginTop: 5, fontSize: 14, color: '#333' },
  workoutItem: { padding: 10, backgroundColor: '#FFD700', marginTop: 5, borderRadius: 10 },
  workoutText: { fontSize: 16, fontWeight: 'bold' },
  noWorkoutsText: { marginTop: 10, fontSize: 16, color: '#888' },
  notificationContainer: { marginTop: 10, backgroundColor: '#FF6F3C', padding: 10, borderRadius: 10 },
  notificationText: { fontSize: 14, color: '#FFF' },
  notificationDate: { fontSize: 12, color: '#FFF', marginTop: 5 },
  noNotificationsText: { marginTop: 10, fontSize: 16, color: '#888' },
  createButton: { backgroundColor: '#FF6F3C', padding: 15, borderRadius: 25, alignItems: 'center', marginVertical: 20 },
  createButtonText: { color: '#FFF', fontSize: 18 },
});
