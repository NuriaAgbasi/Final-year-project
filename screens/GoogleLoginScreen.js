import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { useNavigation } from '@react-navigation/native';

const GoogleLoginScreen = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = useAuthRequest({
    clientId: '849218786169-jp61ajokfo7sgobff72bek2h7e26i0qt.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
      navigation.navigate('Home'); // Redirect after successful login
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Failed to fetch user info', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Login</Text>
      <Button title="Login with Google" disabled={!request} onPress={() => promptAsync()} />
      {userInfo && <Text>Welcome, {userInfo.name}!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default GoogleLoginScreen;
