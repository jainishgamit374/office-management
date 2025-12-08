import Navbar from '@/components/Navigation/Navbar';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const index = () => {

  const userName = 'Jainish'
  const tasksToComplete = 4
  const totalTasks = 12
  const totalReminders = 3


  return (
    <SafeAreaView style={styles.container}>


      {/*  Header */}
      <Navbar />


      {/*  main content */}
      <View style={styles.mainContainer}>
        <View style={styles.greetingSection}>
          <Text style={styles.helloText}>Hello {userName}!</Text>
          <Text style={styles.goodMorningText}>Good Morning</Text>
          <Text style={styles.taskCountText}>
            You've to complete <Text style={styles.taskCountBold}>{tasksToComplete} tasks</Text> today.
          </Text>
        </View>

        <View style={styles.swipeContainer}>
          <View style={styles.swipebody}>
            <View style={styles.arrowContainer}>
              <Feather style={styles.arrow} name="arrow-right" size={24} color="black" />
            </View>
            <View style={styles.swipeTextContainer}>
              <Text style={styles.swipeText}>Swipe Right to Check-In</Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.taskSection}>
          <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
          <Text style={styles.taskCountText}>
            Task remaining {totalTasks - tasksToComplete}
          </Text>
        </View> */}

      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5',
  },
  swipeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  swipebody: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: "#bfbfbfff",
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 50,
    position: 'relative',
  },
  arrowContainer: {
    position: 'absolute',
    left: 5,
    backgroundColor: "green",
    padding: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#ffff',
  },
  swipeTextContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 14,
    color: '#ffff',
    marginTop: 5,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5',
  },
  taskSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  taskText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  taskCountText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
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
  goodMorningText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  taskCountBold: {
    fontWeight: '700',
    color: '#000',
  },
})

export default index