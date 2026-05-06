import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Theme } from '../theme';

type ConfirmModalProps = {
    visible: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    children?: React.ReactNode;
};

export function ConfirmModal({
    visible, title, onConfirm, onCancel,
    confirmText = "Confirm", cancelText = "Cancel", children
}: ConfirmModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    {children}
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
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    dialog: { 
        width: '85%', 
        backgroundColor: Theme.colors.surface, 
        borderRadius: Theme.borderRadius.lg, 
        padding: Theme.spacing.lg,
        ...Theme.shadows.medium 
    },
    title: { 
        fontSize: 20, 
        fontWeight: '700', 
        color: Theme.colors.text, 
        marginBottom: Theme.spacing.md,
        textAlign: 'center'
    },
    row: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: Theme.spacing.md,
        marginTop: Theme.spacing.lg 
    },
    btn: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: Theme.borderRadius.md, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelBtn: { 
        backgroundColor: Theme.colors.secondary 
    },
    submitBtn: { 
        backgroundColor: Theme.colors.primary 
    },
    cancelText: { 
        color: Theme.colors.textSecondary, 
        fontWeight: '600',
        fontSize: 16
    },
    submitText: { 
        color: Theme.colors.surface, 
        fontWeight: '600',
        fontSize: 16
    }
});
