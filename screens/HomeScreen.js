import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import Chart from '../components/Chart.js';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const HeaderSection = ({ navigation, profile }) => {
  try {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>FFF</Text>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={28} color="#333" />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#333" style={styles.profileIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  } catch (err) {
    console.error('[HomeScreen] HeaderSection error:', err);
    return <View style={styles.header}><Text>Header</Text></View>;
  }
};

const WorkoutsSection = ({ workouts, showMoreWorkouts, setShowMoreWorkouts }) => {
  try {
    if (!workouts || !Array.isArray(workouts)) {
      return <Text>No workout data available</Text>;
    }

    const validWorkouts = workouts.filter(workout => {
      const isValid = workout?.id && typeof workout.id === 'string';
      if (!isValid) console.warn('Invalid workout:', workout);
      return isValid;
    });

    if (validWorkouts.length === 0) return <Text>No valid workouts found</Text>;

    return (
      <View>
        <Text style={styles.subtitle}>Your Workouts</Text>
        <FlatList
          data={validWorkouts.slice(0, showMoreWorkouts ? validWorkouts.length : 3)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.workoutItem}>
              <Text style={styles.workoutTitle}>{item.name || 'Unnamed Workout'}</Text>
              <Text>{item.date ? new Date(item.date.seconds * 1000).toLocaleDateString() : 'No date'}</Text>
            </View>
          )}
        />
        {validWorkouts.length > 3 && (
          <TouchableOpacity onPress={() => setShowMoreWorkouts(!showMoreWorkouts)}>
            <Text style={styles.showMoreText}>{showMoreWorkouts ? 'Show Less' : 'Show More'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  } catch (err) {
    console.error('[HomeScreen] WorkoutsSection error:', err);
    return <Text>Error displaying workouts</Text>;
  }
};

const FriendsSection = ({ friends }) => {
  try {
    return (
      <View>
        <Text style={styles.subtitle}>Your FFF's</Text>
        <FlatList
          horizontal
          data={friends}
          keyExtractor={(item, index) => item.id || index.toString()}
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
      </View>
    );
  } catch (err) {
    console.error('[HomeScreen] FriendsSection error:', err);
    return <Text>Error displaying friends</Text>;
  }
};

const NotificationsSection = ({ notifications, showMoreNotifications, setShowMoreNotifications }) => {
  try {
    return (
      <View>
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
      </View>
    );
  } catch (err) {
    console.error('[HomeScreen] NotificationsSection error:', err);
    return <Text>Error displaying notifications</Text>;
  }
};

const ChartSection = ({ workouts }) => {
  try {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {workouts.slice(0, 3).length > 0 ? (
          <BarChart
            data={{
              labels: workouts.slice(0, 3).map(w => w.name || 'Workout'),
              datasets: [{ data: workouts.slice(0, 3).map(w => w.steps) }]
            }}
            width={Dimensions.get('window').width - 40}
            height={200}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        ) : (
          <Text>No workout data yet</Text>
        )}
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('WorkoutHistory')}
        >
          <Text style={styles.viewAllButtonText}>View Full History</Text>
        </TouchableOpacity>
      </View>
    );
  } catch (err) {
    console.error('[HomeScreen] ChartSection error:', err);
    return <Text>Error displaying chart</Text>;
  }
};

const MainContent = ({ 
  navigation, 
  profile, 
  friends, 
  workouts, 
  notifications, 
  showMoreWorkouts, 
  setShowMoreWorkouts, 
  showMoreNotifications, 
  setShowMoreNotifications 
}) => {
  try {
    return (
      <ScrollView style={styles.container}>
        <HeaderSection navigation={navigation} profile={profile} />
        <FriendsSection friends={friends} />
        <ChartSection workouts={workouts} />
        <WorkoutsSection 
          workouts={workouts} 
          showMoreWorkouts={showMoreWorkouts} 
          setShowMoreWorkouts={setShowMoreWorkouts} 
        />
        <NotificationsSection 
          notifications={notifications} 
          showMoreNotifications={showMoreNotifications} 
          setShowMoreNotifications={setShowMoreNotifications} 
        />
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateWorkout')}
        >
          <Text style={styles.createButtonText}>Create a Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  } catch (err) {
    console.error('[HomeScreen] MainContent error:', err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <TouchableOpacity onPress={() => navigation.replace('Home')}>
          <Text style={styles.retryText}>Restart App</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreWorkouts, setShowMoreWorkouts] = useState(false);
  const [showMoreNotifications, setShowMoreNotifications] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeAuth;
    let friendsUnsub;
    let notificationsUnsub;

    console.log('[HomeScreen] Initializing useEffect');

    const fetchData = async () => {
      try {
        console.log('[HomeScreen] Getting auth instance');
        const auth = getAuth();
        
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          console.log('[HomeScreen] Auth state changed, user:', user ? user.email : 'null');
          
          if (!user) {
            console.log('[HomeScreen] No user signed in');
            if (isMounted) {
              setLoading(false);
            }
            return;
          }
          
          console.log('[HomeScreen] Fetching data for user:', user.email);
          const db = getFirestore();
          const userId = user.uid;
          
          const fetchWorkouts = async () => {
            try {
              console.log('[HomeScreen] Fetching workouts');
              const workoutsQuery = query(collection(db, "users", userId, "workouts"));
              const workoutsSnapshot = await getDocs(workoutsQuery);
              console.log('[HomeScreen] Found', workoutsSnapshot.size, 'workouts');
              
              const workoutsData = workoutsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              if (isMounted) {
                setWorkouts(workoutsData);
                console.log('[HomeScreen] Workouts state updated');
              }
            } catch (err) {
              console.error('[HomeScreen] Workouts fetch error:', err);
              if (isMounted) setError('Failed to load workout data');
            } finally {
              if (isMounted) setLoading(false);
            }
          };

          friendsUnsub = onSnapshot(collection(db, 'users', userId, 'friends'), 
            (snapshot) => {
              console.log('[HomeScreen] Friends snapshot:', snapshot.size, 'items');
              if (isMounted) setFriends(snapshot.docs.map(doc => doc.data()));
            },
            (err) => {
              console.error('[HomeScreen] Friends listener error:', err);
              if (isMounted) setError('Failed to load friends');
            }
          );
          
          notificationsUnsub = onSnapshot(collection(db, 'users', userId, 'notifications'), 
            (snapshot) => {
              console.log('[HomeScreen] Notifications snapshot:', snapshot.size, 'items');
              const sortedNotifications = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.date?.seconds - a.date?.seconds);
              if (isMounted) setNotifications(sortedNotifications);
            },
            (err) => {
              console.error('[HomeScreen] Notifications listener error:', err);
              if (isMounted) setError('Failed to load notifications');
            }
          );
          
          fetchWorkouts();
        });
      } catch (err) {
        console.error('[HomeScreen] Initialization error:', err);
        if (isMounted) setError('Failed to initialize app');
      }
    };

    fetchData();

    return () => {
      console.log('[HomeScreen] Cleaning up listeners');
      isMounted = false;
      if (unsubscribeAuth) unsubscribeAuth();
      if (friendsUnsub) friendsUnsub();
      if (notificationsUnsub) notificationsUnsub();
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'red'}}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF6F3C" />
      </View>
    );
  }

  return (
    <MainContent 
      navigation={navigation}
      profile={profile}
      friends={friends}
      workouts={workouts}
      notifications={notifications}
      showMoreWorkouts={showMoreWorkouts}
      setShowMoreWorkouts={setShowMoreWorkouts}
      showMoreNotifications={showMoreNotifications}
      setShowMoreNotifications={setShowMoreNotifications}
    />
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
  workoutTitle: { fontSize: 16, fontWeight: 'bold' },
  showMoreText: { color: '#FF6F3C', textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
  notificationContainer: { marginTop: 10, backgroundColor: '#FF6F3C', padding: 12, borderRadius: 12 },
  notificationText: { fontSize: 14, color: '#FFF' },
  notificationDate: { fontSize: 12, color: '#FFF', marginTop: 5 },
  createButton: { backgroundColor: '#FF6F3C', padding: 15, borderRadius: 25, alignItems: 'center', marginVertical: 20 },
  createButtonText: { color: '#FFF', fontSize: 18 },
  chartContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
  },
  viewAllButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF2DA',
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
