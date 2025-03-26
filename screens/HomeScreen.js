import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import Chart from '../components/Chart.js';
import BottomNavBar from '../components/BottomNavBar.js';

const API_URL = 'http://10.131.56.29:5000/api';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [getAuth().currentUser]);

  const fetchData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is currently signed in.');
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch data from multiple endpoints
      const [profileRes, friendsRes, workoutsRes, notificationsRes] = await Promise.all([
        fetch(`${API_URL}/profile`, { headers }),
        fetch(`${API_URL}/friends`, { headers }),
        fetch(`${API_URL}/workouts`, { headers }),
        fetch(`${API_URL}/notifications`, { headers }),
      ]);

      // Check for unauthorized responses
      if (!profileRes.ok || !friendsRes.ok || !workoutsRes.ok || !notificationsRes.ok) {
        throw new Error('Error fetching data: Unauthorized or API error');
      }

      const profileData = await profileRes.json();
      const friendsData = await friendsRes.json();
      const workoutsData = await workoutsRes.json();
      const notificationsData = await notificationsRes.json();

      setProfile(profileData);
      setFriends(friendsData);

      // Check if workouts data is an array
      if (Array.isArray(workoutsData)) {
        setWorkouts(workoutsData);
      } else {
        console.error('Workouts data is not an array:', workoutsData);
        setWorkouts([]); // Fallback to empty array if it's not an array
      }

      // Ensure notifications is an array before calling map
      if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
      } else {
        console.error('Notifications data is not an array:', notificationsData);
        setNotifications([]); // Fallback to empty array if it's not an array
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* User Info */}
      {profile && <Text style={styles.subtitle}>Welcome, {profile.name || 'User'}!</Text>}

      {/* Friends List */}
      <Text style={styles.subtitle}>Your FFF's</Text>
      <FlatList
        data={friends}
        horizontal
        keyExtractor={(item) => item.friendId}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
          <Image 
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg' }} 
            style={styles.friendImage} 
            resizeMode="cover"  // Add resizeMode for proper scaling
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
        workouts.map((workout) => (
          <View key={workout.id} style={styles.workoutItem}>
            <Text style={styles.workoutText}>
              {workout.name} - {new Date(workout.date._seconds * 1000).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noWorkoutsText}>No workouts available.</Text>
      )}

      {/* Notifications */}
      <Text style={styles.subtitle}>Notifications</Text>
      {notifications.length > 0 ? (
        notifications.map((notif, index) => (
          <Text key={index} style={styles.notificationText}>{notif.message}</Text>
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
  notificationText: { marginTop: 5, fontSize: 14, backgroundColor: '#FF6F3C', padding: 5, borderRadius: 5, color: '#FFF' },
  noNotificationsText: { marginTop: 10, fontSize: 16, color: '#888' },
  createButton: { backgroundColor: '#FF6F3C', padding: 15, borderRadius: 25, alignItems: 'center', marginVertical: 20 },
  createButtonText: { color: '#FFF', fontSize: 18 },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,  // Optional: makes it circular
    backgroundColor: '#ddd', // Optional: background color in case image doesn't load
  }  
});
