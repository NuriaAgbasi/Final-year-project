import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Chart from '../components/Chart.js';

import BottomNavBar from '../components/BottomNavBar.js';

const friends = [
  { id: '1', name: 'John', location: 'San Francisco, CA', image: require('../assets/friend1.jpg') },
  { id: '2', name: 'Jane', location: 'New York, NY', image: require('../assets/friend2.jpg') },
  { id: '3', name: 'Sam', location: 'Los Angeles, CA', image: require('../assets/friend3.jpg') },
  { id: '4', name: 'Alex', location: 'Chicago, IL', image: require('../assets/friend4.jpg') },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>FFF</Text>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={28} color="#333" />
          <Ionicons name="person-circle-outline" size={28} color="#333" style={styles.profileIcon} />
        </View>
      </View>

      {/* Friends List */}
      <Text style={styles.subtitle}>Your FFF's</Text>
      <FlatList
        data={friends}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image source={item.image} style={styles.friendImage} />
            <Text style={styles.friendName}>{item.name}</Text>
          </View>
        )}
      />

      {/* Chart */}
      <Chart />

      {/* Location and Time Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.buttonText}>New York, NY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.timeButton}>
          <Text style={styles.buttonText}>This Weekend</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.buttonText}>Los Angeles, CA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.timeButton}>
          <Text style={styles.buttonText}>Next Week</Text>
        </TouchableOpacity>
      </View>

      {/* Create Workout Button */}
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
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  locationButton: { backgroundColor: '#FF6F3C', padding: 10, borderRadius: 20 },
  timeButton: { backgroundColor: '#FFD700', padding: 10, borderRadius: 20 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  createButton: { backgroundColor: '#FF6F3C', padding: 15, borderRadius: 25, alignItems: 'center', marginVertical: 20 },
  createButtonText: { color: '#FFF', fontSize: 18 },
});

