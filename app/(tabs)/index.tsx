import { useRouter } from 'expo-router'
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  const router = useRouter()
  const navItems = [
    { key: 'signInButton', title: 'Sign In', path: '/sign-in' },
    { key: 'signUpButton', title: 'Sign Up', path: '/sign-up' },
  ]

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.navBarWrapper}>
        <FlatList
          data={navItems}
          horizontal={true}
          contentContainerStyle={styles.navBarContainer}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(item.path)}
              style={({ pressed }) => [
                styles.Button,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={{ color: '#333' }}>{item.title}</Text>
            </Pressable>
          )}
        />
      </View>

      {/*  main content */}

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Home!</Text>
        <Text style={styles.subtitle}>
          Explore our features and connect with others.
        </Text>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5', // Lighter background
  },
  Button: {
    marginHorizontal: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  navBarWrapper: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  navBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Align items to the right
    alignItems: 'center',
    paddingHorizontal: 5,
    width: "100%",
    gap: 10,
  },
  navItem: {
    marginHorizontal: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  navItemText: {
    width: '100%',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50', // Darker, more prominent color
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d', // Softer color for subtitle
    textAlign: 'center',
    paddingHorizontal: 20,
  },
})

export default index