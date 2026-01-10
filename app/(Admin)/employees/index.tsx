import EmployeeListItem from '@/components/Admin/EmployeeListItem';
import { Employee, getEmployeeList } from '@/lib/employees';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminEmployeesScreen = () => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from backend
  const fetchEmployees = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const response = await getEmployeeList();
      if (response.status === 'Success') {
        setEmployees(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const departments = ['All', 'Engineering', 'Sales', 'Marketing', 'HR'];

  const filtered = employees.filter((e) => {
    const matchDept =
      selectedFilter === 'All' || e.department === selectedFilter;
    const matchQuery =
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase()) ||
      e.role.toLowerCase().includes(query.toLowerCase());
    return matchDept && matchQuery;
  });

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && !isRefreshing && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4A90FF" />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      )}

      {!isLoading && error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchEmployees()}>
            <Ionicons name="refresh" size={16} color="#FFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && (
      <>
      {/* Simple header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee List</Text>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="search-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search employees, departments..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {departments.map((d) => {
          const active = selectedFilter === d;
          return (
            <TouchableOpacity
              key={d}
              style={[
                styles.filterChip,
                active && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(d)}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.iconChip}>
          <Ionicons name="filter-outline" size={18} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconChip}>
          <Ionicons name="swap-vertical-outline" size={18} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <EmployeeListItem
            employee={item}
            onPress={() =>
              router.push({
                pathname: '/(Admin)/employees/[id]',
                params: { id: item.id },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchEmployees(true)}
            colors={['#4A90FF']}
            tintColor="#4A90FF"
          />
        }
      />
      </>
      )}
    </SafeAreaView>
  );
};

export default AdminEmployeesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchWrapper: { paddingHorizontal: 16, marginTop: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '400',
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#4A90FF',
    borderColor: '#4A90FF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4A90FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});