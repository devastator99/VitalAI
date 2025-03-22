import { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView,Button, TouchableOpacity } from 'react-native';
import { RadioButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Easing } from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';

const SettingsScreen = () => {
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [language, setLanguage] = useState('en');
  const {signOut} = useAuth();

  const ThemeOption = ({ value, label, icon }: any) => (
    <TouchableOpacity 
      style={styles.radioContainer}
      onPress={() => setTheme(value)}
    >
      <Ionicons name={icon} size={24} color="#4F46E5" />
      <Text style={styles.radioLabel}>{label}</Text>
      <RadioButton
        value={value}
        status={theme === value ? 'checked' : 'unchecked'}
        color="#4F46E5"
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Appearance Section */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <ThemeOption value="light" label="Light Mode" icon="sunny" />
        <Divider style={styles.divider} />
        <ThemeOption value="dark" label="Dark Mode" icon="moon" />
        <Divider style={styles.divider} />
        <ThemeOption value="system" label="System Default" icon="phone-portrait" />
      </Animated.View>

      {/* Preferences Section */}
      <Animated.View entering={FadeIn.duration(400).delay(50)} style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingItem}>
          <View style={styles.iconText}>
            <Ionicons name="notifications" size={20} color="#4F46E5" />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={notifications ? '#4F46E5' : '#F3F4F6'}
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.settingItem}>
          <View style={styles.iconText}>
            <Ionicons name="finger-print" size={20} color="#4F46E5" />
            <Text style={styles.settingLabel}>Biometric Login</Text>
          </View>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={biometric ? '#4F46E5' : '#F3F4F6'}
            value={biometric}
            onValueChange={setBiometric}
          />
        </View>
      </Animated.View>

      {/* Account Section */}
      <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Change Email</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>App Version 1.2.4</Text>
        <Button
        title="Sign Out"
        onPress={() => signOut()}
        color="#ff3300"
      />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 24,
    fontFamily: 'Inter-Bold',
  },
  card: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#D1D5DB',
    fontFamily: 'Inter-Medium',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  radioLabel: {
    fontSize: 16,
    color: '#D1D5DB',
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Medium',
  },
  divider: {
    backgroundColor: '#4B5563',
    height: 1,
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  versionText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default SettingsScreen;