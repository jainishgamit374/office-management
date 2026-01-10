import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import ApprovalHistoryList from './ApprovalHistoryList';

interface ApprovalHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    tranId: number;
    progId: number;
    employeeName?: string;
}

const ApprovalHistoryModal: React.FC<ApprovalHistoryModalProps> = ({
    visible,
    onClose,
    tranId,
    progId,
    employeeName
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Approval History</Text>
                            {employeeName && (
                                <Text style={styles.subtitle}>{employeeName}</Text>
                            )}
                        </View>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="#333" />
                        </Pressable>
                    </View>

                    <View style={styles.body}>
                        <ApprovalHistoryList tranId={tranId} progId={progId} />
                    </View>

                    <View style={styles.footer}>
                        <Pressable style={styles.doneButton} onPress={onClose}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    body: {
        flex: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    doneButton: {
        backgroundColor: '#4A90FF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ApprovalHistoryModal;
