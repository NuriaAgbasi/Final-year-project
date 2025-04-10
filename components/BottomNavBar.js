import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNavBar() {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity>
        <Ionicons name="home-outline" size={28} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="calendar-outline" size={28} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={32} color="#FF6F3C" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="people-outline" size={28} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="chatbubble-outline" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FAF2DA',
    borderTopWidth: 1,
    borderColor: '#DDD',
  },
});
