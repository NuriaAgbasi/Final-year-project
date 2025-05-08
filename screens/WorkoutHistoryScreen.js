import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';

const WorkoutHistoryScreen = () => {
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [chartType, setChartType] = useState('steps');

  useEffect(() => {
    const fetchWorkouts = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      let q = query(collection(db, "workouts"), where("userId", "==", userId));
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().workoutStartTime.toDate()
      }));
      
      const now = new Date();
      let filteredData = data;
      if (filter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(w => w.date >= oneWeekAgo);
      } else if (filter === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(w => w.date >= oneMonthAgo);
      }
      
      setWorkouts(filteredData);
    };

    fetchWorkouts();
  }, [filter]);

  const chartData = {
    labels: workouts.map(w => w.name || w.date.toLocaleDateString()),
    datasets: [{
      data: workouts.map(w => {
        if (chartType === 'distance') return w.distance;
        if (chartType === 'calories') return w.caloriesBurned;
        return w.steps;
      })
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filter}
          onValueChange={setFilter}
          style={styles.picker}
        >
          <Picker.Item label="Last Week" value="week" />
          <Picker.Item label="Last Month" value="month" />
          <Picker.Item label="All Time" value="all" />
        </Picker>

        <Picker
          selectedValue={chartType}
          onValueChange={setChartType}
          style={styles.picker}
        >
          <Picker.Item label="Steps" value="steps" />
          <Picker.Item label="Distance (km)" value="distance" />
          <Picker.Item label="Calories" value="calories" />
        </Picker>
      </View>

      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={300}
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

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total Workouts: {workouts.length}
        </Text>
        <Text style={styles.summaryText}>
          Total Steps: {workouts.reduce((sum, w) => sum + w.steps, 0)}
        </Text>
        <Text style={styles.summaryText}>
          Total Distance: {workouts.reduce((sum, w) => sum + w.distance, 0).toFixed(2)} km
        </Text>
        <Text style={styles.summaryText}>
          Total Calories: {workouts.reduce((sum, w) => sum + w.caloriesBurned, 0).toFixed(0)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default WorkoutHistoryScreen;
