import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc } from "firebase/firestore";
import { FlatList, View, Text, TextInput, TouchableOpacity, Image, Switch, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';

const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [school, setSchool] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [goToGym, setGoToGym] = useState(false);
  const [gymName, setGymName] = useState('');
  const [gymSuggestions, setGymSuggestions] = useState([]);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);

  const availableProfilePictures = [
    { id: '1', image: require('../assets/profile1.jpg') },
    { id: '2', image: require('../assets/profile2.jpg') },
    { id: '3', image: require('../assets/profile3.jpg') },
    { id: '4', image: require('../assets/profile4.jpg') },
  ];

  const defaultProfilePicture = require('../assets/default-profile.jpg');

  const saveProfileToFirebase = async () => {
    const user = getAuth().currentUser;
    const userId = user ? user.uid : null;

    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    try {
      const profileData = {
        age: age,
        school: school,
        goToGym: goToGym,
        gymName: gymName,
        profilePicture: selectedProfilePicture ? selectedProfilePicture.image : defaultProfilePicture,
      };

      await setDoc(doc(db, "users", userId), profileData);
      console.log('User profile saved to Firestore!');
    } catch (error) {
      console.error('Error saving profile to Firestore:', error);
    }
  };

  useEffect(() => {
    if (school.length > 1) {
      fetch(`http://universities.hipolabs.com/search?country=United%20Kingdom`)
        .then(response => response.json())
        .then(data => {
          const filteredSchools = data
            .map(university => university.name)
            .filter(name => name.toLowerCase().includes(school.toLowerCase()));
          setSchoolSuggestions(filteredSchools);
        })
        .catch(error => console.error('Error fetching universities:', error));
    } else {
      setSchoolSuggestions([]);
    }
  }, [school]);

  return (
    <FlatList
      data={[1]}
      renderItem={() => (
        <View style={styles.container}>
          {step === 1 && (
            <View>
              <Text style={styles.title}>Step 1: Personal Information</Text>
              <Text>Age:</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="numeric"
              />
              <Text>College/Uni:</Text>
              <TextInput
                style={styles.input}
                value={school}
                onChangeText={setSchool}
                placeholder="Enter your school"
              />
              {schoolSuggestions.length > 0 && (
                <FlatList
                  data={schoolSuggestions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setSchool(item)}>
                      <Text style={styles.suggestionItem}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.title}>Step 2: Gym Information</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Do you go to the gym?</Text>
                <Switch value={goToGym} onValueChange={setGoToGym} />
              </View>
              {goToGym && (
                <View>
                  <Text>Enter your gym name:</Text>
                  <TextInput
                    style={styles.input}
                    value={gymName}
                    onChangeText={setGymName}
                    placeholder="Enter your gym name"
                  />
                </View>
              )}
              <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setStep(1)}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.title}>Choose a Profile Picture</Text>
              <FlatList
                data={availableProfilePictures}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelectedProfilePicture(item)}>
                    <Image source={item.image} style={styles.profileImage} />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.button} onPress={saveProfileToFirebase}>
                <Text style={styles.buttonText}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      keyExtractor={() => '1'}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FAF3E0', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  suggestionItem: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    marginVertical: 2,
    borderRadius: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#FF6B3C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
});

export default ProfileSetup;
