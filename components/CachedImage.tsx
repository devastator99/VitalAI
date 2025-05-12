import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, ImageRequireSource } from 'react-native';
import FastImage, { ResizeMode } from '@d11/react-native-fast-image';
import { MotiView } from 'moti';

interface CachedImageProps {
  source: string | ImageRequireSource;
  style: any; // Using any to bypass strict typing constraints
  containerStyle?: ViewStyle;
  resizeMode?: ResizeMode;
  fallbackColor?: string;
  loaderColor?: string;
  loaderSize?: number | 'small' | 'large';
  tintColor?: string;
  showLoader?: boolean;
}

const CachedImage: React.FC<CachedImageProps> = ({
  source,
  style,
  containerStyle,
  resizeMode = FastImage.resizeMode.cover,
  fallbackColor = '#2a2a2a',
  loaderColor = '#53a6fd',
  loaderSize = 'small',
  tintColor,
  showLoader = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Prepare source object based on source type
  const imageSource = typeof source === 'string' 
    ? {
        uri: source,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable
      } 
    : source;

  return (
    <View style={[styles.container, containerStyle]}>
      {isLoading && showLoader && (
        <View style={[styles.skeleton, { backgroundColor: fallbackColor }]}>
          <MotiView
            from={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              loop: true,
              repeatReverse: true,
            }}
            style={styles.skeletonAnimation}
          />
          <ActivityIndicator 
            size={loaderSize} 
            color={loaderColor} 
            style={styles.loader} 
          />
        </View>
      )}
      
      <FastImage
        source={imageSource}
        style={[
          style, 
          (isLoading || hasError) && styles.hidden
        ]}
        resizeMode={resizeMode}
        tintColor={tintColor}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {hasError && (
        <View style={styles.fallback}>
          <ActivityIndicator size={loaderSize} color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  hidden: {
    opacity: 0,
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(50, 50, 50, 0.3)',
  },
  loader: {
    position: 'absolute',
  },
  fallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CachedImage; 