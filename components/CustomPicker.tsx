import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  ListRenderItemInfo,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../utils/Colors';

interface CustomPickerProps {
  label?: string;
  options: string[];
  placeholder?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;
const ITEM_HEIGHT = 56; // Fixed height for better performance

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  options,
  placeholder = 'Select…',
  selectedValue,
  onValueChange,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 90,
    }).start();
  }, []);

  const close = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  }, []);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_MAX_HEIGHT, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const renderOption = useCallback(({ item }: ListRenderItemInfo<string>) => (
    <TouchableOpacity
      style={[
        styles.option,
        item === selectedValue && styles.optionSelected,
        { height: ITEM_HEIGHT }
      ]}
      onPress={() => {
        onValueChange(item);
        close();
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optionText,
          item === selectedValue && styles.optionTextSelected,
        ]}
        numberOfLines={1}
      >
        {item}
      </Text>
      {item === selectedValue && (
        <Ionicons name="checkmark-circle" size={24} color={Colors.mainBlue} />
      )}
    </TouchableOpacity>
  ), [selectedValue, onValueChange, close]);

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <View style={styles.container}>
      {label != null && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity 
        style={[
          styles.selector,
          selectedValue && styles.selectorActive
        ]} 
        onPress={open}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedValue && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedValue || placeholder}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={Colors.white}
          style={[
            styles.chevron,
            visible && styles.chevronUp
          ]}
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none">
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <TouchableWithoutFeedback onPress={close}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select an option</Text>
          </View>

          <FlatList
            data={options}
            keyExtractor={keyExtractor}
            renderItem={renderOption}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            contentContainerStyle={styles.listContent}
          />
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  selectorActive: {
    borderColor: Colors.mainBlue,
    backgroundColor: '#ffffff10',
  },
  selectorText: {
    color: Colors.white,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    opacity: 0.5,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SHEET_MAX_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ffffff33',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff15',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.select({ ios: 34, android: 16 }),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#ffffff08',
  },
  optionSelected: {
    backgroundColor: '#ffffff15',
    borderColor: Colors.mainBlue,
    borderWidth: 1,
  },
  optionText: {
    color: Colors.white,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  optionTextSelected: {
    color: Colors.mainBlue,
    fontWeight: '600',
  },
});

export default CustomPicker;
