import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';

type ConfirmModalProps = {
    visible: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
};

export function ConfirmModal({
    visible, title, onConfirm, onCancel,
    confirmText = "Confirm", cancelText = "Cancel"
}: ConfirmModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.row}>
                        <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </Pressable>
                        <Pressable style={[styles.btn, styles.submitBtn]} onPress={onConfirm}>
                            <Text style={styles.submitText}>{confirmText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    dialog: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '80%' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#f0f0f0' },
    submitBtn: { backgroundColor: '#3b82f6' },
    cancelText: { color: '#333', fontWeight: 'bold' },
    submitText: { color: 'white', fontWeight: 'bold' }
});
