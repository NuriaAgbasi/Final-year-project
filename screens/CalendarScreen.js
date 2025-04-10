import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isWeekView, setIsWeekView] = useState(true);

  const workouts = [
    { id: '1', name: 'Yoga', time: '10:00 AM', location: 'Home', date: '2025-03-21' },
    { id: '2', name: 'Strength Training', time: '3:00 PM', location: 'Gym', date: '2025-03-21' },
    { id: '3', name: 'Cardio', time: '7:00 PM', location: 'Park', date: '2025-03-22' },
  ];

  const toggleView = () => {
    setIsWeekView(!isWeekView);
  };

  const filteredWorkouts = workouts.filter(
    (workout) => workout.date === selectedDate.toISOString().split('T')[0]
  );

  const handleAddWorkout = () => {
    Alert.alert('Add Workout', 'This will navigate to the Create Workout page.');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Calendar</Text>

      <View style={styles.viewToggleContainer}>
        <TouchableOpacity style={[styles.toggleButton, isWeekView && styles.activeButton]} onPress={toggleView}>
          <Text style={[styles.toggleText, isWeekView && styles.activeText]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, !isWeekView && styles.activeButton]} onPress={toggleView}>
          <Text style={[styles.toggleText, !isWeekView && styles.activeText]}>Month</Text>
        </TouchableOpacity>
      </View>

      <CalendarStrip
        style={styles.calendarStrip}
        calendarHeaderStyle={styles.calendarHeader}
        dateNumberStyle={styles.dateNumber}
        dateNameStyle={styles.dateName}
        highlightDateNumberStyle={styles.highlightDateNumber}
        highlightDateNameStyle={styles.highlightDateName}
        onDateSelected={setSelectedDate}
        selectedDate={selectedDate}
      />

      <FlatList
        data={filteredWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.workoutItem}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text>{item.time} - {item.location}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noWorkoutsText}>No workouts scheduled.</Text>}
      />

      <TouchableOpacity style={styles.addWorkoutButton} onPress={handleAddWorkout}>
        <Text style={styles.addWorkoutText}>+ Add Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#FFF5E1',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E76F51',
  },
  activeButton: {
    backgroundColor: '#E76F51',
  },
  toggleText: {
    color: '#E76F51',
    fontSize: 14,
  },
  activeText: {
    color: 'white',
  },
  calendarStrip: {
    height: 100,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFE5D9',
  },
  calendarHeader: {
    color: '#E76F51',
    fontSize: 18,
  },
  dateNumber: {
    color: 'black',
    fontSize: 16,
  },
  dateName: {
    color: 'gray',
    fontSize: 14,
  },
  highlightDateNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  highlightDateName: {
    color: 'white',
  },
  workoutItem: {
    marginVertical: 10,
    backgroundColor: '#FAE1DD',
    padding: 15,
    borderRadius: 12,
  },
  workoutName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  noWorkoutsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  addWorkoutButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  addWorkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
