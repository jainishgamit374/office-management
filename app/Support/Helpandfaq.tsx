import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FAQItem = {
    question: string;
    answer: string;
};

type Technology = {
    name: string;
    icon: string;
    color: string;
};

const Helpandfaq = () => {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const technologies: Technology[] = [
        { name: 'MERN Stack', icon: 'database', color: '#4A90FF' },
        { name: 'MEAN Stack', icon: 'code', color: '#FF5252' },
        { name: 'Python Django', icon: 'terminal', color: '#4CAF50' },
        { name: 'React Native', icon: 'smartphone', color: '#00BCD4' },
        { name: 'Java (Spring Boot)', icon: 'coffee', color: '#FF9800' },
        { name: 'Android/iOS Dev', icon: 'tablet', color: '#9C27B0' },
    ];

    const services = [
        { title: 'Internships', icon: 'briefcase', description: 'Full-stack development internships' },
        { title: 'Interview Guide', icon: 'help-circle', description: 'Comprehensive interview preparation' },
        { title: 'Resume Building', icon: 'file-text', description: 'Professional resume crafting' },
        { title: 'GitHub Profile', icon: 'github', description: 'Portfolio optimization' },
        { title: 'Weekly Assessments', icon: 'check-square', description: 'Regular skill evaluations' },
        { title: 'Code Review', icon: 'eye', description: 'Expert code feedback' },
        { title: 'Offer Letter', icon: 'award', description: 'Official internship offer' },
        { title: 'Certificate', icon: 'file', description: 'Completion certificate' },
    ];

    const faqs: FAQItem[] = [
        {
            question: 'What internship programs do you offer?',
            answer: 'We offer comprehensive internship programs across multiple technology stacks including MERN Stack, MEAN Stack, Python Django, React Native, Java (Spring Boot), and Android/iOS app development. Each program includes hands-on projects, mentorship, and industry-standard practices.',
        },
        {
            question: 'What services are included in the internship?',
            answer: 'Our internship program includes interview preparation guides, professional resume building, GitHub profile optimization, weekly technical assessments, expert code reviews, official offer letters, and internship completion certificates.',
        },
        {
            question: 'How long is the internship duration?',
            answer: 'Our internship programs typically run for 2-6 months depending on the technology stack and your learning pace. We offer flexible schedules to accommodate students and working professionals.',
        },
        {
            question: 'Will I receive a certificate upon completion?',
            answer: 'Yes! Upon successful completion of the internship program, you will receive an official internship completion certificate that validates your skills and experience in your chosen technology stack.',
        },
        {
            question: 'What is included in the weekly assessments?',
            answer: 'Weekly assessments include coding challenges, project milestones, technical quizzes, and practical assignments designed to reinforce your learning and track your progress throughout the internship.',
        },
        {
            question: 'How does the code review process work?',
            answer: 'Our experienced developers review your code submissions, providing detailed feedback on best practices, optimization opportunities, code quality, and architectural improvements to help you grow as a developer.',
        },
        {
            question: 'Do you provide placement assistance?',
            answer: 'Yes, we provide comprehensive placement assistance including resume preparation, interview coaching, mock interviews, and connections to our hiring partner network.',
        },
        {
            question: 'Can I switch technology stacks during the internship?',
            answer: 'While we recommend completing one stack thoroughly, we understand learning needs vary. Please discuss with your mentor if you wish to explore additional technologies.',
        },
    ];

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.headerTitle}>Help & FAQ</Text>
                    <Text style={styles.headerSubtitle}>
                        Learn about our internship programs and services
                    </Text>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="info" size={20} color="#4A90FF" />
                        <Text style={styles.sectionTitle}>About Our Services</Text>
                    </View>
                    <View style={styles.aboutCard}>
                        <Text style={styles.aboutText}>
                            We are a product-based company offering comprehensive internship programs
                            across multiple technology stacks. Our mission is to bridge the gap between
                            academic learning and industry requirements through hands-on experience,
                            mentorship, and professional development.
                        </Text>
                    </View>
                </View>

                {/* Technologies Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="code" size={20} color="#4A90FF" />
                        <Text style={styles.sectionTitle}>Technologies We Offer</Text>
                    </View>
                    <View style={styles.techGrid}>
                        {technologies.map((tech, index) => (
                            <View key={index} style={styles.techCard}>
                                <View
                                    style={[
                                        styles.techIconContainer,
                                        { backgroundColor: `${tech.color}20` },
                                    ]}
                                >
                                    <Feather name={tech.icon as any} size={24} color={tech.color} />
                                </View>
                                <Text style={styles.techName}>{tech.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Services Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="star" size={20} color="#4A90FF" />
                        <Text style={styles.sectionTitle}>Services Included</Text>
                    </View>
                    <View style={styles.servicesGrid}>
                        {services.map((service, index) => (
                            <View key={index} style={styles.serviceCard}>
                                <View style={styles.serviceIconContainer}>
                                    <Feather name={service.icon as any} size={20} color="#4A90FF" />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>{service.title}</Text>
                                    <Text style={styles.serviceDescription}>
                                        {service.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="help-circle" size={20} color="#4A90FF" />
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    </View>
                    <View style={styles.faqContainer}>
                        {faqs.map((faq, index) => (
                            <View key={index} style={styles.faqItem}>
                                <Pressable
                                    style={styles.faqQuestion}
                                    onPress={() => toggleFAQ(index)}
                                >
                                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                    <Feather
                                        name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#666"
                                    />
                                </Pressable>
                                {expandedFAQ === index && (
                                    <View style={styles.faqAnswer}>
                                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.contactSection}>
                    <View style={styles.contactCard}>
                        <Feather name="mail" size={32} color="#4A90FF" />
                        <Text style={styles.contactTitle}>Still have questions?</Text>
                        <Text style={styles.contactText}>
                            Feel free to reach out to our support team for any additional queries
                        </Text>
                        <TouchableOpacity style={styles.contactButtonContainer}>
                            <Text style={styles.contactButton}>Contact Us</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Header
    headerSection: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#999',
        lineHeight: 20,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },

    // About
    aboutCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    aboutText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },

    // Technologies
    techGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    techCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    techIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    techName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },

    // Services
    servicesGrid: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceContent: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    serviceDescription: {
        fontSize: 12,
        color: '#999',
    },

    // FAQ
    faqContainer: {
        gap: 12,
    },
    faqItem: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        gap: 12,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        lineHeight: 22,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },

    // Contact
    contactSection: {
        marginTop: 8,
    },
    contactCard: {
        // backgroundColor: '#0d6baeff',
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BBDEFB',
        width: '100%',
        overflow: 'hidden',
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginTop: 12,
        marginBottom: 6,
        width: '100%',
        textAlign: 'center',
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
        width: '100%',
    },
    contactButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    contactButton: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
        backgroundColor: '#4A90FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        width: '50%',
        textAlign: 'center',
    },

});

export default Helpandfaq;