import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import Chart from '../components/Chart.js';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreWorkouts, setShowMoreWorkouts] = useState(false);
  const [showMoreNotifications, setShowMoreNotifications] = useState(false);

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
      
      const friendsUnsub = onSnapshot(collection(db, 'users', userId, 'friends'), (snapshot) => {
        setFriends(snapshot.docs.map(doc => doc.data()));
      });
      
      const workoutsUnsub = onSnapshot(collection(db, 'users', userId, 'workouts'), (snapshot) => {
        const sortedWorkouts = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.date?.seconds - a.date?.seconds);
        setWorkouts(sortedWorkouts);
      });
      
      const notificationsUnsub = onSnapshot(collection(db, 'users', userId, 'notifications'), (snapshot) => {
        const sortedNotifications = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.date?.seconds - a.date?.seconds);
        setNotifications(sortedNotifications);
      });
      
      setLoading(false);
      
      return () => {
        friendsUnsub();
        workoutsUnsub();
        notificationsUnsub();
        unsubscribeAuth();
      };
    });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#FF6F3C" style={styles.loader} />;
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
      
      <Text style={styles.subtitle}>Your FFF's</Text>
      <FlatList
        data={friends}
        horizontal
        keyExtractor={(item) => item.friendId}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            {/* <Image 
              source={{ uri: item.profilePicture || 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg' }} 
              style={styles.friendImage} 
              resizeMode="cover"
            /> */}
            <Text style={styles.friendName}>{item.name || 'Unknown'}</Text>
          </View>
        )}
      />
      
      <Chart />
      
      <Text style={styles.subtitle}>Your Workouts</Text>
      {workouts.slice(0, showMoreWorkouts ? workouts.length : 4).map((workout, index) => (
        <View key={index} style={styles.workoutItem}>
          <Text style={styles.workoutText}>{workout.name} - {new Date(workout.startTime?.seconds * 1000).toLocaleDateString()}</Text>
          <Text>{workout.duration} minutes | Intensity: {workout.intensity}</Text>
        </View>
      ))}
      {workouts.length > 4 && (
        <TouchableOpacity onPress={() => setShowMoreWorkouts(!showMoreWorkouts)}>
          <Text style={styles.showMoreText}>{showMoreWorkouts ? 'Show Less' : 'Show More'}</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.subtitle}>Notifications</Text>
      {notifications.slice(0, showMoreNotifications ? notifications.length : 4).map((notif, index) => (
        <View key={index} style={styles.notificationContainer}>
          <Text style={styles.notificationText}>{notif.message}</Text>
          <Text style={styles.notificationDate}>{new Date(notif.startTime?.seconds * 1000).toLocaleDateString()}</Text>
        </View>
      ))}
      {notifications.length > 4 && (
        <TouchableOpacity onPress={() => setShowMoreNotifications(!showMoreNotifications)}>
          <Text style={styles.showMoreText}>{showMoreNotifications ? 'Show Less' : 'Show More'}</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Create a Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAF2DA' },
  loader: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  iconContainer: { flexDirection: 'row' },
  profileIcon: { marginLeft: 15 },
  subtitle: { marginTop: 20, fontSize: 20, color: '#333' },
  friendItem: { alignItems: 'center', marginHorizontal: 10 },
  friendImage: { width: 50, height: 50, borderRadius: 25 },
  friendName: { marginTop: 5, fontSize: 14, color: '#333' },
  workoutItem: { padding: 12, backgroundColor: '#FFD700', marginTop: 5, borderRadius: 12 },
  workoutText: { fontSize: 16, fontWeight: 'bold' },
  showMoreText: { color: '#FF6F3C', textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
  notificationContainer: { marginTop: 10, backgroundColor: '#FF6F3C', padding: 12, borderRadius: 12 },
  notificationText: { fontSize: 14, color: '#FFF' },
  notificationDate: { fontSize: 12, color: '#FFF', marginTop: 5 },
  createButton: { backgroundColor: '#FF6F3C', padding: 15, borderRadius: 25, alignItems: 'center', marginVertical: 20 },
  createButtonText: { color: '#FFF', fontSize: 18 },
});
