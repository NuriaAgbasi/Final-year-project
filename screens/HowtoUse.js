import React from 'react';
import { View, Text, Button } from 'react-native';

const HowToUse = ({ navigation }) => {
  return (
    <View className="ChatScreen">
      <Text>Welcome New User!</Text>
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Home')} 
      />
    </View>
  );
};

export default HowToUse;
