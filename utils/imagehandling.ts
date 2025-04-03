import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const uploadImageFromLibrary = async (
  generateUploadUrl: () => Promise<string>,
  options: { compress?: number; maxWidth?: number; maxHeight?: number } = {}
): Promise<string> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Permission required');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]?.uri) throw new Error('No image selected');

  try {
    // Compress and resize image
    const manipulatedImage = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: options.maxWidth || 800, height: options.maxHeight || 800 } }],
      {
        compress: options.compress || 0.7,
        format: SaveFormat.JPEG,
      }
    );

    // Read compressed image as base64
    const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to Convex
    const postUrl = await generateUploadUrl();
    const response = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body: Buffer.from(base64, 'base64'),
    });

    if (!response.ok) throw new Error('Upload failed');
    
    const { storageId } = await response.json();
    return storageId;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Image processing failed');
  }
};
