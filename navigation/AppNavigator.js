import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


// Import your screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpscreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import GoogleLoginScreen from '../screens/GoogleLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CreateWorkoutScreen from '../screens/CreateWorkoutScreen';
import PeopleScreen from '../screens/PeopleScreen';
import ChatScreen from '../screens/ChatScreen';
import HowToUse from '../screens/HowtoUse';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Create Workout') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'People') {
            iconName = 'people-outline';
          } else if (route.name === 'Chat') {
            iconName = 'chatbubble-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6F3C',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Create Workout" component={CreateWorkoutScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} />
        <Stack.Screen name="HowToUse" component={HowToUse} />
        {/* Nest the BottomTabNavigator inside the StackNavigator */}
        <Stack.Screen name="HomeTabs" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

