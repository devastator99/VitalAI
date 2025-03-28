import Colors from '~/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const ATouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type Props = {
  onShouldSend: (message: string) => void;
};

const MessageInput = forwardRef(({ onShouldSend }: Props, ref) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const expanded = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    isTyping,
  }));

  const expandItems = () => {
    expanded.value = withTiming(1, { duration: 400 });
  };

  const collapseItems = () => {
    expanded.value = withTiming(0, { duration: 400 });
  };

  const expandButtonStyle = useAnimatedStyle(() => {
    const opacityInterpolation = interpolate(expanded.value, [0, 1], [1, 0], Extrapolation.CLAMP);
    const widthInterpolation = interpolate(expanded.value, [0, 1], [30, 0], Extrapolation.CLAMP);

    return {
      opacity: opacityInterpolation,
      width: widthInterpolation,
    };
  });

  const buttonViewStyle = useAnimatedStyle(() => {
    const widthInterpolation = interpolate(expanded.value, [0, 1], [0, 100], Extrapolation.CLAMP);
    return {
      width: widthInterpolation,
      opacity: expanded.value,
    };
  });

  const onChangeText = (text: string) => {
    collapseItems();
    setMessage(text);
    setIsTyping(!!text);
  };

  const onSend = () => {
    onShouldSend(message);
    setMessage('');
    setIsTyping(false);
  };

  const onSelectCard = (text: string) => {
    onShouldSend(text);
  };

  const handleFileSelect = async (type: 'camera' | 'gallery' | 'document') => {
    try {
      let result;
      switch(type) {
        case 'camera':
          result = await ImagePicker.launchCameraAsync();
          break;
        case 'gallery':
          result = await ImagePicker.launchImageLibraryAsync();
          break;
        case 'document':
          result = await DocumentPicker.getDocumentAsync();
          break;
      }
      
      if (!result?.canceled) {
        onShouldSend(JSON.stringify(result));
      }
    } catch (error) {
      console.error('File selection error:', error);
    }
  };

  

  return (
    <Animated.View style={[styles.header1, { paddingBottom: bottom, paddingTop: 10}]}>
      {/* <BlurView
              intensity={70}
              tint="dark"
              experimentalBlurMethod={"dimezisBlurView"}> */}
      <View style={styles.row}>
        <ATouchableOpacity onPress={expandItems} style={[styles.roundBtn, expandButtonStyle]}>
          <Ionicons name="add" size={24} color={Colors.greyLight} />
        </ATouchableOpacity>

        <Animated.View style={[styles.buttonView, buttonViewStyle]}>
          <TouchableOpacity onPress={() => handleFileSelect('camera')}>
            <Ionicons name="camera-outline" size={24} color={Colors.greyLight} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFileSelect('gallery')}>
            <Ionicons name="image-outline" size={24} color={Colors.greyLight} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFileSelect('document')}>
            <Ionicons name="folder-outline" size={24} color={Colors.greyLight} />
          </TouchableOpacity>
        </Animated.View>

        <TextInput
          autoFocus
          ref={inputRef}
          placeholder="Message"
          placeholderTextColor={"#ffffff"}
          style={[styles.messageInput, { backgroundColor: 'rgba(0, 0, 0, 0.2)', color: '#ffffff' }]}
          onFocus={collapseItems}
          onChangeText={onChangeText}
          value={message}
          multiline
        />
        {message.length > 0 ? (
          <TouchableOpacity onPress={onSend}>
            <Ionicons name="arrow-up-circle" size={24} color={Colors.greyLight} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <FontAwesome5 name="microphone-alt" size={24} color={Colors.greyLight} />
          </TouchableOpacity>
        )}
      </View>
      {/* </BlurView> */}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  header1:{
    zIndex: 1000,
  },
  row: {
    height:60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: "rgb(12, 15, 18)",
  },
  messageInput: {
    flex: 1,
    marginHorizontal: 10,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 10,
    borderColor: Colors.primary,
    backgroundColor: Colors.light,
  },
  roundBtn: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default MessageInput;
