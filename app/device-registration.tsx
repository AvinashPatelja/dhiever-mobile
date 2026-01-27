import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { deviceAPI } from '@/services/api';

interface DeviceMappingRequest {
  userName: string;
  tPImei: string;
  gVImei: string;
  tpActive: boolean;
  gvActive: boolean;
  defaultGV: boolean;
}

export default function DeviceRegistrationScreen() {
  const [form, setForm] = useState<DeviceMappingRequest>({
    userName: '',
    tPImei: '',
    gVImei: '',
    tpActive: true,
    gvActive: true,
    defaultGV: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: keyof DeviceMappingRequest, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.userName || !form.tPImei || !form.gVImei) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setLoading(true);
    try {
      await deviceAPI.upsertMapping(form);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Device mapping saved successfully ✅',
      });
    } catch (error: any) {
      console.error('Device mapping failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data || 'Something went wrong ❌',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Device Registration</Text>

        <Text style={styles.label}>User Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter user name"
          placeholderTextColor="#999"
          value={form.userName}
          onChangeText={(value) => handleChange('userName', value)}
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>TP IMEI *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter TP IMEI"
          placeholderTextColor="#999"
          value={form.tPImei}
          onChangeText={(value) => handleChange('tPImei', value)}
          editable={!loading}
        />

        <Text style={styles.label}>GV IMEI *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter GV IMEI"
          placeholderTextColor="#999"
          value={form.gVImei}
          onChangeText={(value) => handleChange('gVImei', value)}
          editable={!loading}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>TP Active</Text>
          <Switch
            value={form.tpActive}
            onValueChange={(value) => handleChange('tpActive', value)}
            trackColor={{ false: '#ddd', true: '#027368' }}
            thumbColor={form.tpActive ? '#fff' : '#f4f3f4'}
            disabled={loading}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>GV Active</Text>
          <Switch
            value={form.gvActive}
            onValueChange={(value) => handleChange('gvActive', value)}
            trackColor={{ false: '#ddd', true: '#027368' }}
            thumbColor={form.gvActive ? '#fff' : '#f4f3f4'}
            disabled={loading}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Default GV</Text>
          <Switch
            value={form.defaultGV}
            onValueChange={(value) => handleChange('defaultGV', value)}
            trackColor={{ false: '#ddd', true: '#027368' }}
            thumbColor={form.defaultGV ? '#fff' : '#f4f3f4'}
            disabled={loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save / Update</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#027368',
    textAlign: 'center',
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#027368',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  backButtonText: {
    color: '#027368',
    fontSize: 16,
    fontWeight: '600',
  },
});