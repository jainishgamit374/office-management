import { account } from '@/lib/appwrite';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const GreetingSection: React.FC = () => {
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await account.get();
      if (user) {
        setUserName(user.name);
      }
    } catch (error) {
      console.log('Error getting user:', error);
    }
  };

  return (
    <View style={styles.greetingSection}>
      <Text style={styles.helloText}>Hello {userName}!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  helloText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
});

export default GreetingSection;