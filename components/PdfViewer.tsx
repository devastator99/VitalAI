import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import Colors from '~/utils/Colors';

export default function PdfViewer({ fileUri }: { fileUri: string }) {
  const handleShare = async () => {
    try {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1,
        backgroundColor: Colors.PitchBlack,
        borderRadius: 20,
        padding: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      }}>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-social" size={24} color={Colors.deepSkyBlue} />
        </TouchableOpacity>
      </View>
      <WebView 
        source={{ uri: fileUri }} 
        style={{ flex: 1 }} 
      />
    </View>
  );
}
