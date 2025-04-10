import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      if (!auth.currentUser) return;
      
      const friendsRef = collection(db, 'users', auth.currentUser.uid, 'friends');
      const snapshot = await getDocs(friendsRef);
      setFriends(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setLoading(false);
    };
    
    fetchFriends();
  }, []);

  // Setup real-time message listener when chat is active
  useEffect(() => {
    if (!currentChat?.id) return;
    
    const messagesRef = collection(db, 'chats', currentChat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return unsubscribe;
  }, [currentChat?.id]);

  const startChat = (friend) => {
    const chatId = [auth.currentUser.uid, friend.id].sort().join('_');
    setCurrentChat({
      id: chatId,
      friend
    });
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentChat?.id) return;
    
    const messagesRef = collection(db, 'chats', currentChat.id, 'messages');
    
    await addDoc(messagesRef, {
      text: newMessage,
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
    
    setNewMessage('');
  };

  const goBack = () => {
    if (currentChat) {
      setCurrentChat(null);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6F3C" />
      </View>
    );
  }

  if (!currentChat) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Friends</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.friendItem}
              onPress={() => startChat(item)}
            >
              <Text style={styles.friendName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        {currentChat && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerText}>
          {currentChat ? currentChat.friend.name : 'Your Friends'}
        </Text>
      </View>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.senderId === auth.currentUser.uid 
              ? styles.sentMessage 
              : styles.receivedMessage
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>
              {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF2DA',
  },
  listContainer: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 15,
    color: '#333',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 10,
  },
  friendName: {
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FF6F3C',
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6F3C',
    borderTopRightRadius: 2,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  sendButton: {
    backgroundColor: '#FF6F3C',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
