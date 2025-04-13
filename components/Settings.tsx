import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '~/utils/Colors';
import AnimHeader from './AnimHeader';

const Settings = () => {
  const settingsSections = [
    {
      title: 'Account',
      icon: 'users',
      items: [
        { label: 'Profile', icon: 'user-circle', action: 'Profile' },
        { label: 'Security', icon: 'shield-alt', action: 'Security' },
        { label: 'Payment Methods', icon: 'credit-card', action: 'Payments' },
      ],
    },
    {
      title: 'Preferences',
      icon: 'sliders-h',
      items: [
        { label: 'Appearance', icon: 'palette', action: 'Appearance' },
        { label: 'Notifications', icon: 'bell', action: 'Notifications' },
        { label: 'Language', icon: 'language', action: 'Language' },
      ],
    },
    {
      title: 'Support',
      icon: 'life-ring',
      items: [
        { label: 'Help Center', icon: 'question-circle', action: 'Help' },
        { label: 'Contact Us', icon: 'envelope', action: 'Contact' },
        { label: 'About', icon: 'info-circle', action: 'About' },
      ],
    },
  ];

  return (
    <LinearGradient
      colors={[Colors.PitchBlack, '#001a33', Colors.PitchBlack]}
      style={styles.container}
    >
      <AnimHeader
        title="Settings"
        rightIcons={[
          { icon: 'cog', onPress: () => console.log('Settings pressed') },
        ]}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {settingsSections.map((section, index) => (
            <LinearGradient
              key={index}
              colors={['#ffffff08', '#00254d33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionCard}
            >
              <View style={styles.sectionHeader}>
                <FontAwesome5 name={section.icon} size={18} color={Colors.mainBlue} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemContent}>
                    <FontAwesome5 name={item.icon} size={16} color="white" />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ffffff66" />
                </TouchableOpacity>
              ))}
            </LinearGradient>
          ))}

          <LinearGradient
            colors={[Colors.mainBlue + 'dd', '#00254d']}
            style={styles.logoutButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.logoutTouchable}>
              <Text style={styles.logoutText}>Log Out</Text>
              <Ionicons name="log-out" size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </AnimHeader>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff15',
    gap: 12,
  },
  sectionTitle: {
    color: Colors.mainBlue,
    fontSize: 18,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff08',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  itemLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  logoutButton: {
    borderRadius: 15,
    marginTop: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.mainBlue + '66',
  },
  logoutTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Settings; 