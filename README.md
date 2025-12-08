index.tsx file (tabs) {

import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

interface Task {
  id: string
  title: string
  description: string
  category: string
  dueTime: string
  color: string
  assignee?: string
}

const index = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'tasks' | 'reminders'>('tasks')
  const [selectedDate, setSelectedDate] = useState('Monday 16 Jan, 2025')

  const userName = 'Predev'
  const tasksToComplete = 4
  const totalTasks = 12
  const totalReminders = 3

  const weekDays = [
    { key: 'mon', label: 'Mon', date: '16', isSelected: true },
    { key: 'tue', label: 'Tue', date: '17', isSelected: false },
    { key: 'wed', label: 'Wed', date: '18', isSelected: false },
    { key: 'thu', label: 'Thu', date: '19', isSelected: false },
    { key: 'fri', label: 'Fri', date: '20', isSelected: false },
    { key: 'sat', label: 'Sat', date: '21', isSelected: false },
    { key: 'sun', label: 'Sun', date: '22', isSelected: false },
  ]

  const tasks: Task[] = [
    {
      id: '1',
      title: 'UI design',
      description: 'Create design for notes, tasks 7 Reminders application.',
      category: 'work',
      dueTime: '6:30 PM',
      color: '#4169E1',
      assignee: 'user1'
    },
    {
      id: '2',
      title: 'Services',
      description: 'Find our service details below.',
      category: 'cfwebsite',
      dueTime: '6:30 PM',
      color: '#DAA520',
    },
    {
      id: '3',
      title: 'Wireframing',
      description: 'Create design for notes, tasks 7 Reminders application.',
      category: 'design',
      dueTime: '7:00 PM',
      color: '#32CD32',
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.menuButton}>
            <Ionicons name="grid-outline" size={24} color="#000" />
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </Pressable>
            <Pressable style={styles.profileButton}>
              <View style={styles.profileImage}>
                <Ionicons name="person" size={24} color="#4169E1" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.helloText}>Hello {userName}!</Text>
          <Text style={styles.goodMorningText}>Good Morning</Text>
          <Text style={styles.taskCountText}>
            You've to complete <Text style={styles.taskCountBold}>{tasksToComplete} tasks</Text> today.
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
              Tasks ({totalTasks})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'reminders' && styles.activeTab]}
            onPress={() => setActiveTab('reminders')}
          >
            <Text style={[styles.tabText, activeTab === 'reminders' && styles.activeTabText]}>
              Reminders ({totalReminders})
            </Text>
          </Pressable>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.selectedDateText}>{selectedDate}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.weekDaysScroll}
          >
            {weekDays.map((day) => (
              <Pressable
                key={day.key}
                style={[styles.dayButton, day.isSelected && styles.selectedDayButton]}
              >
                <Text style={[styles.dayLabel, day.isSelected && styles.selectedDayLabel]}>
                  {day.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Task Cards */}
        <View style={styles.tasksSection}>
          {tasks.map((task, index) => (
            <Pressable
              key={task.id}
              style={[styles.taskCard, { backgroundColor: task.color }]}
            >
              <View style={styles.taskCardHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.assignee && (
                  <View style={styles.taskAssignee}>
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                )}
                {index === tasks.length - 1 && (
                  <Pressable style={styles.addButton}>
                    <Ionicons name="add" size={28} color="#fff" />
                  </Pressable>
                )}
              </View>

              <Text style={styles.taskDescription}>{task.description}</Text>

              <View style={styles.taskFooter}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>#{task.category}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>Due : {task.dueTime}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 45,
    height: 45,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E0E8FF',
    justifyContent: 'center',
    alignItems: 'center',
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
  taskCountText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  taskCountBold: {
    fontWeight: '700',
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 20,
  },
  tab: {
    paddingBottom: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  dateSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  weekDaysScroll: {
    marginBottom: 10,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  selectedDayButton: {
    backgroundColor: '#000',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedDayLabel: {
    color: '#fff',
  },
  tasksSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 15,
  },
  taskCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  taskAssignee: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 15,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E63946',
  },
})

export default index

}