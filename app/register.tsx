import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authAPI } from '@/services/api';
import { RegisterRequest } from '@/types';

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterRequest>({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    imei: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.userName || !formData.firstName || !formData.lastName ||
        !formData.email || !formData.password || !formData.imei) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(formData);

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Redirecting to login...',
      });

      setTimeout(() => {
        router.replace('/');
      }, 2000);
    } catch (error: any) {
      console.error('Registration failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'An error occurred during registration',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.registerBox}>
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="User Name"
            placeholderTextColor="#999"
            value={formData.userName}
            onChangeText={(value) => handleChange('userName', value)}
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#999"
            value={formData.firstName}
            onChangeText={(value) => handleChange('firstName', value)}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#999"
            value={formData.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="IMEI"
            placeholderTextColor="#999"
            value={formData.imei}
            onChangeText={(value) => handleChange('imei', value)}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  registerBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#027368',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#027368',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#027368',
    fontSize: 14,
    fontWeight: 'bold',
  },
});