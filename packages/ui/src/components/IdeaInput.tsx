import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export function IdeaInput({ style, ...props }: TextInputProps) {
    return (
        <TextInput
            style={[styles.input, style]}
            multiline
            placeholderTextColor="#a0a0a0"
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        minHeight: 120,
        backgroundColor: 'transparent',
        fontSize: 18,
        lineHeight: 28,
        fontFamily: 'System',
        color: '#333',
        textAlignVertical: 'top',
    }
});
