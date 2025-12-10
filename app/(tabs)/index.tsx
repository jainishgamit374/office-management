// import Navbar from '@/components/Navigation/Navbar';
// import Feather from '@expo/vector-icons/Feather';
// import React, { useEffect, useRef, useState } from 'react';
// import { Animated, Dimensions, LayoutAnimation, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';



// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.5; // 50% of container width
// const AUTO_RESET_TIME = 10000; // 10 seconds in milliseconds

// // Enable LayoutAnimation on Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// // Custom animation configuration
// const animationConfig = {
//   duration: 300,
//   create: {
//     type: LayoutAnimation.Types.easeInEaseOut,
//     property: LayoutAnimation.Properties.opacity,
//   },
//   update: {
//     type: LayoutAnimation.Types.easeInEaseOut,
//   },
//   delete: {
//     type: LayoutAnimation.Types.easeInEaseOut,
//     property: LayoutAnimation.Properties.opacity,
//   },
// };


// const index = () => {
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [hasEverCheckedIn, setHasEverCheckedIn] = useState(false);
//   const [isOnCooldown, setIsOnCooldown] = useState(false);
//   const [cooldownSeconds, setCooldownSeconds] = useState(0);
//   const [expandedLeave, setExpandedLeave] = useState<number | null>(null);
//   const pan = useRef(new Animated.Value(0)).current;
//   const checkOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const userName = 'Jainish'
//   const tasksToComplete = 4
//   const totalTasks = 12
//   const totalReminders = 3

//   // Helper function to handle animated state changes
//   const handleExpandToggle = (newValue: number | null) => {
//     LayoutAnimation.configureNext(animationConfig);
//     setExpandedLeave(newValue);
//   };

//   // Animated scale values for press feedback
//   const scaleAnims = useRef({
//     leave1: new Animated.Value(1),
//     leave2: new Animated.Value(1),
//     leave3: new Animated.Value(1),
//     wfhMain: new Animated.Value(1),
//     wfh1: new Animated.Value(1),
//     wfh2: new Animated.Value(1),
//     wfh3: new Animated.Value(1),
//     wfhToday: new Animated.Value(1),
//     birthday: new Animated.Value(1),
//   }).current;

//   // Helper function for press animation
//   const animatePress = (animKey: keyof typeof scaleAnims, callback: () => void) => {
//     Animated.sequence([
//       Animated.timing(scaleAnims[animKey], {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnims[animKey], {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//     callback();
//   };



//   // Auto-reset after check-out
//   useEffect(() => {
//     // Clear any existing timers when component unmounts
//     return () => {
//       if (checkOutTimerRef.current) {
//         clearTimeout(checkOutTimerRef.current);
//       }
//       if (cooldownIntervalRef.current) {
//         clearInterval(cooldownIntervalRef.current);
//       }
//     };
//   }, []);

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => !isOnCooldown,
//       onMoveShouldSetPanResponder: () => !isOnCooldown,
//       onPanResponderMove: (_, gestureState) => {
//         if (!isCheckedIn && !isOnCooldown && gestureState.dx >= 0) {
//           // Swiping right when not checked in and not on cooldown
//           pan.setValue(gestureState.dx);
//         } else if (isCheckedIn && gestureState.dx <= 0) {
//           // Swiping left when checked in
//           pan.setValue(SCREEN_WIDTH - 115 + gestureState.dx);
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         if (!isCheckedIn) {
//           // Check-in flow (swipe right)
//           if (gestureState.dx > SWIPE_THRESHOLD) {
//             // Swipe successful - check in
//             // Clear any existing timers
//             if (checkOutTimerRef.current) {
//               clearTimeout(checkOutTimerRef.current);
//               checkOutTimerRef.current = null;
//             }
//             if (cooldownIntervalRef.current) {
//               clearInterval(cooldownIntervalRef.current);
//               cooldownIntervalRef.current = null;
//             }
//             setIsOnCooldown(false);
//             setCooldownSeconds(0);

//             Animated.spring(pan, {
//               toValue: SCREEN_WIDTH - 115,
//               useNativeDriver: false,
//             }).start(() => {
//               setIsCheckedIn(true);
//               setHasEverCheckedIn(true);
//             });
//           } else {
//             // Swipe not far enough - reset
//             Animated.spring(pan, {
//               toValue: 0,
//               useNativeDriver: false,
//             }).start();
//           }
//         } else {
//           // Check-out flow (swipe left)
//           if (gestureState.dx < -SWIPE_THRESHOLD) {
//             // Swipe successful - check out
//             Animated.spring(pan, {
//               toValue: 0,
//               useNativeDriver: false,
//             }).start(() => {
//               setIsCheckedIn(false);

//               // Start a timer to lock the swipe after 10 seconds
//               checkOutTimerRef.current = setTimeout(() => {
//                 setIsOnCooldown(true);
//                 setCooldownSeconds(10);

//                 // Countdown interval for visual feedback
//                 let secondsLeft = 10;
//                 cooldownIntervalRef.current = setInterval(() => {
//                   secondsLeft -= 1;
//                   setCooldownSeconds(secondsLeft);

//                   if (secondsLeft <= 0) {
//                     if (cooldownIntervalRef.current) {
//                       clearInterval(cooldownIntervalRef.current);
//                     }
//                     setIsOnCooldown(false);
//                     setCooldownSeconds(0);
//                   }
//                 }, 1000);
//               }, 10000); // Lock after 10 seconds
//             });
//           } else {
//             // Swipe not far enough - reset to checked in position
//             Animated.spring(pan, {
//               toValue: SCREEN_WIDTH - 115,
//               useNativeDriver: false,
//             }).start();
//           }
//         }
//       },
//     })
//   ).current;


//   return (
//     <SafeAreaView style={styles.container}>
//       {/*  Header */}
//       {/* <Navbar /> */}

//       <ScrollView
//         style={styles.mainContainer}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/*  Header */}
//         <Navbar />
//         {/*  main content */}

//         <View style={styles.greetingSection}>
//           <Text style={styles.helloText}>Hello {userName}!</Text>
//         </View>

//         <View style={styles.swipeContainer}>
//           <View style={styles.swipebody}>
//             {/* Background text */}
//             <View style={styles.swipeTextContainer}>
//               <Text style={styles.swipeText}>
//                 {isCheckedIn
//                   ? 'Swipe Left to Check-Out'
//                   : isOnCooldown
//                     ? `Wait ${cooldownSeconds}s to Check-In`
//                     : 'Swipe Right to Check-In'}
//               </Text>
//             </View>

//             {/* Swipeable button */}
//             <Animated.View
//               style={[
//                 styles.arrowContainer,
//                 {
//                   transform: [{ translateX: pan }],
//                   backgroundColor: isCheckedIn ? '#ffe23dff' : isOnCooldown ? '#999' : '#1472d6ff',
//                   opacity: isOnCooldown ? 0.6 : 1,
//                 },
//               ]}
//               {...panResponder.panHandlers}
//             >
//               <Feather

//                 style={[styles.arrow, {
//                   color: isCheckedIn ? '#000000ff' : isOnCooldown ? '#999' : '#ffff',
//                 }
//                 ]}
//                 name={isCheckedIn ? "arrow-left" : isOnCooldown ? "clock" : "arrow-right"}
//                 size={24}
//               />
//             </Animated.View>
//           </View>
//         </View>

//         {/* Task Section - Hidden initially, shows after first check-in */}
//         {hasEverCheckedIn && (
//           <View style={styles.taskSection}>
//             {isCheckedIn ? (
//               // Show only total tasks when checked in
//               <>
//                 <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
//               </>
//             ) : (
//               // Show all task details when checked out
//               <>
//                 <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
//                 <Text style={styles.taskCountText}>
//                   Tasks Completed: <Text style={styles.taskCountBold}>{totalTasks - tasksToComplete}</Text>
//                 </Text>
//                 <Text style={styles.taskCountText}>
//                   Task Remaining: {tasksToComplete}
//                 </Text>
//               </>
//             )}
//           </View>
//         )}

//         <View style={styles.checkInContainer}>
//           <View style={styles.checkInMainTextContainer}>
//             <Text style={styles.checkInMainText}>Missed Pushed/ Check-Out</Text>
//           </View>
//           <View style={styles.checkInTextContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.checkInScrollViewContent}>
//               <View style={styles.checkInTextContainerRight}>
//                 <Text style={styles.checkInText}>07 / Dec / 2025</Text>
//               </View>
//               <View style={styles.checkInTextContainerRight}>
//                 <Text style={styles.checkInText}>07 / Dec / 2025</Text>
//               </View>
//               <View style={styles.checkInTextContainerRight}>
//                 <Text style={styles.checkInText}>07 / Dec / 2025</Text>
//               </View>
//               <View style={styles.checkInTextContainerRight}>
//                 <Text style={styles.checkInText}>07 / Dec / 2025</Text>
//               </View>
//               <View style={styles.checkInTextContainerRight}>
//                 <Text style={styles.checkInText}>07 / Dec / 2025</Text>
//               </View>
//             </ScrollView>
//           </View>
//         </View>

//         {/* Total checkIn, leave, Halfday */}
//         <View style={styles.checkInTrackContainer}>
//           <View style={styles.checkInTrackCard}>
//             <Text style={styles.checkInTrackLabel}>Late Check In</Text>
//             <Feather name="log-in" size={32} color="#4289f4ff" />
//             <Text style={styles.checkInTrackCount}>0</Text>
//           </View>

//           <View style={styles.checkInTrackCard}>
//             <Text style={styles.checkInTrackLabel}>Early Check Out</Text>
//             <Feather name="log-out" size={32} color="#4289f4ff" />
//             <Text style={styles.checkInTrackCount}>0</Text>
//           </View>

//           <View style={styles.checkInTrackCard}>
//             <Text style={styles.checkInTrackLabel}>Half Day</Text>
//             <Feather name="calendar" size={32} color="#4289f4ff" />
//             <Text style={styles.checkInTrackCount}>0</Text>
//           </View>
//         </View>

//         {/* Leave Balance Sheet */}
//         <View style={styles.leaveBalanceContainer}>
//           <View style={styles.leaveBalanceHeader}>
//             <Text style={styles.leaveBalanceTitle}>Leave Balance</Text>
//           </View>

//           <View style={styles.leaveBalanceGrid}>
//             {/* Privilege Leave (PL) */}
//             <View style={styles.leaveBalanceCard}>
//               <View style={[styles.leaveBadge, { backgroundColor: '#4caf50' }]}>
//                 <Text style={styles.leaveBadgeText}>PL</Text>
//               </View>
//               <Text style={styles.leaveCount}>10</Text>
//             </View>

//             {/* Casual Leave (CL) */}
//             <View style={styles.leaveBalanceCard}>
//               <View style={[styles.leaveBadge, { backgroundColor: '#2196f3' }]}>
//                 <Text style={styles.leaveBadgeText}>CL</Text>
//               </View>
//               <Text style={styles.leaveCount}>10</Text>
//             </View>

//             {/* Sick Leave (SL) */}
//             <View style={styles.leaveBalanceCard}>
//               <View style={[styles.leaveBadge, { backgroundColor: '#ff9800' }]}>
//                 <Text style={styles.leaveBadgeText}>SL</Text>
//               </View>
//               <Text style={styles.leaveCount}>10</Text>
//             </View>

//             {/* Absent (AB) */}
//             <View style={styles.leaveBalanceCard}>
//               <View style={[styles.leaveBadge, { backgroundColor: '#f44336' }]}>
//                 <Text style={styles.leaveBadgeText}>AB</Text>
//               </View>
//               <Text style={styles.leaveCount}>0</Text>
//             </View>
//           </View>
//         </View>

//         {/* My pending requests */}
//         <View style={styles.myPendingRequestsContainer}>
//           <View style={styles.myPendingRequestsHeader}>
//             <Text style={styles.myPendingRequestsTitle}>My Pending Requests</Text>
//           </View>

//           <View style={styles.myPendingRequestsGrid}>
//             <View style={styles.myPendingRequestsCard}>
//               <View style={styles.myPendingRequestsiconcont}>
//                 <Feather style={styles.myPendingRequestsicon} name="check-circle" size={24} color="#12df34ff" />
//               </View>
//               <View style={styles.myPendingRequestsCardHeader}>
//                 <Text style={styles.myPendingRequestsCardTitle}>Leave Approvals</Text>
//               </View>
//             </View>
//             <View style={styles.myPendingRequestsCard}>
//               <View style={styles.myPendingRequestsiconcont}>
//                 <Feather style={styles.myPendingRequestsicon} name="clock" size={24} color="#f45742ff" />
//               </View>
//               <View style={styles.myPendingRequestsCardHeader}>
//                 <Text style={styles.myPendingRequestsCardTitle}>Miss Punch Approvals</Text>
//               </View>
//             </View>
//             <View style={styles.myPendingRequestsCard}>
//               <View style={styles.myPendingRequestsiconcont}>
//                 <Feather style={styles.myPendingRequestsicon} name="calendar" size={24} color="#2cb1f4ff" />
//               </View>
//               <View style={styles.myPendingRequestsCardHeader}>
//                 <Text style={styles.myPendingRequestsCardTitle}>Half Day Approvals</Text>
//               </View>
//             </View>
//             <View style={styles.myPendingRequestsCard}>
//               <View style={styles.myPendingRequestsiconcont}>
//                 <Feather style={styles.myPendingRequestsicon} name="log-out" size={24} color="#2d58e4ff" />
//               </View>
//               <View style={styles.myPendingRequestsCardHeader}>
//                 <Text style={styles.myPendingRequestsCardTitle}>Early Check-Out Approvals</Text>
//               </View>
//             </View>
//             <View style={styles.myPendingRequestsCard}>
//               <View style={styles.myPendingRequestsiconcont}>
//                 <Feather style={styles.myPendingRequestsicon} name="home" size={24} color="#f45742ff" />
//               </View>
//               <View style={styles.myPendingRequestsCardHeader}>
//                 <Text style={styles.myPendingRequestsCardTitle}>WFH Approval</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Late arrivals */}

//         <View style={styles.LateArrivalsContainer}>
//           <View style={styles.LateArrivalsHeader}>
//             <Text style={styles.LateArrivalsTitle}>Late Arrivals Today</Text>
//           </View>

//           <View style={styles.LateArrivalsGrid}>
//             <View style={styles.LateArrivalsCard}>
//               <View style={styles.LateArrivalsiconcont}>
//                 <Feather style={styles.LateArrivalsicon} name="user" size={24} color="#4169E1" />
//               </View>
//               <View style={styles.LateArrivalsCardHeader}>
//                 <Text style={styles.LateArrivalsCardTitle}>No record available</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Leave Early Today  */}

//         <View style={styles.LateArrivalsContainer}>
//           <View style={styles.LateArrivalsHeader}>
//             <Text style={styles.LateArrivalsTitle}>Leaving Early Today</Text>
//           </View>

//           <View style={styles.LateArrivalsGrid}>
//             <View style={styles.LateArrivalsCard}>
//               <View style={styles.LateArrivalsiconcont}>
//                 <Feather style={styles.LateArrivalsicon} name="user" size={24} color="#4169E1" />
//               </View>
//               <View style={styles.LateArrivalsCardHeader}>
//                 <Text style={styles.LateArrivalsCardTitle}>No record available</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Employees on Leave Today */}
//         <View style={styles.LeaveContainer}>
//           <View style={styles.LeaveHeader}>
//             <Text style={styles.LateArrivalsTitle}>Employees on Leave Today</Text>
//           </View>

//           <View style={styles.LeaveGrid}>
//             {/* Employee 1 */}
//             <View style={styles.LeaveCard}>
//               <View style={styles.profileImage}>
//                 <Feather name="user" size={24} color="#4169E1" />
//               </View>
//               <View style={styles.LeaveCardContent}>
//                 <Text style={styles.LeaveCardTitle}>Prakesh Darji</Text>
//                 <Text style={styles.LeaveCardshow}>Sick Leave</Text>
//               </View>
//               <View style={styles.LeaveStatusIcon}>
//                 <Feather name="check-circle" size={24} color="#12df34ff" />
//               </View>
//             </View>

//             {/* Employee 2 */}
//             <View style={styles.LeaveCard}>
//               <View style={styles.profileImage}>
//                 <Feather name="user" size={24} color="#4169E1" />
//               </View>
//               <View style={styles.LeaveCardContent}>
//                 <Text style={styles.LeaveCardTitle}>Nipa Barot</Text>
//                 <Text style={styles.LeaveCardshow}>Privilege Leave</Text>
//               </View>
//               <View style={styles.LeaveStatusIcon}>
//                 <Feather name="check-circle" size={24} color="#12df34ff" />
//               </View>
//             </View>

//             {/* Employee 3 */}
//             <View style={styles.LeaveCard}>
//               <View style={styles.profileImage}>
//                 <Feather name="user" size={24} color="#4169E1" />
//               </View>
//               <View style={styles.LeaveCardContent}>
//                 <Text style={styles.LeaveCardTitle}>Hemant Patel</Text>
//                 <Text style={styles.LeaveCardshow}>Casual Leave</Text>
//               </View>
//               <View style={styles.LeaveStatusIcon}>
//                 <Feather name="check-circle" size={24} color="#12df34ff" />
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Upcoming Leaves */}
//         <View style={styles.LeaveContainer}>
//           <View style={styles.LeaveHeader}>
//             <Text style={styles.LateArrivalsTitle}>Upcoming Leaves</Text>
//           </View>

//           <View style={styles.LeaveGrid}>
//             {/* Employee 1 - Expandable */}
//             <View style={styles.expandableLeaveCard}>
//               <Animated.View style={{ transform: [{ scale: scaleAnims.leave1 }] }}>
//                 <TouchableOpacity
//                   style={styles.LeaveCard}
//                   activeOpacity={0.7}
//                   onPress={() => animatePress('leave1', () => handleExpandToggle(expandedLeave === 1 ? null : 1))}
//                 >
//                   <View style={styles.profileImage}>
//                     <Feather name="user" size={24} color="#4169E1" />
//                   </View>
//                   <View style={styles.LeaveCardContent}>
//                     <Text style={styles.LeaveCardTitle}>Rajesh Kumar</Text>
//                     <Text style={styles.LeaveCardshow}>Sick Leave • 12-15 Dec</Text>
//                   </View>
//                   <View style={styles.LeaveStatusIcon}>
//                     <Feather
//                       name={expandedLeave === 1 ? "chevron-up" : "chevron-down"}
//                       size={24}
//                       color="#666"
//                     />
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>

//               {expandedLeave === 1 && (
//                 <View style={styles.expandedContent}>
//                   <View style={styles.detailRow}>
//                     <Feather name="calendar" size={16} color="#4289f4ff" />
//                     <Text style={styles.detailText}>Duration: 12 Dec - 15 Dec (4 days)</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Feather name="file-text" size={16} color="#4289f4ff" />
//                     <Text style={styles.detailText}>Reason: Medical treatment and recovery</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Feather name="clock" size={16} color="#ff9800" />
//                     <Text style={styles.detailTextPending}>Status: Pending</Text>
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Employee 2 - Expandable */}
//             <View style={styles.expandableLeaveCard}>
//               <Animated.View style={{ transform: [{ scale: scaleAnims.leave2 }] }}>
//                 <TouchableOpacity
//                   style={styles.LeaveCard}
//                   activeOpacity={0.7}
//                   onPress={() => animatePress('leave2', () => handleExpandToggle(expandedLeave === 2 ? null : 2))}
//                 >
//                   <View style={styles.profileImage}>
//                     <Feather name="user" size={24} color="#4169E1" />
//                   </View>
//                   <View style={styles.LeaveCardContent}>
//                     <Text style={styles.LeaveCardTitle}>Priya Sharma</Text>
//                     <Text style={styles.LeaveCardshow}>Casual Leave • 18 Dec</Text>
//                   </View>
//                   <View style={styles.LeaveStatusIcon}>
//                     <Feather
//                       name={expandedLeave === 2 ? "chevron-up" : "chevron-down"}
//                       size={24}
//                       color="#666"
//                     />
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>

//               {expandedLeave === 2 && (
//                 <View style={styles.expandedContent}>
//                   <View style={styles.detailRow}>
//                     <Feather name="calendar" size={16} color="#4289f4ff" />
//                     <Text style={styles.detailText}>Duration: 18 Dec (1 day)</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Feather name="file-text" size={16} color="#4289f4ff" />
//                     <Text style={styles.detailText}>Reason: Personal work</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Feather name="clock" size={16} color="#ff9800" />
//                     <Text style={styles.detailTextPending}>Status: Pending</Text>
//                   </View>
//                 </View>
//               )}
//             </View>

//             {/* Employee 3 - Expandable */}
//             <View style={styles.expandableLeaveCard}>
//               <Animated.View style={{ transform: [{ scale: scaleAnims.leave3 }] }}>
//                 <TouchableOpacity
//                   style={styles.LeaveCard}
//                   activeOpacity={0.7}
//                   onPress={() => animatePress('leave3', () => handleExpandToggle(expandedLeave === 3 ? null : 3))}
//                 >
//                   <View style={styles.profileImage}>
//                     <Feather name="user" size={24} color="#4169E1" />
//                   </View>
//                   <View style={styles.LeaveCardContent}>
//                     <Text style={styles.LeaveCardTitle}>Amit Desai</Text>
//                     <Text style={styles.LeaveCardshow}>Privilege Leave • 20-22 Dec</Text>
//                   </View>
//                   <View style={styles.LeaveStatusIcon}>
//                     <Feather
//                       name={expandedLeave === 3 ? "chevron-up" : "chevron-down"}
//                       size={24}
//                       color="#666"
//                     />
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>

//               {expandedLeave === 3 && (
//                 <View style={styles.expandedContent}>
//                   <View style={styles.detailRow}>
//                     <Feather name="calendar" size={16} color="#4289f4ff" />
//                     <Text style={styles.detailText}>Duration: 20 Dec - 22 Dec (3 days)</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Feather name="file-text" size={16} color="#4289f4ff" />
//                     <Text style={styles.detailText}>Reason: Family function and vacation</Text>
//                   </View>
//                   <View style={styles.detailRow}>
//                     <Feather name="clock" size={16} color="#ff9800" />
//                     <Text style={styles.detailTextPending}>Status: Pending</Text>
//                   </View>
//                 </View>
//               )}
//             </View>
//           </View>
//         </View>

//         {/* Upcoming WFHs */}
//         <View style={styles.upcomingWFHContainer}>
//           <View style={styles.upcomingWFHHeaderContainer}>
//             <View style={styles.upcomingWFHHeader}>
//               <Text style={styles.LateArrivalsTitle}>Upcoming WFHs</Text>
//             </View>
//             <View>
//               <Animated.View style={{ transform: [{ scale: scaleAnims.wfhMain }] }}>
//                 <TouchableOpacity
//                   style={styles.WFHStatusIcon}
//                   activeOpacity={0.7}
//                   onPress={() => animatePress('wfhMain', () => handleExpandToggle(
//                     (expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7)
//                       ? null
//                       : 4
//                   ))}
//                 >
//                   <Feather
//                     name={(expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7) ? "minus" : "plus"}
//                     size={24}
//                     color="#4169E1"
//                   />
//                 </TouchableOpacity>
//               </Animated.View>
//             </View>
//           </View>

//           {(expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7) && (
//             <View style={styles.upcomingWFHGrid}>
//               {/* Employee 1 - Expandable */}
//               <View style={styles.expandableWFHCard}>
//                 <Animated.View style={{ transform: [{ scale: scaleAnims.wfh1 }] }}>
//                   <TouchableOpacity
//                     style={styles.WFHCard}
//                     activeOpacity={0.7}
//                     onPress={() => animatePress('wfh1', () => handleExpandToggle(expandedLeave === 5 ? 4 : 5))}
//                   >
//                     <View style={styles.profileImage}>
//                       <Feather name="user" size={24} color="#4169E1" />
//                     </View>
//                     <View style={styles.WFHCardContent}>
//                       <Text style={styles.WFHCardTitle}>Vikram Singh</Text>
//                       <Text style={styles.WFHCardshow}>WFH • 12-15 Dec</Text>
//                     </View>
//                     <View style={styles.WFHStatusIcon}>
//                       <Feather
//                         name={expandedLeave === 5 ? "chevron-up" : "chevron-down"}
//                         size={24}
//                         color="#666"
//                       />
//                     </View>
//                   </TouchableOpacity>
//                 </Animated.View>

//                 {expandedLeave === 5 && (
//                   <View style={styles.upcomingWFHExpandedContent}>
//                     <View style={styles.detailRow}>
//                       <Feather name="calendar" size={16} color="#4289f4ff" />
//                       <Text style={styles.detailText}>Duration: 12 Dec - 15 Dec (4 days)</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Feather name="file-text" size={16} color="#4289f4ff" />
//                       <Text style={styles.detailText}>Reason: Project work from home</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Feather name="clock" size={16} color="#ff9800" />
//                       <Text style={styles.detailTextPending}>Status: Pending</Text>
//                     </View>
//                   </View>
//                 )}
//               </View>
//               {/* Employee 2 - Expandable */}
//               <View style={styles.expandableWFHCard}>
//                 <Animated.View style={{ transform: [{ scale: scaleAnims.wfh2 }] }}>
//                   <TouchableOpacity
//                     style={styles.WFHCard}
//                     activeOpacity={0.7}
//                     onPress={() => animatePress('wfh2', () => handleExpandToggle(expandedLeave === 6 ? 4 : 6))}
//                   >
//                     <View style={styles.profileImage}>
//                       <Feather name="user" size={24} color="#4169E1" />
//                     </View>
//                     <View style={styles.WFHCardContent}>
//                       <Text style={styles.WFHCardTitle}>Anjali Mehta</Text>
//                       <Text style={styles.WFHCardshow}>WFH • 16-18 Dec</Text>
//                     </View>
//                     <View style={styles.WFHStatusIcon}>
//                       <Feather
//                         name={expandedLeave === 6 ? "chevron-up" : "chevron-down"}
//                         size={24}
//                         color="#666"
//                       />
//                     </View>
//                   </TouchableOpacity>
//                 </Animated.View>

//                 {expandedLeave === 6 && (
//                   <View style={styles.upcomingWFHExpandedContent}>
//                     <View style={styles.detailRow}>
//                       <Feather name="calendar" size={16} color="#4289f4ff" />
//                       <Text style={styles.detailText}>Duration: 16 Dec - 18 Dec (3 days)</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Feather name="file-text" size={16} color="#4289f4ff" />
//                       <Text style={styles.detailText}>Reason: Remote client meetings</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Feather name="clock" size={16} color="#ff9800" />
//                       <Text style={styles.detailTextPending}>Status: Pending</Text>
//                     </View>
//                   </View>
//                 )}
//               </View>
//               {/* Employee 3 - Expandable */}
//               <View style={styles.expandableWFHCard}>
//                 <Animated.View style={{ transform: [{ scale: scaleAnims.wfh3 }] }}>
//                   <TouchableOpacity
//                     style={styles.WFHCard}
//                     activeOpacity={0.7}
//                     onPress={() => animatePress('wfh3', () => handleExpandToggle(expandedLeave === 7 ? 4 : 7))}
//                   >
//                     <View style={styles.profileImage}>
//                       <Feather name="user" size={24} color="#4169E1" />
//                     </View>
//                     <View style={styles.WFHCardContent}>
//                       <Text style={styles.WFHCardTitle}>Suresh Patel</Text>
//                       <Text style={styles.WFHCardshow}>WFH • 20 Dec</Text>
//                     </View>
//                     <View style={styles.WFHStatusIcon}>
//                       <Feather
//                         name={expandedLeave === 7 ? "chevron-up" : "chevron-down"}
//                         size={24}
//                         color="#666"
//                       />
//                     </View>
//                   </TouchableOpacity>
//                 </Animated.View>

//                 {expandedLeave === 7 && (
//                   <View style={styles.upcomingWFHExpandedContent}>
//                     <View style={styles.detailRow}>
//                       <Feather name="calendar" size={16} color="#4289f4ff" />
//                       <Text style={styles.detailText}>Duration: 20 Dec (1 day)</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Feather name="file-text" size={16} color="#4289f4ff" />
//                       <Text style={styles.detailText}>Reason: Personal appointment</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Feather name="clock" size={16} color="#ff9800" />
//                       <Text style={styles.detailTextPending}>Status: Pending</Text>
//                     </View>
//                   </View>
//                 )}
//               </View>
//             </View>
//           )}






//         </View>

//         {/* Employees Working from Home Today */}

//         <View style={styles.upcomingWFHContainer}>
//           <View style={styles.upcomingWFHHeaderContainer}>
//             <View style={styles.upcomingWFHHeader}>
//               <Text style={styles.LateArrivalsTitle}>Employees WFH Today</Text>
//             </View>
//             <View>
//               <Animated.View style={{ transform: [{ scale: scaleAnims.wfhToday }] }}>
//                 <TouchableOpacity
//                   style={styles.WFHStatusIcon}
//                   activeOpacity={0.7}
//                   onPress={() => animatePress('wfhToday', () => handleExpandToggle(
//                     (expandedLeave === 8)
//                       ? null
//                       : 8
//                   ))}
//                 >
//                   <Feather
//                     name={(expandedLeave === 8) ? "minus" : "plus"}
//                     size={24}
//                     color="#4169E1"
//                   />
//                 </TouchableOpacity>
//               </Animated.View>
//             </View>
//           </View>

//           {(expandedLeave === 8) && (
//             <View style={styles.LeaveGrid}>
//               {/* Employee 1 */}
//               <View style={styles.LeaveCard}>
//                 <View style={styles.profileImage}>
//                   <Feather name="user" size={24} color="#4169E1" />
//                 </View>
//                 <View style={styles.LeaveCardContent}>
//                   <Text style={styles.LeaveCardTitle}>Arjun Reddy</Text>
//                   <Text style={styles.LeaveCardshow}>Client presentation preparation</Text>
//                 </View>
//                 <View style={styles.LeaveStatusIcon}>
//                   <Feather name="home" size={24} color="#4169E1" />
//                 </View>
//               </View>

//               {/* Employee 2 */}
//               <View style={styles.LeaveCard}>
//                 <View style={styles.profileImage}>
//                   <Feather name="user" size={24} color="#4169E1" />
//                 </View>
//                 <View style={styles.LeaveCardContent}>
//                   <Text style={styles.LeaveCardTitle}>Kavya Iyer</Text>
//                   <Text style={styles.LeaveCardshow}>Backend API development</Text>
//                 </View>
//                 <View style={styles.LeaveStatusIcon}>
//                   <Feather name="home" size={24} color="#4169E1" />
//                 </View>
//               </View>

//               {/* Employee 3 */}
//               <View style={styles.LeaveCard}>
//                 <View style={styles.profileImage}>
//                   <Feather name="user" size={24} color="#4169E1" />
//                 </View>
//                 <View style={styles.LeaveCardContent}>
//                   <Text style={styles.LeaveCardTitle}>Rohan Gupta</Text>
//                   <Text style={styles.LeaveCardshow}>Database optimization tasks</Text>
//                 </View>
//                 <View style={styles.LeaveStatusIcon}>
//                   <Feather name="home" size={24} color="#4169E1" />
//                 </View>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Employee Birthdays */}

//         <View style={styles.birthdayContainer}>
//           <View style={styles.birthdayHeaderContainer}>
//             <View style={styles.birthdayHeader}>
//               <Text style={styles.birthdayTitle}>All Birthdays 🎂</Text>
//             </View>
//             <View>
//               <Animated.View style={{ transform: [{ scale: scaleAnims.birthday }] }}>
//                 <TouchableOpacity
//                   style={styles.birthdayToggleIcon}
//                   activeOpacity={0.7}
//                   onPress={() => animatePress('birthday', () => handleExpandToggle(
//                     (expandedLeave === 9)
//                       ? null
//                       : 9
//                   ))}
//                 >
//                   <Feather
//                     name={(expandedLeave === 9) ? "minus" : "plus"}
//                     size={24}
//                     color="#d4145a"
//                   />
//                 </TouchableOpacity>
//               </Animated.View>
//             </View>
//           </View>

//           {(expandedLeave === 9) ? (
//             <View style={styles.birthdayGrid}>
//               {/* Employee 1 */}
//               <View style={styles.birthdayCard}>
//                 <View style={styles.birthdayProfileImage}>
//                   <Text style={styles.birthdayInitials}>SK</Text>
//                 </View>
//                 <View style={styles.birthdayCardContent}>
//                   <Text style={styles.birthdayCardName}>Sneha Kapoor</Text>
//                   <Text style={styles.birthdayCardDate}>December 12, 2024</Text>
//                 </View>
//                 <View style={styles.birthdayIcon}>
//                   <Text style={styles.birthdayEmoji}>🎉</Text>
//                 </View>
//               </View>

//               {/* Employee 2 */}
//               <View style={styles.birthdayCard}>
//                 <View style={styles.birthdayProfileImage}>
//                   <Text style={styles.birthdayInitials}>AM</Text>
//                 </View>
//                 <View style={styles.birthdayCardContent}>
//                   <Text style={styles.birthdayCardName}>Aditya Malhotra</Text>
//                   <Text style={styles.birthdayCardDate}>December 15, 2024</Text>
//                 </View>
//                 <View style={styles.birthdayIcon}>
//                   <Text style={styles.birthdayEmoji}>🎉</Text>
//                 </View>
//               </View>

//               {/* Employee 3 */}
//               <View style={styles.birthdayCard}>
//                 <View style={styles.birthdayProfileImage}>
//                   <Text style={styles.birthdayInitials}>PD</Text>
//                 </View>
//                 <View style={styles.birthdayCardContent}>
//                   <Text style={styles.birthdayCardName}>Pooja Deshmukh</Text>
//                   <Text style={styles.birthdayCardDate}>December 18, 2024</Text>
//                 </View>
//                 <View style={styles.birthdayIcon}>
//                   <Text style={styles.birthdayEmoji}>🎉</Text>
//                 </View>
//               </View>
//             </View>
//           ) : (
//             <View style={styles.birthdayEmptyState}>
//               <Text style={styles.birthdayEmptyText}>No birthdays today 🎈</Text>
//             </View>
//           )}
//         </View>


//       </ScrollView>

//     </SafeAreaView >
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: '#f0f2f5',
//   },
//   swipeContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   swipebody: {
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'flex-end',
//     backgroundColor: "#bfbfbfff",
//     paddingHorizontal: 20,
//     paddingVertical: 25,
//     borderRadius: 50,
//     position: 'relative',
//   },
//   arrowContainer: {
//     position: 'absolute',
//     left: 5,
//     backgroundColor: "Blue",
//     padding: 20,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   arrow: {
//     color: '#ffff',
//   },
//   swipeTextContainer: {
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   swipeText: {
//     fontSize: 14,
//     color: '#ffff',
//     marginTop: 5,
//   },
//   mainContainer: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: '#f0f2f5',
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   taskSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   taskText: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: 5,
//   },
//   taskCountText: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 5,
//   },
//   greetingSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   helloText: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: 5,
//   },
//   goodMorningText: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#000',
//     marginBottom: 10,
//   },
//   taskCountBold: {
//     fontWeight: '700',
//     color: '#000',
//   },

//   // checkIn

//   checkInContainer: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     paddingVertical: 20,
//     backgroundColor: '#4289f4ff',
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 15,
//     gap: 15,
//   },
//   checkInMainTextContainer: {
//     width: '100%',
//     alignItems: 'center',
//     paddingBottom: 10,
//   },
//   checkInMainText: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   checkInTextContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     gap: 10,
//   },

//   checkInScrollViewContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // width: '100%',
//     gap: 10,
//   },

//   checkInTextContainerLeft: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkInTextContainerRight: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkInText: {
//     width: '110%',
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#4289f4ff',
//   },


//   // checkInTrack
//   checkInTrackContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginTop: 10,
//     gap: 10,
//   },
//   checkInTrackCard: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 10,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: 150,
//   },
//   checkInTrackLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   checkInTrackCount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#000',
//     marginTop: 10,
//   },

//   // Leave Balance
//   leaveBalanceContainer: {
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 15,
//     padding: 10,
//   },
//   leaveBalanceHeader: {
//     marginBottom: 20,
//   },
//   leaveBalanceTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//   },
//   leaveBalanceGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: 15,
//   },
//   leaveBalanceCard: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//   },
//   leaveBadge: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   leaveBadgeText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#fff',
//     width: '50%',
//     textAlign: 'center',
//   },
//   leaveCount: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#000',
//     width: '50%',
//     textAlign: 'center',
//   },


//   // My Pending Requests
//   myPendingRequestsContainer: {
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//   },
//   myPendingRequestsHeader: {
//     marginBottom: 20,
//   },
//   myPendingRequestsTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//   },
//   myPendingRequestsGrid: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: 1,
//   },

//   myPendingRequestsCard: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     gap: 10,
//     // backgroundColor: '#3a74f1ff',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#cececeff',
//   },
//   myPendingRequestsCardHeader: {
//     flex: 1,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     gap: 10,
//     padding: 10,
//   },
//   myPendingRequestsiconcont: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     color: '#fff',
//   },
//   myPendingRequestsicon: {
//     fontSize: 24,
//   },
//   myPendingRequestsCardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     width: '80%',
//     color: '#000000ff',
//     textAlign: 'left',
//   },

//   // Late arrivals 

//   LateArrivalsContainer: {
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//   },
//   LateArrivalsHeader: {
//     marginBottom: 20,
//   },
//   LateArrivalsTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//   },
//   LateArrivalsGrid: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: 1,
//   },

//   LateArrivalsCard: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     gap: 10,
//     // backgroundColor: '#3a74f1ff',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#cececeff',
//   },
//   LateArrivalsCardHeader: {
//     flex: 1,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     gap: 10,
//     padding: 10,
//   },
//   LateArrivalsiconcont: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     color: '#fff',
//   },
//   LateArrivalsicon: {
//     fontSize: 24,
//   },
//   LateArrivalsCardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     width: '80%',
//     color: '#000000ff',
//     textAlign: 'left',
//   },


//   // Employ on Leave Today

//   LeaveContainer: {
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//   },
//   LeaveHeader: {
//     marginBottom: 20,
//   },
//   LeaveTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//   },
//   LeaveGrid: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: 1,
//   },

//   LeaveCard: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     gap: 10,
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#cececeff',
//   },
//   LeaveCardContent: {
//     flex: 1,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     gap: 5,
//   },
//   LeaveStatusIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   Leaveiconcont: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     color: '#fff',
//   },
//   Leaveicon: {
//     fontSize: 24,
//   },
//   LeaveCardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000000ff',
//   },
//   LeaveCardshow: {
//     fontSize: 14,
//     color: '#a0a0a0ff',
//   },

//   profileImage: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     backgroundColor: '#E0E8FF',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   // Expandable Leave Dropdown Styles
//   expandableLeaveCard: {
//     width: '100%',
//   },
//   expandedContent: {
//     backgroundColor: '#f9f9f9',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#cececeff',
//     gap: 10,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#333',
//     flex: 1,
//   },
//   detailTextApproved: {
//     fontSize: 14,
//     color: '#12df34ff',
//     fontWeight: '600',
//     flex: 1,
//   },
//   detailTextPending: {
//     fontSize: 14,
//     color: '#ff9800',
//     fontWeight: '600',
//     flex: 1,
//   },

//   // Upcoming WFHs Styles
//   upcomingWFHContainer: {
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//   },
//   upcomingWFHHeaderContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   upcomingWFHHeader: {
//     flex: 1,
//   },
//   upcomingWFHStatusIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   upcomingWFHGrid: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: 1,
//   },
//   expandableWFHCard: {
//     width: '100%',
//   },
//   WFHCardtop: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     gap: 10,
//     padding: 10,
//   },
//   WFHCard: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     gap: 10,
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#cececeff',
//   },
//   WFHCardContent: {
//     flex: 1,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     gap: 5,
//   },
//   WFHStatusIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   WFHCardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000000ff',
//   },
//   WFHCardshow: {
//     fontSize: 14,
//     color: '#a0a0a0ff',
//   },
//   upcomingWFHExpandedContent: {
//     backgroundColor: '#f9f9f9',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#cececeff',
//     gap: 10,
//   },

//   // Birthday Styles
//   birthdayContainer: {
//     backgroundColor: '#fef5e7',
//     marginHorizontal: 20,
//     marginTop: 10,
//     borderRadius: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//     borderWidth: 1,
//     borderColor: '#f9e79f',
//   },
//   birthdayHeaderContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   birthdayHeader: {
//     flex: 1,
//   },
//   birthdayTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#d4145a',
//     textAlign: 'center',
//   },
//   birthdayToggleIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   birthdayGrid: {
//     flexDirection: 'column',
//     gap: 10,
//   },
//   birthdayCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 12,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: '#f9e79f',
//   },
//   birthdayProfileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#8e44ad',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   birthdayInitials: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   birthdayCardContent: {
//     flex: 1,
//     gap: 4,
//   },
//   birthdayCardName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000',
//   },
//   birthdayCardDate: {
//     fontSize: 13,
//     color: '#666',
//   },
//   birthdayIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   birthdayEmoji: {
//     fontSize: 28,
//   },
//   birthdayEmptyState: {
//     paddingVertical: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   birthdayEmptyText: {
//     fontSize: 16,
//     color: '#999',
//     textAlign: 'center',
//   },

// })

// export default index


import Navbar from '@/components/Navigation/Navbar';
import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutAnimation, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of container width for easier swiping

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom animation configuration
const animationConfig = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

const index = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false); // New state to track if user has checked out
  const [hasEverCheckedIn, setHasEverCheckedIn] = useState(false);
  const [expandedLeave, setExpandedLeave] = useState<number | null>(null);
  const pan = useRef(new Animated.Value(0)).current;

  // Track current check-in state for pan responder
  const isCheckedInRef = useRef(false);
  const hasCheckedOutRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    isCheckedInRef.current = isCheckedIn;
  }, [isCheckedIn]);

  useEffect(() => {
    hasCheckedOutRef.current = hasCheckedOut;
  }, [hasCheckedOut]);

  const userName = 'Jainish';
  const tasksToComplete = 4;
  const totalTasks = 12;
  const totalReminders = 3;

  // Helper function to handle animated state changes
  const handleExpandToggle = (newValue: number | null) => {
    LayoutAnimation.configureNext(animationConfig);
    setExpandedLeave(newValue);
  };

  // Animated scale values for press feedback
  const scaleAnims = useRef({
    leave1: new Animated.Value(1),
    leave2: new Animated.Value(1),
    leave3: new Animated.Value(1),
    wfhMain: new Animated.Value(1),
    wfh1: new Animated.Value(1),
    wfh2: new Animated.Value(1),
    wfh3: new Animated.Value(1),
    wfhToday: new Animated.Value(1),
    birthday: new Animated.Value(1),
  }).current;

  // Helper function for press animation
  const animatePress = (animKey: keyof typeof scaleAnims, callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnims[animKey], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[animKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Don't allow swipe if already checked out
        return !hasCheckedOutRef.current;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Don't allow swipe if already checked out
        if (hasCheckedOutRef.current) return false;

        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Don't allow any movement if checked out
        if (hasCheckedOutRef.current) return;

        if (!isCheckedInRef.current && gestureState.dx >= 0) {
          // Swiping right when not checked in
          const maxSwipe = SCREEN_WIDTH - 115;
          pan.setValue(Math.min(gestureState.dx, maxSwipe));
        } else if (isCheckedInRef.current && gestureState.dx <= 0) {
          // Swiping left when checked in
          const newValue = SCREEN_WIDTH - 115 + gestureState.dx;
          pan.setValue(Math.max(newValue, 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Don't allow any action if checked out
        if (hasCheckedOutRef.current) return;

        if (!isCheckedInRef.current) {
          // Check-in flow (swipe right)
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swipe successful - check in
            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(() => {
              setIsCheckedIn(true);
              setHasEverCheckedIn(true);
            });
          } else {
            // Swipe not far enough - reset
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start();
          }
        } else {
          // Check-out flow (swipe left)
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Swipe successful - check out and DISABLE further swiping
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start(() => {
              setIsCheckedIn(false);
              setHasCheckedOut(true); // Disable all future swipes
            });
          } else {
            // Swipe not far enough - reset to checked in position
            Animated.spring(pan, {
              toValue: SCREEN_WIDTH - 115,
              useNativeDriver: false,
              friction: 8,
              tension: 40,
            }).start();
          }
        }
      },
    })
  ).current;

  // Function to get the swipe text
  const getSwipeText = () => {
    if (hasCheckedOut) {
      return 'Already Checked Out for Today';
    }
    if (isCheckedIn) {
      return 'Swipe Left to Check-Out';
    }
    return 'Swipe Right to Check-In';
  };

  // Function to get button background color
  const getButtonColor = () => {
    if (hasCheckedOut) {
      return '#999'; // Gray when disabled
    }
    if (isCheckedIn) {
      return '#ffe23dff'; // Yellow when checked in
    }
    return '#1472d6ff'; // Blue when not checked in
  };

  // Function to get button icon
  const getButtonIcon = (): "arrow-right" | "arrow-left" | "check" => {
    if (hasCheckedOut) {
      return 'check'; // Check mark when completed
    }
    if (isCheckedIn) {
      return 'arrow-left';
    }
    return 'arrow-right';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Navbar />

        {/* Main content */}
        <View style={styles.greetingSection}>
          <Text style={styles.helloText}>Hello {userName}!</Text>
        </View>

        <View style={styles.swipeContainer}>
          <View style={[
            styles.swipebody,
            hasCheckedOut && styles.swipebodyDisabled
          ]}>
            {/* Background text */}
            <View style={styles.swipeTextContainer}>
              <Text style={[
                styles.swipeText,
                hasCheckedOut && styles.swipeTextDisabled
              ]}>
                {getSwipeText()}
              </Text>
            </View>

            {/* Swipeable button */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ translateX: pan }],
                  backgroundColor: getButtonColor(),
                  opacity: hasCheckedOut ? 0.6 : 1,
                },
              ]}
              {...(hasCheckedOut ? {} : panResponder.panHandlers)}
            >
              <Feather
                style={[
                  styles.arrow,
                  {
                    color: hasCheckedOut ? '#fff' : isCheckedIn ? '#000000ff' : '#ffff',
                  }
                ]}
                name={getButtonIcon()}
                size={24}
              />
            </Animated.View>
          </View>
        </View>

        {/* Task Section - Hidden initially, shows after first check-in */}
        {hasEverCheckedIn && (
          <View style={styles.taskSection}>
            {isCheckedIn ? (
              <>
                <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
              </>
            ) : (
              <>
                <Text style={styles.taskText}>Total Task: {totalTasks}</Text>
                <Text style={styles.taskCountText}>
                  Tasks Completed: <Text style={styles.taskCountBold}>{totalTasks - tasksToComplete}</Text>
                </Text>
                <Text style={styles.taskCountText}>
                  Task Remaining: {tasksToComplete}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Status indicator when checked out */}
        {hasCheckedOut && (
          <View style={styles.checkedOutStatus}>
            <Feather name="check-circle" size={24} color="#12df34ff" />
            <Text style={styles.checkedOutText}>You have completed your check-in/check-out for today</Text>
          </View>
        )}

        <View style={styles.checkInContainer}>
          <View style={styles.checkInMainTextContainer}>
            <Text style={styles.checkInMainText}>Missed Pushed/ Check-Out</Text>
          </View>
          <View style={styles.checkInTextContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.checkInScrollViewContent}>
              <View style={styles.checkInTextContainerRight}>
                <Text style={styles.checkInText}>07 / Dec / 2025</Text>
              </View>
              <View style={styles.checkInTextContainerRight}>
                <Text style={styles.checkInText}>07 / Dec / 2025</Text>
              </View>
              <View style={styles.checkInTextContainerRight}>
                <Text style={styles.checkInText}>07 / Dec / 2025</Text>
              </View>
              <View style={styles.checkInTextContainerRight}>
                <Text style={styles.checkInText}>07 / Dec / 2025</Text>
              </View>
              <View style={styles.checkInTextContainerRight}>
                <Text style={styles.checkInText}>07 / Dec / 2025</Text>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Total checkIn, leave, Halfday */}
        <View style={styles.checkInTrackContainer}>
          <View style={styles.checkInTrackCard}>
            <Text style={styles.checkInTrackLabel}>Late Check In</Text>
            <Feather name="log-in" size={32} color="#4289f4ff" />
            <Text style={styles.checkInTrackCount}>0</Text>
          </View>

          <View style={styles.checkInTrackCard}>
            <Text style={styles.checkInTrackLabel}>Early Check Out</Text>
            <Feather name="log-out" size={32} color="#4289f4ff" />
            <Text style={styles.checkInTrackCount}>0</Text>
          </View>

          <View style={styles.checkInTrackCard}>
            <Text style={styles.checkInTrackLabel}>Half Day</Text>
            <Feather name="calendar" size={32} color="#4289f4ff" />
            <Text style={styles.checkInTrackCount}>0</Text>
          </View>
        </View>

        {/* Leave Balance Sheet */}
        <View style={styles.leaveBalanceContainer}>
          <View style={styles.leaveBalanceHeader}>
            <Text style={styles.leaveBalanceTitle}>Leave Balance</Text>
          </View>

          <View style={styles.leaveBalanceGrid}>
            {/* Privilege Leave (PL) */}
            <View style={styles.leaveBalanceCard}>
              <View style={[styles.leaveBadge, { backgroundColor: '#4caf50' }]}>
                <Text style={styles.leaveBadgeText}>PL</Text>
              </View>
              <Text style={styles.leaveCount}>10</Text>
            </View>

            {/* Casual Leave (CL) */}
            <View style={styles.leaveBalanceCard}>
              <View style={[styles.leaveBadge, { backgroundColor: '#2196f3' }]}>
                <Text style={styles.leaveBadgeText}>CL</Text>
              </View>
              <Text style={styles.leaveCount}>10</Text>
            </View>

            {/* Sick Leave (SL) */}
            <View style={styles.leaveBalanceCard}>
              <View style={[styles.leaveBadge, { backgroundColor: '#ff9800' }]}>
                <Text style={styles.leaveBadgeText}>SL</Text>
              </View>
              <Text style={styles.leaveCount}>10</Text>
            </View>

            {/* Absent (AB) */}
            <View style={styles.leaveBalanceCard}>
              <View style={[styles.leaveBadge, { backgroundColor: '#f44336' }]}>
                <Text style={styles.leaveBadgeText}>AB</Text>
              </View>
              <Text style={styles.leaveCount}>0</Text>
            </View>
          </View>
        </View>

        {/* My pending requests */}
        <View style={styles.myPendingRequestsContainer}>
          <View style={styles.myPendingRequestsHeader}>
            <Text style={styles.myPendingRequestsTitle}>My Pending Requests</Text>
          </View>

          <View style={styles.myPendingRequestsGrid}>
            <View style={styles.myPendingRequestsCard}>
              <View style={styles.myPendingRequestsiconcont}>
                <Feather style={styles.myPendingRequestsicon} name="check-circle" size={24} color="#12df34ff" />
              </View>
              <View style={styles.myPendingRequestsCardHeader}>
                <Text style={styles.myPendingRequestsCardTitle}>Leave Approvals</Text>
              </View>
            </View>
            <View style={styles.myPendingRequestsCard}>
              <View style={styles.myPendingRequestsiconcont}>
                <Feather style={styles.myPendingRequestsicon} name="clock" size={24} color="#f45742ff" />
              </View>
              <View style={styles.myPendingRequestsCardHeader}>
                <Text style={styles.myPendingRequestsCardTitle}>Miss Punch Approvals</Text>
              </View>
            </View>
            <View style={styles.myPendingRequestsCard}>
              <View style={styles.myPendingRequestsiconcont}>
                <Feather style={styles.myPendingRequestsicon} name="calendar" size={24} color="#2cb1f4ff" />
              </View>
              <View style={styles.myPendingRequestsCardHeader}>
                <Text style={styles.myPendingRequestsCardTitle}>Half Day Approvals</Text>
              </View>
            </View>
            <View style={styles.myPendingRequestsCard}>
              <View style={styles.myPendingRequestsiconcont}>
                <Feather style={styles.myPendingRequestsicon} name="log-out" size={24} color="#2d58e4ff" />
              </View>
              <View style={styles.myPendingRequestsCardHeader}>
                <Text style={styles.myPendingRequestsCardTitle}>Early Check-Out Approvals</Text>
              </View>
            </View>
            <View style={styles.myPendingRequestsCard}>
              <View style={styles.myPendingRequestsiconcont}>
                <Feather style={styles.myPendingRequestsicon} name="home" size={24} color="#f45742ff" />
              </View>
              <View style={styles.myPendingRequestsCardHeader}>
                <Text style={styles.myPendingRequestsCardTitle}>WFH Approval</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Late arrivals */}
        <View style={styles.LateArrivalsContainer}>
          <View style={styles.LateArrivalsHeader}>
            <Text style={styles.LateArrivalsTitle}>Late Arrivals Today</Text>
          </View>

          <View style={styles.LateArrivalsGrid}>
            <View style={styles.LateArrivalsCard}>
              <View style={styles.LateArrivalsiconcont}>
                <Feather style={styles.LateArrivalsicon} name="user" size={24} color="#4169E1" />
              </View>
              <View style={styles.LateArrivalsCardHeader}>
                <Text style={styles.LateArrivalsCardTitle}>No record available</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leave Early Today */}
        <View style={styles.LateArrivalsContainer}>
          <View style={styles.LateArrivalsHeader}>
            <Text style={styles.LateArrivalsTitle}>Leaving Early Today</Text>
          </View>

          <View style={styles.LateArrivalsGrid}>
            <View style={styles.LateArrivalsCard}>
              <View style={styles.LateArrivalsiconcont}>
                <Feather style={styles.LateArrivalsicon} name="user" size={24} color="#4169E1" />
              </View>
              <View style={styles.LateArrivalsCardHeader}>
                <Text style={styles.LateArrivalsCardTitle}>No record available</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Employees on Leave Today */}
        <View style={styles.LeaveContainer}>
          <View style={styles.LeaveHeader}>
            <Text style={styles.LateArrivalsTitle}>Employees on Leave Today</Text>
          </View>

          <View style={styles.LeaveGrid}>
            <View style={styles.LeaveCard}>
              <View style={styles.profileImage}>
                <Feather name="user" size={24} color="#4169E1" />
              </View>
              <View style={styles.LeaveCardContent}>
                <Text style={styles.LeaveCardTitle}>Prakesh Darji</Text>
                <Text style={styles.LeaveCardshow}>Sick Leave</Text>
              </View>
              <View style={styles.LeaveStatusIcon}>
                <Feather name="check-circle" size={24} color="#12df34ff" />
              </View>
            </View>

            <View style={styles.LeaveCard}>
              <View style={styles.profileImage}>
                <Feather name="user" size={24} color="#4169E1" />
              </View>
              <View style={styles.LeaveCardContent}>
                <Text style={styles.LeaveCardTitle}>Nipa Barot</Text>
                <Text style={styles.LeaveCardshow}>Privilege Leave</Text>
              </View>
              <View style={styles.LeaveStatusIcon}>
                <Feather name="check-circle" size={24} color="#12df34ff" />
              </View>
            </View>

            <View style={styles.LeaveCard}>
              <View style={styles.profileImage}>
                <Feather name="user" size={24} color="#4169E1" />
              </View>
              <View style={styles.LeaveCardContent}>
                <Text style={styles.LeaveCardTitle}>Hemant Patel</Text>
                <Text style={styles.LeaveCardshow}>Casual Leave</Text>
              </View>
              <View style={styles.LeaveStatusIcon}>
                <Feather name="check-circle" size={24} color="#12df34ff" />
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Leaves */}
        <View style={styles.LeaveContainer}>
          <View style={styles.LeaveHeader}>
            <Text style={styles.LateArrivalsTitle}>Upcoming Leaves</Text>
          </View>

          <View style={styles.LeaveGrid}>
            {/* Employee 1 - Expandable */}
            <View style={styles.expandableLeaveCard}>
              <Animated.View style={{ transform: [{ scale: scaleAnims.leave1 }] }}>
                <TouchableOpacity
                  style={styles.LeaveCard}
                  activeOpacity={0.7}
                  onPress={() => animatePress('leave1', () => handleExpandToggle(expandedLeave === 1 ? null : 1))}
                >
                  <View style={styles.profileImage}>
                    <Feather name="user" size={24} color="#4169E1" />
                  </View>
                  <View style={styles.LeaveCardContent}>
                    <Text style={styles.LeaveCardTitle}>Rajesh Kumar</Text>
                    <Text style={styles.LeaveCardshow}>Sick Leave • 12-15 Dec</Text>
                  </View>
                  <View style={styles.LeaveStatusIcon}>
                    <Feather
                      name={expandedLeave === 1 ? "chevron-up" : "chevron-down"}
                      size={24}
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {expandedLeave === 1 && (
                <View style={styles.expandedContent}>
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={16} color="#4289f4ff" />
                    <Text style={styles.detailText}>Duration: 12 Dec - 15 Dec (4 days)</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="file-text" size={16} color="#4289f4ff" />
                    <Text style={styles.detailText}>Reason: Medical treatment and recovery</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="clock" size={16} color="#ff9800" />
                    <Text style={styles.detailTextPending}>Status: Pending</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Employee 2 - Expandable */}
            <View style={styles.expandableLeaveCard}>
              <Animated.View style={{ transform: [{ scale: scaleAnims.leave2 }] }}>
                <TouchableOpacity
                  style={styles.LeaveCard}
                  activeOpacity={0.7}
                  onPress={() => animatePress('leave2', () => handleExpandToggle(expandedLeave === 2 ? null : 2))}
                >
                  <View style={styles.profileImage}>
                    <Feather name="user" size={24} color="#4169E1" />
                  </View>
                  <View style={styles.LeaveCardContent}>
                    <Text style={styles.LeaveCardTitle}>Priya Sharma</Text>
                    <Text style={styles.LeaveCardshow}>Casual Leave • 18 Dec</Text>
                  </View>
                  <View style={styles.LeaveStatusIcon}>
                    <Feather
                      name={expandedLeave === 2 ? "chevron-up" : "chevron-down"}
                      size={24}
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {expandedLeave === 2 && (
                <View style={styles.expandedContent}>
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={16} color="#4289f4ff" />
                    <Text style={styles.detailText}>Duration: 18 Dec (1 day)</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="file-text" size={16} color="#4289f4ff" />
                    <Text style={styles.detailText}>Reason: Personal work</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="clock" size={16} color="#ff9800" />
                    <Text style={styles.detailTextPending}>Status: Pending</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Employee 3 - Expandable */}
            <View style={styles.expandableLeaveCard}>
              <Animated.View style={{ transform: [{ scale: scaleAnims.leave3 }] }}>
                <TouchableOpacity
                  style={styles.LeaveCard}
                  activeOpacity={0.7}
                  onPress={() => animatePress('leave3', () => handleExpandToggle(expandedLeave === 3 ? null : 3))}
                >
                  <View style={styles.profileImage}>
                    <Feather name="user" size={24} color="#4169E1" />
                  </View>
                  <View style={styles.LeaveCardContent}>
                    <Text style={styles.LeaveCardTitle}>Amit Desai</Text>
                    <Text style={styles.LeaveCardshow}>Privilege Leave • 20-22 Dec</Text>
                  </View>
                  <View style={styles.LeaveStatusIcon}>
                    <Feather
                      name={expandedLeave === 3 ? "chevron-up" : "chevron-down"}
                      size={24}
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {expandedLeave === 3 && (
                <View style={styles.expandedContent}>
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={16} color="#4289f4ff" />
                    <Text style={styles.detailText}>Duration: 20 Dec - 22 Dec (3 days)</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="file-text" size={16} color="#4289f4ff" />
                    <Text style={styles.detailText}>Reason: Family function and vacation</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="clock" size={16} color="#ff9800" />
                    <Text style={styles.detailTextPending}>Status: Pending</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Upcoming WFHs */}
        <View style={styles.upcomingWFHContainer}>
          <View style={styles.upcomingWFHHeaderContainer}>
            <View style={styles.upcomingWFHHeader}>
              <Text style={styles.LateArrivalsTitle}>Upcoming WFHs</Text>
            </View>
            <View>
              <Animated.View style={{ transform: [{ scale: scaleAnims.wfhMain }] }}>
                <TouchableOpacity
                  style={styles.WFHStatusIcon}
                  activeOpacity={0.7}
                  onPress={() => animatePress('wfhMain', () => handleExpandToggle(
                    (expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7)
                      ? null
                      : 4
                  ))}
                >
                  <Feather
                    name={(expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7) ? "minus" : "plus"}
                    size={24}
                    color="#4169E1"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {(expandedLeave === 4 || expandedLeave === 5 || expandedLeave === 6 || expandedLeave === 7) && (
            <View style={styles.upcomingWFHGrid}>
              {/* Employee 1 - Expandable */}
              <View style={styles.expandableWFHCard}>
                <Animated.View style={{ transform: [{ scale: scaleAnims.wfh1 }] }}>
                  <TouchableOpacity
                    style={styles.WFHCard}
                    activeOpacity={0.7}
                    onPress={() => animatePress('wfh1', () => handleExpandToggle(expandedLeave === 5 ? 4 : 5))}
                  >
                    <View style={styles.profileImage}>
                      <Feather name="user" size={24} color="#4169E1" />
                    </View>
                    <View style={styles.WFHCardContent}>
                      <Text style={styles.WFHCardTitle}>Vikram Singh</Text>
                      <Text style={styles.WFHCardshow}>WFH • 12-15 Dec</Text>
                    </View>
                    <View style={styles.WFHStatusIcon}>
                      <Feather
                        name={expandedLeave === 5 ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#666"
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {expandedLeave === 5 && (
                  <View style={styles.upcomingWFHExpandedContent}>
                    <View style={styles.detailRow}>
                      <Feather name="calendar" size={16} color="#4289f4ff" />
                      <Text style={styles.detailText}>Duration: 12 Dec - 15 Dec (4 days)</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="file-text" size={16} color="#4289f4ff" />
                      <Text style={styles.detailText}>Reason: Project work from home</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="clock" size={16} color="#ff9800" />
                      <Text style={styles.detailTextPending}>Status: Pending</Text>
                    </View>
                  </View>
                )}
              </View>
              {/* Employee 2 - Expandable */}
              <View style={styles.expandableWFHCard}>
                <Animated.View style={{ transform: [{ scale: scaleAnims.wfh2 }] }}>
                  <TouchableOpacity
                    style={styles.WFHCard}
                    activeOpacity={0.7}
                    onPress={() => animatePress('wfh2', () => handleExpandToggle(expandedLeave === 6 ? 4 : 6))}
                  >
                    <View style={styles.profileImage}>
                      <Feather name="user" size={24} color="#4169E1" />
                    </View>
                    <View style={styles.WFHCardContent}>
                      <Text style={styles.WFHCardTitle}>Anjali Mehta</Text>
                      <Text style={styles.WFHCardshow}>WFH • 16-18 Dec</Text>
                    </View>
                    <View style={styles.WFHStatusIcon}>
                      <Feather
                        name={expandedLeave === 6 ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#666"
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {expandedLeave === 6 && (
                  <View style={styles.upcomingWFHExpandedContent}>
                    <View style={styles.detailRow}>
                      <Feather name="calendar" size={16} color="#4289f4ff" />
                      <Text style={styles.detailText}>Duration: 16 Dec - 18 Dec (3 days)</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="file-text" size={16} color="#4289f4ff" />
                      <Text style={styles.detailText}>Reason: Remote client meetings</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="clock" size={16} color="#ff9800" />
                      <Text style={styles.detailTextPending}>Status: Pending</Text>
                    </View>
                  </View>
                )}
              </View>
              {/* Employee 3 - Expandable */}
              <View style={styles.expandableWFHCard}>
                <Animated.View style={{ transform: [{ scale: scaleAnims.wfh3 }] }}>
                  <TouchableOpacity
                    style={styles.WFHCard}
                    activeOpacity={0.7}
                    onPress={() => animatePress('wfh3', () => handleExpandToggle(expandedLeave === 7 ? 4 : 7))}
                  >
                    <View style={styles.profileImage}>
                      <Feather name="user" size={24} color="#4169E1" />
                    </View>
                    <View style={styles.WFHCardContent}>
                      <Text style={styles.WFHCardTitle}>Suresh Patel</Text>
                      <Text style={styles.WFHCardshow}>WFH • 20 Dec</Text>
                    </View>
                    <View style={styles.WFHStatusIcon}>
                      <Feather
                        name={expandedLeave === 7 ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#666"
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {expandedLeave === 7 && (
                  <View style={styles.upcomingWFHExpandedContent}>
                    <View style={styles.detailRow}>
                      <Feather name="calendar" size={16} color="#4289f4ff" />
                      <Text style={styles.detailText}>Duration: 20 Dec (1 day)</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="file-text" size={16} color="#4289f4ff" />
                      <Text style={styles.detailText}>Reason: Personal appointment</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="clock" size={16} color="#ff9800" />
                      <Text style={styles.detailTextPending}>Status: Pending</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Employees Working from Home Today */}
        <View style={styles.upcomingWFHContainer}>
          <View style={styles.upcomingWFHHeaderContainer}>
            <View style={styles.upcomingWFHHeader}>
              <Text style={styles.LateArrivalsTitle}>Employees WFH Today</Text>
            </View>
            <View>
              <Animated.View style={{ transform: [{ scale: scaleAnims.wfhToday }] }}>
                <TouchableOpacity
                  style={styles.WFHStatusIcon}
                  activeOpacity={0.7}
                  onPress={() => animatePress('wfhToday', () => handleExpandToggle(
                    (expandedLeave === 8)
                      ? null
                      : 8
                  ))}
                >
                  <Feather
                    name={(expandedLeave === 8) ? "minus" : "plus"}
                    size={24}
                    color="#4169E1"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {(expandedLeave === 8) && (
            <View style={styles.LeaveGrid}>
              <View style={styles.LeaveCard}>
                <View style={styles.profileImage}>
                  <Feather name="user" size={24} color="#4169E1" />
                </View>
                <View style={styles.LeaveCardContent}>
                  <Text style={styles.LeaveCardTitle}>Arjun Reddy</Text>
                  <Text style={styles.LeaveCardshow}>Client presentation preparation</Text>
                </View>
                <View style={styles.LeaveStatusIcon}>
                  <Feather name="home" size={24} color="#4169E1" />
                </View>
              </View>

              <View style={styles.LeaveCard}>
                <View style={styles.profileImage}>
                  <Feather name="user" size={24} color="#4169E1" />
                </View>
                <View style={styles.LeaveCardContent}>
                  <Text style={styles.LeaveCardTitle}>Kavya Iyer</Text>
                  <Text style={styles.LeaveCardshow}>Backend API development</Text>
                </View>
                <View style={styles.LeaveStatusIcon}>
                  <Feather name="home" size={24} color="#4169E1" />
                </View>
              </View>

              <View style={styles.LeaveCard}>
                <View style={styles.profileImage}>
                  <Feather name="user" size={24} color="#4169E1" />
                </View>
                <View style={styles.LeaveCardContent}>
                  <Text style={styles.LeaveCardTitle}>Rohan Gupta</Text>
                  <Text style={styles.LeaveCardshow}>Database optimization tasks</Text>
                </View>
                <View style={styles.LeaveStatusIcon}>
                  <Feather name="home" size={24} color="#4169E1" />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Employee Birthdays */}
        <View style={styles.birthdayContainer}>
          <View style={styles.birthdayHeaderContainer}>
            <View style={styles.birthdayHeader}>
              <Text style={styles.birthdayTitle}>All Birthdays 🎂</Text>
            </View>
            <View>
              <Animated.View style={{ transform: [{ scale: scaleAnims.birthday }] }}>
                <TouchableOpacity
                  style={styles.birthdayToggleIcon}
                  activeOpacity={0.7}
                  onPress={() => animatePress('birthday', () => handleExpandToggle(
                    (expandedLeave === 9)
                      ? null
                      : 9
                  ))}
                >
                  <Feather
                    name={(expandedLeave === 9) ? "minus" : "plus"}
                    size={24}
                    color="#d4145a"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {(expandedLeave === 9) ? (
            <View style={styles.birthdayGrid}>
              <View style={styles.birthdayCard}>
                <View style={styles.birthdayProfileImage}>
                  <Text style={styles.birthdayInitials}>SK</Text>
                </View>
                <View style={styles.birthdayCardContent}>
                  <Text style={styles.birthdayCardName}>Sneha Kapoor</Text>
                  <Text style={styles.birthdayCardDate}>December 12, 2024</Text>
                </View>
                <View style={styles.birthdayIcon}>
                  <Text style={styles.birthdayEmoji}>🎉</Text>
                </View>
              </View>

              <View style={styles.birthdayCard}>
                <View style={styles.birthdayProfileImage}>
                  <Text style={styles.birthdayInitials}>AM</Text>
                </View>
                <View style={styles.birthdayCardContent}>
                  <Text style={styles.birthdayCardName}>Aditya Malhotra</Text>
                  <Text style={styles.birthdayCardDate}>December 15, 2024</Text>
                </View>
                <View style={styles.birthdayIcon}>
                  <Text style={styles.birthdayEmoji}>🎉</Text>
                </View>
              </View>

              <View style={styles.birthdayCard}>
                <View style={styles.birthdayProfileImage}>
                  <Text style={styles.birthdayInitials}>PD</Text>
                </View>
                <View style={styles.birthdayCardContent}>
                  <Text style={styles.birthdayCardName}>Pooja Deshmukh</Text>
                  <Text style={styles.birthdayCardDate}>December 18, 2024</Text>
                </View>
                <View style={styles.birthdayIcon}>
                  <Text style={styles.birthdayEmoji}>🎉</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.birthdayEmptyState}>
              <Text style={styles.birthdayEmptyText}>No birthdays today 🎈</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

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
  swipebodyDisabled: {
    backgroundColor: "#e0e0e0",
  },
  arrowContainer: {
    position: 'absolute',
    left: 5,
    backgroundColor: "Blue",
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
  swipeTextDisabled: {
    color: '#888',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    paddingBottom: 20,
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

  // Checked out status
  checkedOutStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  checkedOutText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    flex: 1,
  },

  // checkIn
  checkInContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#4289f4ff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    gap: 15,
  },
  checkInMainTextContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
  },
  checkInMainText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  checkInTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  checkInScrollViewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  checkInTextContainerLeft: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInTextContainerRight: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInText: {
    width: '110%',
    fontSize: 16,
    fontWeight: '600',
    color: '#4289f4ff',
  },

  // checkInTrack
  checkInTrackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    gap: 10,
  },
  checkInTrackCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 150,
  },
  checkInTrackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  checkInTrackCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: 10,
  },

  // Leave Balance
  leaveBalanceContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 10,
  },
  leaveBalanceHeader: {
    marginBottom: 20,
  },
  leaveBalanceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  leaveBalanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  leaveBalanceCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  leaveBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    width: '50%',
    textAlign: 'center',
  },
  leaveCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    width: '50%',
    textAlign: 'center',
  },

  // My Pending Requests
  myPendingRequestsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  myPendingRequestsHeader: {
    marginBottom: 20,
  },
  myPendingRequestsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  myPendingRequestsGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },
  myPendingRequestsCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cececeff',
  },
  myPendingRequestsCardHeader: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  myPendingRequestsiconcont: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
  },
  myPendingRequestsicon: {
    fontSize: 24,
  },
  myPendingRequestsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    width: '80%',
    color: '#000000ff',
    textAlign: 'left',
  },

  // Late arrivals
  LateArrivalsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  LateArrivalsHeader: {
    marginBottom: 20,
  },
  LateArrivalsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  LateArrivalsGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },
  LateArrivalsCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cececeff',
  },
  LateArrivalsCardHeader: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  LateArrivalsiconcont: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
  },
  LateArrivalsicon: {
    fontSize: 24,
  },
  LateArrivalsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    width: '80%',
    color: '#000000ff',
    textAlign: 'left',
  },

  // Employ on Leave Today
  LeaveContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  LeaveHeader: {
    marginBottom: 20,
  },
  LeaveTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  LeaveGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },
  LeaveCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cececeff',
  },
  LeaveCardContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  LeaveStatusIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Leaveiconcont: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
  },
  Leaveicon: {
    fontSize: 24,
  },
  LeaveCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
  },
  LeaveCardshow: {
    fontSize: 14,
    color: '#a0a0a0ff',
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E0E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expandable Leave Dropdown Styles
  expandableLeaveCard: {
    width: '100%',
  },
  expandedContent: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cececeff',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  detailTextApproved: {
    fontSize: 14,
    color: '#12df34ff',
    fontWeight: '600',
    flex: 1,
  },
  detailTextPending: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: '600',
    flex: 1,
  },

  // Upcoming WFHs Styles
  upcomingWFHContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  upcomingWFHHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  upcomingWFHHeader: {
    flex: 1,
  },
  upcomingWFHStatusIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingWFHGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },
  expandableWFHCard: {
    width: '100%',
  },
  WFHCardtop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  WFHCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cececeff',
  },
  WFHCardContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  WFHStatusIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  WFHCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
  },
  WFHCardshow: {
    fontSize: 14,
    color: '#a0a0a0ff',
  },
  upcomingWFHExpandedContent: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cececeff',
    gap: 10,
  },

  // Birthday Styles
  birthdayContainer: {
    backgroundColor: '#fef5e7',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#f9e79f',
  },
  birthdayHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  birthdayHeader: {
    flex: 1,
  },
  birthdayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d4145a',
    textAlign: 'center',
  },
  birthdayToggleIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birthdayGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  birthdayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f9e79f',
  },
  birthdayProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8e44ad',
    justifyContent: 'center',
    alignItems: 'center',
  },
  birthdayInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  birthdayCardContent: {
    flex: 1,
    gap: 4,
  },
  birthdayCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  birthdayCardDate: {
    fontSize: 13,
    color: '#666',
  },
  birthdayIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birthdayEmoji: {
    fontSize: 28,
  },
  birthdayEmptyState: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthdayEmptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default index;