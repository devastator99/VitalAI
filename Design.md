# **Cura Health App - Architecture & Low-Level Design**

## **App Overview**
Build a comprehensive healthcare and wellness mobile application called "Cura Health" that provides AI-powered health assistance, habit tracking, personalized meal planning, and exercise integration. The app should feature real-time chat with an AI health assistant, detailed user profiling through questionnaires, and role-based access control for users, doctors, dieticians, and admins.

## **Core Features**
1. **🤖 AI-Powered Health Assistant**
   - Real-time chat interface with AI integration (OpenAI + Google Generative AI)
   - Personalized health advice and support
   - Message persistence with media sharing capabilities
   - Context-aware conversations

2. **📊 Habit Tracking System**
   - Custom habit creation with categories (boolean, numeric, categorical)
   - Progress visualization and streak tracking
   - Daily habit entries with notes
   - Achievement system and analytics

3. **🍎 Personalized Meal Planning**
   - Comprehensive meal database with nutritional information
   - Recipe management with ingredients and instructions
   - Daily meal plans assigned by dieticians
   - Calorie tracking and nutritional analysis
   - Dietary preferences and restrictions support

4. **💪 Exercise Integration**
   - Exercise library with categories (strength, cardio, flexibility, balance)
   - Workout plans and progress tracking
   - Video tutorials and equipment requirements
   - Completion tracking and statistics

5. **👥 User Management & Authentication**
   - Secure authentication with Clerk
   - Role-based access (user, doctor, dietician, admin)
   - User approval workflow
   - Profile management with detailed health information

## **Technical Architecture**

### **Frontend Stack**
- **Framework**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation with Expo Router
  - Stack navigation for auth flows
  - Tab navigation for main app sections
  - Drawer navigation for secondary features
- **Animations**: React Native Reanimated
- **UI Components**:
  - React Native Paper for Material Design
  - React Native Gifted Chat for messaging
  - Custom animated components
- **State Management**: Zustand
- **Icons**: Expo Vector Icons

### **Backend Stack**
- **Primary Backend**: Convex (real-time backend as a service)
- **Authentication**: Clerk with custom auth configuration
- **AI Integration**:
  - OpenAI API for chat completion
  - Google Generative AI as backup
- **File Storage**: Convex storage for media files
- **Payment Processing**: Razorpay integration

---

# **DETAILED LOW-LEVEL DESIGN (LLD)**

## **1. Component Architecture & Implementation**

### **Authentication System**

#### **ClerkAuthProvider Component**
```typescript
// File: components/auth/ClerkAuthProvider.tsx
interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  userId: string | null;
  userRole: 'user' | 'doctor' | 'dietician' | 'admin' | null;
}

const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isSignedIn: false,
    userId: null,
    userRole: null,
  });

  useEffect(() => {
    // Initialize Clerk authentication
    const initAuth = async () => {
      try {
        const user = await Clerk.user();
        const userRole = await getUserRole(user.id);
        setAuthState({
          user,
          isLoading: false,
          isSignedIn: !!user,
          userId: user?.id || null,
          userRole,
        });
      } catch (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  if (authState.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **RoleBasedGuard Component**
```typescript
// File: components/auth/RoleBasedGuard.tsx
interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: ('user' | 'doctor' | 'dietician' | 'admin')[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  redirectTo
}) => {
  const { userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && userRole && !allowedRoles.includes(userRole)) {
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        // Show unauthorized message
        Alert.alert('Access Denied', 'You do not have permission to access this feature.');
      }
    }
  }, [userRole, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || <UnauthorizedView />;
  }

  return <>{children}</>;
};
```

### **Chat System Implementation**

#### **MessageBubble Component**
```typescript
// File: components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  showAvatar?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  isTyping?: boolean;
}

interface MessageBubbleState {
  isLoading: boolean;
  showTimestamp: boolean;
  isHighlighted: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  showAvatar = false,
  onPress,
  onLongPress,
  isTyping = false,
}) => {
  const [state, setState] = useState<MessageBubbleState>({
    isLoading: false,
    showTimestamp: false,
    isHighlighted: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLongPress = () => {
    Vibration.vibrate(50);
    setState(prev => ({ ...prev, isHighlighted: true }));
    onLongPress?.();

    // Reset highlight after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, isHighlighted: false }));
    }, 200);
  };

  const bubbleStyle = useMemo(() => ({
    backgroundColor: isUser ? '#539DF3' : 'rgba(255, 255, 255, 0.1)',
    borderWidth: isUser ? 0 : 1,
    borderColor: isUser ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: Dimensions.get('window').width * 0.75,
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    marginVertical: 4,
    shadowColor: isUser ? '#539DF3' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }), [isUser]);

  return (
    <Animated.View
      style={[
        bubbleStyle,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: state.isHighlighted
            ? (isUser ? '#3d87d9' : 'rgba(255, 255, 255, 0.2)')
            : bubbleStyle.backgroundColor,
        },
      ]}
    >
      {/* AI Message Neon Line */}
      {!isUser && (
        <View style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: '#539DF3',
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          shadowColor: '#539DF3',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 10,
        }} />
      )}

      <TouchableOpacity
        onPress={() => setState(prev => ({ ...prev, showTimestamp: !prev.showTimestamp }))}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {showAvatar && !isUser && (
            <Image
              source={{ uri: message.sender?.avatar }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 12,
              }}
            />
          )}

          <View style={{ flex: 1 }}>
            {message.type === 'text' ? (
              <Text style={{
                color: isUser ? '#FFFFFF' : '#E5E7EB',
                fontSize: 16,
                lineHeight: 22,
                fontWeight: '400',
              }}>
                {message.content}
              </Text>
            ) : message.type === 'image' ? (
              <Image
                source={{ uri: message.attachId }}
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: 12,
                  marginVertical: 8,
                }}
                resizeMode="cover"
                onLoadStart={() => setState(prev => ({ ...prev, isLoading: true }))}
                onLoadEnd={() => setState(prev => ({ ...prev, isLoading: false }))}
              />
            ) : null}

            {isTyping && (
              <TypingIndicator
                color={isUser ? '#FFFFFF' : '#539DF3'}
                size={4}
              />
            )}
          </View>
        </View>

        {/* Timestamp */}
        {state.showTimestamp && (
          <Text style={{
            color: isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)',
            fontSize: 12,
            marginTop: 8,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          }}>
            {formatTimestamp(message.createdAt)}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
```

#### **ChatInput Component**
```typescript
// File: components/chat/ChatInput.tsx
interface ChatInputProps {
  onSendMessage: (content: string, type: MessageType) => Promise<void>;
  onAttachMedia: (media: MediaFile) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  isTyping?: boolean;
}

interface ChatInputState {
  text: string;
  isRecording: boolean;
  showAttachmentOptions: boolean;
  mediaPreview: MediaFile | null;
  height: number;
}

const MAX_HEIGHT = 120;
const MIN_HEIGHT = 44;

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onAttachMedia,
  placeholder = 'Type a message...',
  disabled = false,
  isTyping = false,
}) => {
  const [state, setState] = useState<ChatInputState>({
    text: '',
    isRecording: false,
    showAttachmentOptions: false,
    mediaPreview: null,
    height: MIN_HEIGHT,
  });

  const textInputRef = useRef<TextInput>(null);
  const recordingAnim = useRef(new Animated.Value(0)).current;

  const handleSend = async () => {
    if (!state.text.trim() || disabled) return;

    const messageText = state.text.trim();
    setState(prev => ({ ...prev, text: '', height: MIN_HEIGHT }));

    try {
      await onSendMessage(messageText, 'text');
    } catch (error) {
      // Handle send error
      setState(prev => ({ ...prev, text: messageText }));
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleMediaAttach = async (type: 'image' | 'video' | 'document') => {
    try {
      let result;
      if (type === 'image') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
      } else if (type === 'video') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const mediaFile: MediaFile = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || type,
          name: result.assets[0].fileName || `media_${Date.now()}`,
          size: result.assets[0].fileSize,
        };

        setState(prev => ({
          ...prev,
          mediaPreview: mediaFile,
          showAttachmentOptions: false
        }));

        await onAttachMedia(mediaFile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to attach media file.');
    }
  };

  const handleVoiceRecord = async () => {
    if (state.isRecording) {
      // Stop recording
      setState(prev => ({ ...prev, isRecording: false }));
      Animated.timing(recordingAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Start recording
      setState(prev => ({ ...prev, isRecording: true }));
      Animated.timing(recordingAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleTextChange = (text: string) => {
    setState(prev => ({ ...prev, text }));
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.max(MIN_HEIGHT, Math.min(height, MAX_HEIGHT));
    setState(prev => ({ ...prev, height: newHeight }));
  };

  return (
    <View style={styles.container}>
      {/* Media Preview */}
      {state.mediaPreview && (
        <View style={styles.mediaPreview}>
          <Image
            source={{ uri: state.mediaPreview.uri }}
            style={styles.previewImage}
          />
          <TouchableOpacity
            style={styles.removeMedia}
            onPress={() => setState(prev => ({ ...prev, mediaPreview: null }))}
          >
            <Ionicons name="close-circle" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setState(prev => ({
            ...prev,
            showAttachmentOptions: !prev.showAttachmentOptions
          }))}
          disabled={disabled}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={state.showAttachmentOptions ? '#539DF3' : '#676D75'}
          />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            { height: state.height, maxHeight: MAX_HEIGHT }
          ]}
          value={state.text}
          onChangeText={handleTextChange}
          onContentSizeChange={handleContentSizeChange}
          placeholder={placeholder}
          placeholderTextColor="#676D75"
          multiline
          editable={!disabled}
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        {/* Voice Record Button */}
        <TouchableOpacity
          style={[
            styles.voiceButton,
            state.isRecording && styles.recordingButton
          ]}
          onPress={handleVoiceRecord}
          disabled={disabled}
        >
          <Animated.View style={{
            transform: [{
              scale: recordingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2],
              })
            }]
          }}>
            <Ionicons
              name={state.isRecording ? "stop-circle" : "mic-outline"}
              size={24}
              color={state.isRecording ? '#FF6B6B' : '#676D75'}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Send Button */}
        {state.text.trim().length > 0 && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={disabled}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Attachment Options Modal */}
      <Modal
        visible={state.showAttachmentOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setState(prev => ({ ...prev, showAttachmentOptions: false }))}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setState(prev => ({ ...prev, showAttachmentOptions: false }))}
        >
          <View style={styles.attachmentOptions}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleMediaAttach('image')}
            >
              <Ionicons name="image-outline" size={24} color="#539DF3" />
              <Text style={styles.optionText}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleMediaAttach('video')}
            >
              <Ionicons name="videocam-outline" size={24} color="#539DF3" />
              <Text style={styles.optionText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleMediaAttach('document')}
            >
              <Ionicons name="document-outline" size={24} color="#539DF3" />
              <Text style={styles.optionText}>Document</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mediaPreview: {
    marginBottom: 12,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeMedia: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  attachButton: {
    marginRight: 12,
    padding: 4,
  },
  textInput: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 16,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  voiceButton: {
    marginLeft: 12,
    padding: 4,
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#539DF3',
    borderRadius: 20,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentOptions: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 8,
  },
});
```

### **AI Response Handler Hook**
```typescript
// File: hooks/useAIResponse.ts
interface UseAIResponseOptions {
  chatId: string;
  onMessageReceived: (message: Message) => void;
  onError: (error: Error) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

interface AIResponseState {
  isTyping: boolean;
  currentResponse: string;
  isStreaming: boolean;
  error: Error | null;
  retryCount: number;
}

interface StreamingChunk {
  content: string;
  isComplete: boolean;
  error?: string;
}

export const useAIResponse = (options: UseAIResponseOptions) => {
  const { chatId, onMessageReceived, onError, onTypingStart, onTypingEnd } = options;

  const [state, setState] = useState<AIResponseState>({
    isTyping: false,
    currentResponse: '',
    isStreaming: false,
    error: null,
    retryCount: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch AI response with streaming
  const fetchAIResponse = useCallback(async (
    messages: ChatMessage[],
    context?: any
  ): Promise<void> => {
    if (state.isStreaming) {
      console.warn('AI response already in progress');
      return;
    }

    setState(prev => ({
      ...prev,
      isTyping: true,
      isStreaming: true,
      error: null,
      currentResponse: '',
    }));

    onTypingStart?.();

    abortControllerRef.current = new AbortController();

    try {
      // Try OpenAI first
      const response = await fetchOpenAIResponse(messages, abortControllerRef.current.signal);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let accumulatedContent = '';
      let isComplete = false;

      while (!isComplete && !abortControllerRef.current.signal.aborted) {
        const { done, value } = await reader.read();

        if (done) {
          isComplete = true;
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              isComplete = true;
              break;
            }

            try {
              const parsed: StreamingChunk = JSON.parse(data);

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.content) {
                accumulatedContent += parsed.content;
                setState(prev => ({
                  ...prev,
                  currentResponse: accumulatedContent,
                }));
              }

              if (parsed.isComplete) {
                isComplete = true;
                break;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', parseError);
            }
          }
        }
      }

      // Create message object
      const aiMessage: Message = {
        id: generateId(),
        chatId,
        senderId: 'ai-user-id', // AI user ID
        content: accumulatedContent,
        isAi: true,
        type: 'text',
        createdAt: Date.now(),
        readBy: [],
        updatedAt: Date.now(),
      };

      // Send message to Convex
      await sendMessageToConvex(aiMessage);

      onMessageReceived(aiMessage);

    } catch (error) {
      console.error('AI response error:', error);

      // Try fallback to Google AI if OpenAI fails
      if (state.retryCount < 2) {
        console.log('Retrying with Google AI...');
        setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));

        retryTimeoutRef.current = setTimeout(() => {
          fetchWithGoogleAI(messages, context);
        }, 1000 * state.retryCount); // Exponential backoff
      } else {
        const errorObj = error instanceof Error ? error : new Error('Unknown AI error');
        setState(prev => ({ ...prev, error: errorObj }));
        onError(errorObj);
      }
    } finally {
      setState(prev => ({
        ...prev,
        isTyping: false,
        isStreaming: false,
      }));
      onTypingEnd?.();
    }
  }, [chatId, state.isStreaming, state.retryCount, onMessageReceived, onError, onTypingStart, onTypingEnd]);

  // Fallback to Google AI
  const fetchWithGoogleAI = useCallback(async (
    messages: ChatMessage[],
    context?: any
  ): Promise<void> => {
    try {
      const response = await fetchGoogleAIResponse(messages, context);

      const aiMessage: Message = {
        id: generateId(),
        chatId,
        senderId: 'ai-user-id',
        content: response.content,
        isAi: true,
        type: 'text',
        createdAt: Date.now(),
        readBy: [],
        updatedAt: Date.now(),
      };

      await sendMessageToConvex(aiMessage);
      onMessageReceived(aiMessage);

    } catch (googleError) {
      console.error('Google AI fallback failed:', googleError);
      const errorObj = googleError instanceof Error ? googleError : new Error('AI service unavailable');
      setState(prev => ({ ...prev, error: errorObj }));
      onError(errorObj);
    }
  }, [chatId, onMessageReceived, onError]);

  // Cancel ongoing request
  const cancelResponse = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      isTyping: false,
      isStreaming: false,
      error: null,
    }));

    onTypingEnd?.();
  }, [onTypingEnd]);

  // Reset error state
  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      retryCount: 0,
    }));
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping: state.isTyping,
    currentResponse: state.currentResponse,
    isStreaming: state.isStreaming,
    error: state.error,
    fetchAIResponse,
    cancelResponse,
    resetError,
  };
};

// OpenAI API integration
const fetchOpenAIResponse = async (
  messages: ChatMessage[],
  signal: AbortSignal
): Promise<Response> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const openaiMessages = messages.map(msg => ({
    role: msg.isAi ? 'assistant' : 'user',
    content: msg.content,
  }));

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    }),
    signal,
  });
};

// Google AI API integration
const fetchGoogleAIResponse = async (
  messages: ChatMessage[],
  context?: any
): Promise<{ content: string }> => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  const prompt = messages.map(msg => msg.content).join('\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
  };
};

// Convex mutation for sending messages
const sendMessageToConvex = async (message: Message): Promise<void> => {
  // This would be replaced with actual Convex mutation call
  console.log('Sending message to Convex:', message);
};
```

### **Habit Tracking System**

#### **HabitCard Component**
```typescript
// File: components/habits/HabitCard.tsx
interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, value: HabitValue) => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  showStreak?: boolean;
  compact?: boolean;
}

interface HabitCardState {
  isCompleted: boolean;
  currentValue: HabitValue;
  showEditModal: boolean;
  isAnimating: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onEdit,
  onDelete,
  showStreak = true,
  compact = false,
}) => {
  const [state, setState] = useState<HabitCardState>({
    isCompleted: false,
    currentValue: habit.type === 'boolean' ? false : 0,
    showEditModal: false,
    isAnimating: false,
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const handleComplete = async () => {
    if (state.isAnimating) return;

    setState(prev => ({ ...prev, isAnimating: true }));

    // Animate completion
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onComplete(habit.id, state.currentValue);

      // Success feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isCompleted: !prev.isCompleted,
          isAnimating: false
        }));

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 500);

    } catch (error) {
      setState(prev => ({ ...prev, isAnimating: false }));
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  const handleLongPress = () => {
    Vibration.vibrate(100);
    setState(prev => ({ ...prev, showEditModal: true }));
  };

  const progressPercentage = useMemo(() => {
    if (habit.type === 'boolean') {
      return state.isCompleted ? 100 : 0;
    }

    if (habit.type === 'numeric' && habit.target) {
      return Math.min((state.currentValue as number) / habit.target * 100, 100);
    }

    return 0;
  }, [habit.type, habit.target, state.currentValue, state.isCompleted]);

  const cardStyle = useMemo(() => ({
    backgroundColor: state.isCompleted ? 'rgba(83, 157, 243, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    borderColor: state.isCompleted ? '#539DF3' : 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: compact ? 12 : 16,
    marginVertical: 8,
    shadowColor: state.isCompleted ? '#539DF3' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  }), [state.isCompleted, compact]);

  return (
    <>
      <Animated.View style={[cardStyle, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleComplete}
          onLongPress={handleLongPress}
          style={{ flex: 1 }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Icon and Title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: habit.color,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name={habit.icon} size={24} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  color: '#E5E7EB',
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 4,
                }}>
                  {habit.name}
                </Text>

                {habit.description && !compact && (
                  <Text style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    lineHeight: 18,
                  }}>
                    {habit.description}
                  </Text>
                )}
              </View>
            </View>

            {/* Completion Indicator */}
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: state.isCompleted ? '#539DF3' : '#374151',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: state.isCompleted ? '#539DF3' : 'transparent',
            }}>
              {state.isCompleted && (
                <Animated.View style={{
                  opacity: checkAnim,
                  transform: [{
                    scale: checkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    })
                  }]
                }}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </Animated.View>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          {habit.type !== 'boolean' && (
            <View style={{ marginTop: 12 }}>
              <View style={{
                height: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <Animated.View style={{
                  height: '100%',
                  backgroundColor: habit.color,
                  width: `${progressPercentage}%`,
                }} />
              </View>

              <Text style={{
                color: '#9CA3AF',
                fontSize: 12,
                marginTop: 4,
                textAlign: 'right',
              }}>
                {habit.type === 'numeric' ? `${state.currentValue}/${habit.target}` : ''}
              </Text>
            </View>
          )}

          {/* Streak Indicator */}
          {showStreak && habit.streak > 0 && (
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#F59E0B',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="flame" size={12} color="#FFFFFF" />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600',
                marginLeft: 4,
              }}>
                {habit.streak}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Edit Modal */}
      <Modal
        visible={state.showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setState(prev => ({ ...prev, showEditModal: false }))}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setState(prev => ({ ...prev, showEditModal: false }))}
        >
          <View style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 16,
            padding: 20,
            width: '80%',
            maxWidth: 400,
          }}>
            <Text style={{
              color: '#E5E7EB',
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Habit Options
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                marginBottom: 8,
              }}
              onPress={() => {
                setState(prev => ({ ...prev, showEditModal: false }));
                onEdit(habit.id);
              }}
            >
              <Ionicons name="pencil" size={20} color="#539DF3" />
              <Text style={{
                color: '#E5E7EB',
                fontSize: 16,
                marginLeft: 12,
              }}>
                Edit Habit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderRadius: 8,
              }}
              onPress={() => {
                Alert.alert(
                  'Delete Habit',
                  'Are you sure you want to delete this habit? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        setState(prev => ({ ...prev, showEditModal: false }));
                        onDelete(habit.id);
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="trash" size={20} color="#EF4444" />
              <Text style={{
                color: '#EF4444',
                fontSize: 16,
                marginLeft: 12,
              }}>
                Delete Habit
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
```

## **State Management Implementation**

### **Global App Store (Zustand)**
```typescript
// File: stores/appStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppStore {
  // User Management
  userId: string | null;
  user: User | null;
  isAdmin: boolean | null;
  isApproved: boolean | null;
  detailsFilled: boolean | null;

  // Chat Management
  chatId: string | null;
  showDashboard: boolean;
  isInitializing: boolean;

  // UI State
  theme: 'light' | 'dark';
  isOnline: boolean;
  lastSync: number;

  // Actions
  setUserId: (id: string | null) => void;
  setUser: (user: User | null) => void;
  setChatId: (id: string | null) => void;
  toggleDashboard: () => void;
  setInitializing: (state: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;

  // Computed properties
  isAuthenticated: boolean;
  canAccessChat: boolean;
  needsApproval: boolean;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        userId: null,
        user: null,
        isAdmin: null,
        isApproved: null,
        detailsFilled: null,
        chatId: null,
        showDashboard: false,
        isInitializing: false,
        theme: 'dark',
        isOnline: true,
        lastSync: Date.now(),

        // Actions
        setUserId: (id) => set({ userId: id }),
        setUser: (user) => set({ user }),
        setChatId: (id) => set({ chatId: id }),
        toggleDashboard: () => set((state) => ({ showDashboard: !state.showDashboard })),
        setInitializing: (state) => set({ isInitializing: state }),
        setTheme: (theme) => set({ theme }),
        setOnlineStatus: (isOnline) => set({ isOnline }),
        updateLastSync: () => set({ lastSync: Date.now() }),

        // Computed properties
        get isAuthenticated(): boolean {
          return !!get().userId && !!get().user;
        },

        get canAccessChat(): boolean {
          const state = get();
          return state.isAuthenticated && !!state.chatId && !!state.isApproved;
        },

        get needsApproval(): boolean {
          const state = get();
          return state.isAuthenticated && !state.isApproved;
        },
      }),
      {
        name: 'cura-app-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          userId: state.userId,
          user: state.user,
          chatId: state.chatId,
          theme: state.theme,
          lastSync: state.lastSync,
        }),
      }
    )
  )
);

// Selectors for optimized re-renders
export const useAuthState = () =>
  useAppStore((state) => ({
    userId: state.userId,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }));

export const useChatState = () =>
  useAppStore((state) => ({
    chatId: state.chatId,
    canAccessChat: state.canAccessChat,
    showDashboard: state.showDashboard,
  }));

export const useUIState = () =>
  useAppStore((state) => ({
    theme: state.theme,
    isOnline: state.isOnline,
    lastSync: state.lastSync,
  }));
```

### **Chat Context Provider**
```typescript
// File: contexts/ChatContext.tsx
import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { useAppStore } from '../stores/appStore';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isAi: boolean;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  attachId?: string;
  replyTo?: string;
  createdAt: number;
  readBy: string[];
  updatedAt: number;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  hasMoreMessages: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string, type?: MessageType, attachId?: string) => Promise<void>;
  sendMedia: (mediaUri: string, type: MediaType) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  retryFailedMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Real-time updates
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  chatId: string;
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ chatId, children }) => {
  const { userId } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Convex queries and mutations
  const messagesQuery = useQuery(
    api.messages.getChatMessages,
    chatId ? { chatId, limit: 20, offset: page * 20 } : 'skip'
  );

  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const markAsReadMutation = useMutation(api.messages.markAsRead);
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);

  // Update messages when query data changes
  useEffect(() => {
    if (messagesQuery && !messagesQuery.error) {
      setMessages(prevMessages => {
        const newMessages = messagesQuery.messages || [];
        const existingIds = new Set(prevMessages.map(m => m.id));
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));

        return page === 0
          ? newMessages
          : [...uniqueNewMessages, ...prevMessages];
      });

      setHasMoreMessages((messagesQuery.messages?.length || 0) >= 20);
      setIsLoading(false);
      setError(null);
    } else if (messagesQuery?.error) {
      setError(messagesQuery.error.message);
      setIsLoading(false);
    }
  }, [messagesQuery, page]);

  // Send text message
  const sendMessage = useCallback(async (
    content: string,
    type: MessageType = 'text',
    attachId?: string
  ): Promise<void> => {
    if (!userId || !chatId) {
      throw new Error('User not authenticated or chat not available');
    }

    try {
      setError(null);

      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId: userId,
        content,
        isAi: false,
        type,
        attachId,
        createdAt: Date.now(),
        readBy: [userId],
        updatedAt: Date.now(),
      };

      setMessages(prev => [tempMessage, ...prev]);

      // Send to Convex
      const result = await sendMessageMutation({
        chatId,
        content,
        type,
        attachId,
      });

      // Replace temp message with real message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id
            ? { ...tempMessage, id: result.id }
            : msg
        )
      );

    } catch (err) {
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));

      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId, chatId, sendMessageMutation]);

  // Send media message
  const sendMedia = useCallback(async (
    mediaUri: string,
    type: MediaType
  ): Promise<void> => {
    try {
      setError(null);

      // Upload media to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await uploadFile(mediaUri, uploadUrl);

      // Send message with media
      await sendMessage(`Media shared: ${type}`, 'text', uploadResult.storageId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send media';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [sendMessage]);

  // Load more messages for pagination
  const loadMoreMessages = useCallback(async (): Promise<void> => {
    if (!hasMoreMessages || isLoading) return;

    setIsLoading(true);
    setPage(prev => prev + 1);
  }, [hasMoreMessages, isLoading]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string): Promise<void> => {
    try {
      await markAsReadMutation({ messageId });
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }, [markAsReadMutation]);

  // Retry failed message
  const retryFailedMessage = useCallback(async (messageId: string): Promise<void> => {
    const failedMessage = messages.find(msg => msg.id === messageId && msg.id.startsWith('temp-'));

    if (failedMessage) {
      // Remove failed message and retry send
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      await sendMessage(failedMessage.content, failedMessage.type, failedMessage.attachId);
    }
  }, [messages, sendMessage]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      await deleteMessageMutation({ messageId });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [deleteMessageMutation]);

  // Real-time subscription management
  const subscribeToMessages = useCallback(() => {
    // Implementation for real-time subscriptions would go here
    // This would typically involve setting up Convex subscriptions
  }, []);

  const unsubscribeFromMessages = useCallback(() => {
    // Cleanup subscriptions
  }, []);

  // Auto-mark messages as read when they come into view
  useEffect(() => {
    const markVisibleMessagesAsRead = () => {
      const unreadMessages = messages.filter(
        msg => msg.senderId !== userId && !msg.readBy.includes(userId)
      );

      unreadMessages.forEach(msg => {
        markAsRead(msg.id);
      });
    };

    if (messages.length > 0) {
      markVisibleMessagesAsRead();
    }
  }, [messages, userId, markAsRead]);

  const contextValue: ChatContextType = {
    messages,
    isTyping,
    isLoading,
    hasMoreMessages,
    error,
    sendMessage,
    sendMedia,
    loadMoreMessages,
    markAsRead,
    retryFailedMessage,
    deleteMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Helper functions
const generateUploadUrl = async (): Promise<string> => {
  // This would call a Convex mutation to generate upload URL
  return 'upload-url';
};

const uploadFile = async (uri: string, uploadUrl: string): Promise<{ storageId: string }> => {
  // Implementation for file upload
  return { storageId: 'storage-id' };
};
```

## **API Integration Layer**

### **Convex Query Hooks**
```typescript
// File: hooks/useConvexQueries.ts
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAppStore } from '../stores/appStore';

// User Management Queries
export const useCurrentUser = () => {
  const { userId } = useAppStore();

  return useQuery(
    api.users.getCurrentUser,
    userId ? { userId } : 'skip'
  );
};

export const useUserRole = (userId: string) => {
  return useQuery(api.users.getUserRole, { userId });
};

export const useUserApprovalStatus = (userId: string) => {
  return useQuery(api.users.getApprovalStatus, { userId });
};

// Chat Queries
export const useChatMessages = (chatId: string, options?: {
  limit?: number;
  offset?: number;
}) => {
  const { limit = 50, offset = 0 } = options || {};

  return useQuery(
    api.messages.getChatMessages,
    chatId ? { chatId, limit, offset } : 'skip'
  );
};

export const useChatList = (userId: string) => {
  return useQuery(
    api.chats.getUserChats,
    userId ? { userId } : 'skip'
  );
};

export const useUnreadCount = (userId: string) => {
  return useQuery(
    api.chats.getUnreadCount,
    userId ? { userId } : 'skip'
  );
};

// Habit Queries
export const useUserHabits = (userId: string) => {
  return useQuery(
    api.habits.getUserHabits,
    userId ? { userId } : 'skip'
  );
};

export const useHabitEntries = (habitId: string, dateRange?: {
  startDate: string;
  endDate: string;
}) => {
  const defaultRange = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  };

  return useQuery(
    api.habitEntries.getHabitEntries,
    habitId ? { habitId, ...defaultRange, ...dateRange } : 'skip'
  );
};

export const useHabitStreaks = (habitId: string) => {
  return useQuery(
    api.habits.getHabitStreaks,
    habitId ? { habitId } : 'skip'
  );
};

// Meal Planning Queries
export const useMealPlans = (userId: string, date: string) => {
  return useQuery(
    api.dailyplan.getUserPlan,
    userId && date ? { userId, date } : 'skip'
  );
};

export const useMealSearch = (query: string, filters?: {
  mealType?: string[];
  cuisine?: string[];
  dietaryRestrictions?: string[];
  maxCalories?: number;
}) => {
  return useQuery(
    api.meals.searchMeals,
    query ? { query, ...filters } : 'skip'
  );
};

export const useMealDetails = (mealId: string) => {
  return useQuery(
    api.meals.getMealDetails,
    mealId ? { mealId } : 'skip'
  );
};

// Exercise Queries
export const useExerciseLibrary = (filters?: {
  category?: string;
  difficulty?: string;
  equipment?: string[];
}) => {
  return useQuery(
    api.exercises.getExerciseLibrary,
    filters ? { ...filters } : 'skip'
  );
};

export const useExerciseDetails = (exerciseId: string) => {
  return useQuery(
    api.exercises.getExerciseDetails,
    exerciseId ? { exerciseId } : 'skip'
  );
};
```

### **Convex Mutation Hooks**
```typescript
// File: hooks/useConvexMutations.ts
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Message Mutations
export const useSendMessage = () => {
  return useMutation(api.messages.sendMessage);
};

export const useUpdateMessage = () => {
  return useMutation(api.messages.updateMessage);
};

export const useDeleteMessage = () => {
  return useMutation(api.messages.deleteMessage);
};

export const useMarkMessageAsRead = () => {
  return useMutation(api.messages.markAsRead);
};

// Chat Mutations
export const useCreateChat = () => {
  return useMutation(api.chats.createChat);
};

export const useUpdateChat = () => {
  return useMutation(api.chats.updateChat);
};

export const useDeleteChat = () => {
  return useMutation(api.chats.deleteChat);
};

// User Mutations
export const useUpdateUserProfile = () => {
  return useMutation(api.users.updateProfile);
};

export const useUpdateUserQuestionnaire = () => {
  return useMutation(api.users.updateQuestionnaire);
};

export const useApproveUser = () => {
  return useMutation(api.users.approveUser);
};

// Habit Mutations
export const useCreateHabit = () => {
  return useMutation(api.habits.createHabit);
};

export const useUpdateHabit = () => {
  return useMutation(api.habits.updateHabit);
};

export const useDeleteHabit = () => {
  return useMutation(api.habits.deleteHabit);
};

export const useCompleteHabitEntry = () => {
  return useMutation(api.habitEntries.createEntry);
};

export const useUpdateHabitEntry = () => {
  return useMutation(api.habitEntries.updateEntry);
};

export const useDeleteHabitEntry = () => {
  return useMutation(api.habitEntries.deleteEntry);
};

// Meal Planning Mutations
export const useCreateMeal = () => {
  return useMutation(api.meals.createMeal);
};

export const useUpdateMeal = () => {
  return useMutation(api.meals.updateMeal);
};

export const useDeleteMeal = () => {
  return useMutation(api.meals.deleteMeal);
};

export const useAddMealToPlan = () => {
  return useMutation(api.dailyplan.addMealToPlan);
};

export const useRemoveMealFromPlan = () => {
  return useMutation(api.dailyplan.removeMealFromPlan);
};

export const useCompleteMeal = () => {
  return useMutation(api.completions.markMealComplete);
};

// Exercise Mutations
export const useCreateExercise = () => {
  return useMutation(api.exercises.createExercise);
};

export const useUpdateExercise = () => {
  return useMutation(api.exercises.updateExercise);
};

export const useDeleteExercise = () => {
  return useMutation(api.exercises.deleteExercise);
};

export const useCompleteExercise = () => {
  return useMutation(api.completions.markExerciseComplete);
};
```

### **External API Integration**
```typescript
// File: services/apiClients.ts
import { ChatMessage } from '../types/chat';

// OpenAI Client
export class OpenAIClient {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<OpenAIResponse> {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 1000,
      stream = false,
    } = options;

    const openaiMessages = messages.map(msg => ({
      role: msg.isAi ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async createImageGeneration(
    prompt: string,
    options: {
      size?: '256x256' | '512x512' | '1024x1024';
      n?: number;
    } = {}
  ): Promise<OpenAIImageResponse> {
    const { size = '512x512', n = 1 } = options;

    const response = await fetch(`${this.baseURL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        size,
        n,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Image API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }
}

// Google AI Client
export class GoogleAIClient {
  private apiKey: string;
  private baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxOutputTokens?: number;
      context?: string;
    } = {}
  ): Promise<GoogleAIResponse> {
    const {
      model = 'gemini-pro',
      temperature = 0.7,
      maxOutputTokens = 1000,
      context,
    } = options;

    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

    const response = await fetch(
      `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt,
            }],
          }],
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async analyzeImage(
    imageData: string,
    prompt: string,
    options: {
      model?: string;
    } = {}
  ): Promise<GoogleAIVisionResponse> {
    const { model = 'gemini-pro-vision' } = options;

    const response = await fetch(
      `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageData,
                },
              },
            ],
          }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google AI Vision API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }
}

// API Response Types
export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIImageResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

export interface GoogleAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
}

export interface GoogleAIVisionResponse extends GoogleAIResponse {}

// Factory function to create API clients
export class APIClientFactory {
  static createOpenAIClient(apiKey?: string): OpenAIClient {
    const key = apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key not provided');
    }
    return new OpenAIClient(key);
  }

  static createGoogleAIClient(apiKey?: string): GoogleAIClient {
    const key = apiKey || process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
    if (!key) {
      throw new Error('Google AI API key not provided');
    }
    return new GoogleAIClient(key);
  }
}
```

---

## **2. Error Handling & Recovery**

### **Error Boundary Component**
```typescript
// File: components/common/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  reportError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = (error: Error, errorInfo?: React.ErrorInfo) => {
    // Implementation for error reporting (Sentry, Bugsnag, etc.)
    // This would send error details to monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: 'React Native App',
      version: '1.0.0', // App version
    };

    // Send to monitoring service
    console.log('Reporting error:', errorReport);
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
            reportError={this.reportError}
          />
        );
      }

      return <DefaultErrorFallback
        error={this.state.error!}
        resetError={this.resetError}
        reportError={this.reportError}
      />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  reportError
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorContent}>
        <Ionicons name="warning" size={64} color="#EF4444" />
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>

        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Error Details (Development):</Text>
            <Text style={styles.debugText}>{error.message}</Text>
            <Text style={styles.debugText}>{error.stack}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={resetError}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => reportError(error)}
          >
            <Text style={styles.secondaryButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5E7EB',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  debugInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#539DF3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
```

### **API Error Handler**
```typescript
// File: utils/apiErrorHandler.ts
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface APIError {
  type: APIErrorType;
  message: string;
  statusCode?: number;
  originalError?: any;
  retryable: boolean;
  userMessage: string;
  suggestedAction?: string;
}

export class APIErrorHandler {
  static handle(error: any): APIError {
    // Network errors
    if (!navigator.onLine) {
      return {
        type: APIErrorType.NETWORK_ERROR,
        message: 'No internet connection',
        retryable: true,
        userMessage: 'Please check your internet connection and try again.',
        suggestedAction: 'Check network connection',
      };
    }

    // Timeout errors
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return {
        type: APIErrorType.TIMEOUT_ERROR,
        message: 'Request timed out',
        retryable: true,
        userMessage: 'The request took too long. Please try again.',
        suggestedAction: 'Retry request',
      };
    }

    // HTTP status code based errors
    if (error.status || error.statusCode) {
      const statusCode = error.status || error.statusCode;

      switch (statusCode) {
        case 400:
          return {
            type: APIErrorType.VALIDATION_ERROR,
            message: 'Invalid request data',
            statusCode,
            retryable: false,
            userMessage: 'Please check your input and try again.',
            suggestedAction: 'Review and correct input data',
          };

        case 401:
          return {
            type: APIErrorType.AUTHENTICATION_ERROR,
            message: 'Authentication required',
            statusCode,
            retryable: false,
            userMessage: 'Please log in to continue.',
            suggestedAction: 'Re-authenticate user',
          };

        case 403:
          return {
            type: APIErrorType.AUTHORIZATION_ERROR,
            message: 'Access denied',
            statusCode,
            retryable: false,
            userMessage: 'You do not have permission to perform this action.',
            suggestedAction: 'Check user permissions',
          };

        case 404:
          return {
            type: APIErrorType.CLIENT_ERROR,
            message: 'Resource not found',
            statusCode,
            retryable: false,
            userMessage: 'The requested resource was not found.',
            suggestedAction: 'Check resource existence',
          };

        case 429:
          return {
            type: APIErrorType.RATE_LIMIT_ERROR,
            message: 'Too many requests',
            statusCode,
            retryable: true,
            userMessage: 'Please wait a moment before trying again.',
            suggestedAction: 'Implement rate limiting',
          };

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: APIErrorType.SERVER_ERROR,
            message: 'Server error',
            statusCode,
            retryable: true,
            userMessage: 'Something went wrong on our end. Please try again.',
            suggestedAction: 'Retry request or contact support',
          };

        default:
          return {
            type: APIErrorType.UNKNOWN_ERROR,
            message: `HTTP ${statusCode} error`,
            statusCode,
            retryable: statusCode >= 500,
            userMessage: 'An unexpected error occurred. Please try again.',
            suggestedAction: 'Check server status or contact support',
          };
      }
    }

    // Specific error types
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        type: APIErrorType.NETWORK_ERROR,
        message: 'Network connection failed',
        retryable: true,
        userMessage: 'Unable to connect to the server. Please check your connection.',
        suggestedAction: 'Check network connection',
      };
    }

    // Convex specific errors
    if (error.message?.includes('Convex')) {
      return {
        type: APIErrorType.SERVER_ERROR,
        message: 'Database error',
        retryable: true,
        userMessage: 'Database temporarily unavailable. Please try again.',
        suggestedAction: 'Retry request',
      };
    }

    // Default unknown error
    return {
      type: APIErrorType.UNKNOWN_ERROR,
      message: error.message || 'Unknown error occurred',
      originalError: error,
      retryable: false,
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      suggestedAction: 'Contact support with error details',
    };
  }

  static getRetryDelay(attemptNumber: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter

    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  static shouldRetry(error: APIError, attemptNumber: number): boolean {
    // Don't retry more than 3 times
    if (attemptNumber >= 3) {
      return false;
    }

    // Only retry certain types of errors
    return error.retryable && [
      APIErrorType.NETWORK_ERROR,
      APIErrorType.TIMEOUT_ERROR,
      APIErrorType.SERVER_ERROR,
      APIErrorType.RATE_LIMIT_ERROR,
    ].includes(error.type);
  }

  static getErrorMessageForUser(error: APIError): string {
    return error.userMessage;
  }

  static logError(error: APIError, context?: any) {
    const logData = {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      retryable: error.retryable,
      timestamp: new Date().toISOString(),
      context,
    };

    console.error('API Error:', logData);

    // Send to error monitoring service
    // This would integrate with services like Sentry, LogRocket, etc.
  }
}

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context?: any
): Promise<T> {
  let lastError: APIError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = APIErrorHandler.handle(error);

      // Log the error
      APIErrorHandler.logError(lastError, {
        ...context,
        attempt: attempt + 1,
        maxRetries,
      });

      // Check if we should retry
      if (!APIErrorHandler.shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        const delay = APIErrorHandler.getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

---

## **3. Performance Optimization Strategies**

### **Image Optimization**
```typescript
// File: utils/imageOptimizer.ts
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: SaveFormat;
}

export interface OptimizedImageResult {
  uri: string;
  width: number;
  height: number;
  size: number;
}

export class ImageOptimizer {
  static async optimizeForUpload(
    imageUri: string,
    config: Partial<ImageOptimizationConfig> = {}
  ): Promise<OptimizedImageResult> {
    const defaultConfig: ImageOptimizationConfig = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: SaveFormat.JPEG,
      ...config,
    };

    try {
      // Resize image
      const resizedImage = await manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: defaultConfig.maxWidth,
              height: defaultConfig.maxHeight,
            },
          },
        ],
        {
          compress: defaultConfig.quality,
          format: defaultConfig.format,
        }
      );

      // Get file info
      const fileInfo = await this.getFileInfo(resizedImage.uri);

      return {
        uri: resizedImage.uri,
        width: resizedImage.width,
        height: resizedImage.height,
        size: fileInfo.size,
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw new Error('Failed to optimize image');
    }
  }

  static async generateThumbnail(
    imageUri: string,
    size: number = 150
  ): Promise<string> {
    try {
      const thumbnail = await manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: size,
              height: size,
            },
          },
        ],
        {
          compress: 0.7,
          format: SaveFormat.JPEG,
        }
      );

      return thumbnail.uri;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  static async compressImage(
    imageUri: string,
    quality: number = 0.8
  ): Promise<OptimizedImageResult> {
    try {
      const compressedImage = await manipulateAsync(
        imageUri,
        [],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        }
      );

      const fileInfo = await this.getFileInfo(compressedImage.uri);

      return {
        uri: compressedImage.uri,
        width: compressedImage.width,
        height: compressedImage.height,
        size: fileInfo.size,
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  }

  static async getFileInfo(uri: string): Promise<{ size: number }> {
    // This would use expo-file-system to get file info
    // Implementation depends on the file system API
    return { size: 0 }; // Placeholder
  }

  static calculateImageSize(width: number, height: number, quality: number = 0.8): number {
    // Rough estimation of JPEG file size
    const pixels = width * height;
    const bitsPerPixel = 24; // RGB
    const compressionRatio = 1 / quality;
    const bytesPerPixel = (bitsPerPixel / 8) * compressionRatio;

    return Math.round(pixels * bytesPerPixel);
  }
}

// React hook for image optimization
export const useImageOptimizer = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);

  const optimizeImage = useCallback(async (
    imageUri: string,
    config?: Partial<ImageOptimizationConfig>
  ): Promise<OptimizedImageResult> => {
    setIsOptimizing(true);
    setProgress(0);

    try {
      setProgress(25);
      const result = await ImageOptimizer.optimizeForUpload(imageUri, config);
      setProgress(100);

      return result;
    } finally {
      setIsOptimizing(false);
      setProgress(0);
    }
  }, []);

  const generateThumbnail = useCallback(async (
    imageUri: string,
    size?: number
  ): Promise<string> => {
    setIsOptimizing(true);
    setProgress(0);

    try {
      setProgress(50);
      const thumbnailUri = await ImageOptimizer.generateThumbnail(imageUri, size);
      setProgress(100);

      return thumbnailUri;
    } finally {
      setIsOptimizing(false);
      setProgress(0);
    }
  }, []);

  return {
    optimizeImage,
    generateThumbnail,
    isOptimizing,
    progress,
  };
};
```

### **List Virtualization**
```typescript
// File: components/common/VirtualizedList.tsx
import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
  ListHeaderComponent?: React.ComponentType<any>;
  ListFooterComponent?: React.ComponentType<any>;
  ListEmptyComponent?: React.ComponentType<any>;
  refreshing?: boolean;
  onRefresh?: () => void;
  showsVerticalScrollIndicator?: boolean;
}

function VirtualizedList<T extends { id: string | number }>({
  data,
  renderItem,
  itemHeight,
  containerHeight = SCREEN_HEIGHT,
  overscan = 5,
  onEndReached,
  onEndReachedThreshold = 0.1,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  refreshing = false,
  onRefresh,
  showsVerticalScrollIndicator = false,
}: VirtualizedListProps<T>) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleEndReached = useCallback(() => {
    onEndReached?.();
  }, [onEndReached]);

  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View style={{ height: itemHeight }}>
        {renderItem(item, index)}
      </View>
    ),
    [renderItem, itemHeight]
  );

  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      return item.id.toString();
    },
    [keyExtractor]
  );

  const estimatedItemSize = useMemo(() => itemHeight, [itemHeight]);

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <FlashList
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={memoizedKeyExtractor}
        estimatedItemSize={estimatedItemSize}
        onScroll={scrollHandler}
        onEndReached={handleEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        overscan={overscan}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

export default VirtualizedList;
```

### **Memory Management**
```typescript
// File: utils/memoryManager.ts
import { Image } from 'react-native';

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedImageMemory: number;
  cacheSize: number;
}

export class MemoryManager {
  private static imageCache = new Map<string, any>();
  private static maxCacheSize = 50 * 1024 * 1024; // 50MB
  private static currentCacheSize = 0;

  static async cleanupUnusedImages(): Promise<void> {
    // Clear React Native Image cache
    Image.clearMemoryCache?.();
    Image.clearDiskCache?.();

    // Clear custom image cache
    this.imageCache.clear();
    this.currentCacheSize = 0;
  }

  static async clearCache(): Promise<void> {
    await this.cleanupUnusedImages();

    // Clear AsyncStorage if needed
    // Clear other caches as necessary
  }

  static async monitorMemoryUsage(): Promise<MemoryInfo> {
    // Get JavaScript heap information
    const jsMemoryInfo = {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    };

    // Get image cache size
    const usedImageMemory = this.currentCacheSize;

    // Get other cache sizes
    const cacheSize = await this.getCacheSize();

    return {
      ...jsMemoryInfo,
      usedImageMemory,
      cacheSize,
    };
  }

  static optimizeBundleSize(): void {
    // Implement code splitting and lazy loading hints
    // This would be used during build time optimization
  }

  private static async getCacheSize(): Promise<number> {
    // Calculate total cache size from various sources
    let totalSize = 0;

    // Add image cache size
    totalSize += this.currentCacheSize;

    // Add other cache sizes as needed

    return totalSize;
  }

  static addToImageCache(key: string, imageData: any, size: number): void {
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.evictOldestImages();
    }

    this.imageCache.set(key, {
      data: imageData,
      size,
      lastAccessed: Date.now(),
    });

    this.currentCacheSize += size;
  }

  static getFromImageCache(key: string): any | null {
    const cached = this.imageCache.get(key);

    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.data;
    }

    return null;
  }

  private static evictOldestImages(): void {
    // Sort by last accessed time and evict oldest
    const entries = Array.from(this.imageCache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    let freedSize = 0;
    const targetSize = this.maxCacheSize * 0.8; // Free up to 80% of cache

    for (const [key, value] of entries) {
      if (this.currentCacheSize - freedSize <= targetSize) {
        break;
      }

      this.imageCache.delete(key);
      freedSize += value.size;
    }

    this.currentCacheSize -= freedSize;
  }
}

// React hook for memory monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);

    const monitor = async () => {
      if (!isMonitoring) return;

      try {
        const info = await MemoryManager.monitorMemoryUsage();
        setMemoryInfo(info);
      } catch (error) {
        console.error('Memory monitoring failed:', error);
      }

      // Monitor every 30 seconds
      setTimeout(monitor, 30000);
    };

    monitor();
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const cleanupMemory = useCallback(async () => {
    await MemoryManager.cleanupUnusedImages();
    const info = await MemoryManager.monitorMemoryUsage();
    setMemoryInfo(info);
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    memoryInfo,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    cleanupMemory,
  };
};
```

---

## **4. Testing Strategy**

### **Unit Testing Setup**
```typescript
// File: __tests__/components/MessageBubble.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MessageBubble } from '../../components/chat/MessageBubble';

// Mock dependencies
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn(() => ({})),
  runOnJS: jest.fn((fn) => fn),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

const mockMessage = {
  id: 'msg-1',
  chatId: 'chat-1',
  senderId: 'user-1',
  content: 'Hello, world!',
  isAi: false,
  type: 'text' as const,
  createdAt: Date.now(),
  readBy: [],
  updatedAt: Date.now(),
};

const mockAIMessage = {
  ...mockMessage,
  isAi: true,
  senderId: 'ai-user',
};

describe('MessageBubble', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user message correctly', () => {
    const { getByText, getByTestId } = render(
      <MessageBubble message={mockMessage} isUser={true} />
    );

    expect(getByText('Hello, world!')).toBeTruthy();
    expect(getByTestId('message-bubble')).toBeTruthy();
  });

  it('renders AI message with neon line', () => {
    const { getByTestId } = render(
      <MessageBubble message={mockAIMessage} isUser={false} />
    );

    expect(getByTestId('ai-message-bubble')).toBeTruthy();
    expect(getByTestId('neon-line')).toBeTruthy();
  });

  it('handles long press correctly', async () => {
    const mockOnLongPress = jest.fn();
    const { getByTestId } = render(
      <MessageBubble
        message={mockMessage}
        isUser={true}
        onLongPress={mockOnLongPress}
      />
    );

    const bubble = getByTestId('message-bubble');
    fireEvent(bubble, 'onLongPress');

    await waitFor(() => {
      expect(mockOnLongPress).toHaveBeenCalled();
    });
  });

  it('shows timestamp on press', async () => {
    const { getByText, queryByText } = render(
      <MessageBubble message={mockMessage} isUser={true} />
    );

    const bubble = getByText('Hello, world!');

    // Initially timestamp should not be visible
    expect(queryByText(/\d{1,2}:\d{2}/)).toBeNull();

    fireEvent.press(bubble);

    await waitFor(() => {
      expect(queryByText(/\d{1,2}:\d{2}/)).toBeTruthy();
    });
  });

  it('applies correct styling for user vs AI messages', () => {
    const { getByTestId: getUserBubble } = render(
      <MessageBubble message={mockMessage} isUser={true} />
    );
    const { getByTestId: getAIBubble } = render(
      <MessageBubble message={mockAIMessage} isUser={false} />
    );

    const userBubble = getUserBubble('message-bubble');
    const aiBubble = getAIBubble('ai-message-bubble');

    // Check background colors
    expect(userBubble.props.style.backgroundColor).toBe('#539DF3');
    expect(aiBubble.props.style.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
  });
});

// File: __tests__/hooks/useAIResponse.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIResponse } from '../../hooks/useAIResponse';

// Mock API clients
jest.mock('../../services/apiClients', () => ({
  OpenAIClient: jest.fn().mockImplementation(() => ({
    createChatCompletion: jest.fn(),
  })),
  GoogleAIClient: jest.fn().mockImplementation(() => ({
    generateText: jest.fn(),
  })),
}));

describe('useAIResponse', () => {
  const mockChatId = 'chat-123';
  const mockMessages = [
    {
      id: 'msg-1',
      content: 'Hello',
      isAi: false,
      createdAt: Date.now(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles successful AI response', async () => {
    const mockResponse = {
      content: 'Hello! How can I help you?',
      isComplete: true,
    };

    // Mock successful OpenAI response
    const { OpenAIClient } = require('../../services/apiClients');
    OpenAIClient.mockImplementation(() => ({
      createChatCompletion: jest.fn().mockResolvedValue(mockResponse),
    }));

    const mockOnMessageReceived = jest.fn();

    const { result } = renderHook(() =>
      useAIResponse({
        chatId: mockChatId,
        onMessageReceived: mockOnMessageReceived,
        onError: jest.fn(),
      })
    );

    act(() => {
      result.current.fetchAIResponse(mockMessages);
    });

    await waitFor(() => {
      expect(result.current.isTyping).toBe(false);
      expect(mockOnMessageReceived).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hello! How can I help you?',
          isAi: true,
        })
      );
    });
  });

  it('handles OpenAI failure and falls back to Google AI', async () => {
    const mockOpenAIError = new Error('OpenAI API error');
    const mockGoogleResponse = {
      content: 'I am Google AI, here to help!',
    };

    const { OpenAIClient, GoogleAIClient } = require('../../services/apiClients');

    // Mock OpenAI failure
    OpenAIClient.mockImplementation(() => ({
      createChatCompletion: jest.fn().mockRejectedValue(mockOpenAIError),
    }));

    // Mock Google AI success
    GoogleAIClient.mockImplementation(() => ({
      generateText: jest.fn().mockResolvedValue(mockGoogleResponse),
    }));

    const mockOnMessageReceived = jest.fn();

    const { result } = renderHook(() =>
      useAIResponse({
        chatId: mockChatId,
        onMessageReceived: mockOnMessageReceived,
        onError: jest.fn(),
      })
    );

    act(() => {
      result.current.fetchAIResponse(mockMessages);
    });

    await waitFor(() => {
      expect(mockOnMessageReceived).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'I am Google AI, here to help!',
          isAi: true,
        })
      );
    });
  });

  it('handles streaming responses correctly', async () => {
    const mockStreamingChunks = [
      { content: 'Hello', isComplete: false },
      { content: 'Hello, how', isComplete: false },
      { content: 'Hello, how can I help you?', isComplete: true },
    ];

    const { OpenAIClient } = require('../../services/apiClients');
    OpenAIClient.mockImplementation(() => ({
      createChatCompletion: jest.fn().mockImplementation(() => {
        return {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(`data: ${JSON.stringify(mockStreamingChunks[0])}\n`)
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(`data: ${JSON.stringify(mockStreamingChunks[1])}\n`)
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(`data: ${JSON.stringify(mockStreamingChunks[2])}\n`)
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        };
      }),
    }));

    const { result } = renderHook(() =>
      useAIResponse({
        chatId: mockChatId,
        onMessageReceived: jest.fn(),
        onError: jest.fn(),
      })
    );

    act(() => {
      result.current.fetchAIResponse(mockMessages);
    });

    await waitFor(() => {
      expect(result.current.currentResponse).toBe('Hello, how can I help you?');
      expect(result.current.isStreaming).toBe(false);
    });
  });

  it('handles cancellation correctly', async () => {
    const abortControllerSpy = jest.spyOn(AbortController.prototype, 'abort');

    const { result } = renderHook(() =>
      useAIResponse({
        chatId: mockChatId,
        onMessageReceived: jest.fn(),
        onError: jest.fn(),
      })
    );

    act(() => {
      result.current.cancelResponse();
    });

    expect(abortControllerSpy).toHaveBeenCalled();
  });
});
```

### **Integration Testing**
```typescript
// File: __tests__/integration/ChatFlow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { ChatScreen } from '../../screens/ChatScreen';

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock Chat Context
jest.mock('../../contexts/ChatContext', () => ({
  useChat: jest.fn(),
  ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Chat Flow Integration', () => {
  const mockChatId = 'chat-123';
  const mockMessages = [
    {
      id: 'msg-1',
      content: 'Hello',
      isAi: false,
      createdAt: Date.now() - 60000,
    },
    {
      id: 'msg-2',
      content: 'Hi! How can I help you?',
      isAi: true,
      createdAt: Date.now() - 30000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useChat hook
    const mockUseChat = require('../../contexts/ChatContext').useChat;
    mockUseChat.mockReturnValue({
      messages: mockMessages,
      isTyping: false,
      sendMessage: jest.fn(),
      loadMoreMessages: jest.fn(),
      hasMoreMessages: false,
    });
  });

  it('displays chat messages correctly', async () => {
    render(<ChatScreen chatId={mockChatId} />);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeTruthy();
      expect(screen.getByText('Hi! How can I help you?')).toBeTruthy();
    });

    // Check message styling
    const userMessage = screen.getByText('Hello');
    const aiMessage = screen.getByText('Hi! How can I help you?');

    // User message should be right-aligned
    expect(userMessage.parent?.parent?.props.style).toMatchObject({
      alignSelf: 'flex-end',
    });

    // AI message should be left-aligned
    expect(aiMessage.parent?.parent?.props.style).toMatchObject({
      alignSelf: 'flex-start',
    });
  });

  it('sends message and shows typing indicator', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue(undefined);

    const mockUseChat = require('../../contexts/ChatContext').useChat;
    mockUseChat.mockReturnValue({
      messages: mockMessages,
      isTyping: false,
      sendMessage: mockSendMessage,
      loadMoreMessages: jest.fn(),
      hasMoreMessages: false,
    });

    render(<ChatScreen chatId={mockChatId} />);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTestId('send-button');

    // Type message
    fireEvent.changeText(input, 'How are you?');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('How are you?', 'text');
    });

    // Check if message was added to UI
    expect(screen.getByText('How are you?')).toBeTruthy();
  });

  it('handles message sending errors gracefully', async () => {
    const mockSendMessage = jest.fn().mockRejectedValue(new Error('Network error'));

    const mockUseChat = require('../../contexts/ChatContext').useChat;
    mockUseChat.mockReturnValue({
      messages: mockMessages,
      isTyping: false,
      sendMessage: mockSendMessage,
      loadMoreMessages: jest.fn(),
      hasMoreMessages: false,
      error: null,
    });

    render(<ChatScreen chatId={mockChatId} />);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.changeText(input, 'Test message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeTruthy();
    });

    // Message should still be in input
    expect(input.props.value).toBe('Test message');
  });

  it('loads more messages when scrolling to top', async () => {
    const mockLoadMoreMessages = jest.fn();

    const mockUseChat = require('../../contexts/ChatContext').useChat;
    mockUseChat.mockReturnValue({
      messages: mockMessages,
      isTyping: false,
      sendMessage: jest.fn(),
      loadMoreMessages: mockLoadMoreMessages,
      hasMoreMessages: true,
    });

    render(<ChatScreen chatId={mockChatId} />);

    const scrollView = screen.getByTestId('chat-scroll-view');

    // Simulate scroll to top
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 },
      },
    });

    await waitFor(() => {
      expect(mockLoadMoreMessages).toHaveBeenCalled();
    });
  });
});
```

### **E2E Testing with Detox**
```javascript
// File: e2e/ChatFlow.e2e.js
describe('Chat Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should complete full chat flow from login to message exchange', async () => {
    // Navigate to login screen
    await expect(element(by.id('login-screen'))).toBeVisible();

    // Enter login credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for navigation to main app
    await waitFor(element(by.id('tab-bar')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to chat tab
    await element(by.id('chat-tab')).tap();

    // Wait for chat screen to load
    await expect(element(by.id('chat-screen'))).toBeVisible();

    // Send a message
    await element(by.id('message-input')).typeText('Hello, AI!');
    await element(by.id('send-button')).tap();

    // Wait for AI response
    await waitFor(element(by.text('Hello! How can I help you?')))
      .toBeVisible()
      .withTimeout(15000);

    // Verify message appears in chat
    await expect(element(by.text('Hello, AI!'))).toBeVisible();
    await expect(element(by.text('Hello! How can I help you?'))).toBeVisible();

    // Test message input clearing
    await expect(element(by.id('message-input'))).toHaveText('');
  });

  it('should handle media attachment and sending', async () => {
    // Login and navigate to chat
    await loginAndNavigateToChat();

    // Open attachment menu
    await element(by.id('attach-button')).tap();
    await expect(element(by.id('attachment-menu'))).toBeVisible();

    // Select image attachment
    await element(by.id('image-attachment')).tap();

    // Handle permission dialog (if appears)
    try {
      await element(by.text('Allow')).tap();
    } catch (e) {
      // Permission already granted
    }

    // Select image from gallery
    await element(by.id('gallery-image-0')).tap();

    // Verify image preview appears
    await expect(element(by.id('image-preview'))).toBeVisible();

    // Send image
    await element(by.id('send-button')).tap();

    // Verify image message appears
    await waitFor(element(by.id('image-message')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle offline scenarios gracefully', async () => {
    // Login and navigate to chat
    await loginAndNavigateToChat();

    // Disable network
    await device.setNetworkConnection({ type: 'none' });

    // Try to send message
    await element(by.id('message-input')).typeText('Offline message');
    await element(by.id('send-button')).tap();

    // Verify offline indicator appears
    await expect(element(by.id('offline-indicator'))).toBeVisible();

    // Re-enable network
    await device.setNetworkConnection({ type: 'wifi' });

    // Wait for sync
    await waitFor(element(by.id('sync-indicator')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify message eventually sends
    await waitFor(element(by.text('Offline message')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle app restart and state restoration', async () => {
    // Login and send a message
    await loginAndNavigateToChat();
    await element(by.id('message-input')).typeText('Persistent message');
    await element(by.id('send-button')).tap();

    // Verify message appears
    await expect(element(by.text('Persistent message'))).toBeVisible();

    // Restart app
    await device.terminateApp();
    await device.launchApp();

    // Re-login
    await loginAndNavigateToChat();

    // Verify message is still there
    await expect(element(by.text('Persistent message'))).toBeVisible();
  });
});

// Helper functions
async function loginAndNavigateToChat() {
  await element(by.id('email-input')).typeText('test@example.com');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();
  await waitFor(element(by.id('tab-bar'))).toBeVisible().withTimeout(10000);
  await element(by.id('chat-tab')).tap();
  await expect(element(by.id('chat-screen'))).toBeVisible();
}
```

---

This detailed low-level design document provides comprehensive specifications for implementing the Cura Health app, covering component architectures, API integrations, state management, error handling, performance optimizations, and testing strategies. Each section includes concrete code examples, implementation details, and best practices to guide the development team through the complete implementation process.
