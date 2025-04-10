import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const data = {
  labels: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [30, 45, 60, 50, 70, 40, 55],
      strokeWidth: 3, 
    },
  ],
};

export default function Chart() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 30} // to make the chart responsive to screen width
        height={300}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#ffb3b3',
          backgroundGradientTo: '#ff6f3c',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
      />
    </View>
  );
}
