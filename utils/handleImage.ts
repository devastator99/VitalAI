import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import * as ImageManipulator from "expo-image-manipulator";

export const useImageUpload = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
//   const processImage = useAction(api.files.processImageWithSharp);
  const saveMediaFile = useMutation(api.files.saveMediaFile);

  const handleImageUpload = async () => {
    try {
      // 1. Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") throw new Error("Photo permission denied");

      // 2. Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1, // Keep full quality for server processing
      });

      if (result.canceled || !result.assets?.[0]) return null;

      // 3. Get image details
      const { uri, type } = result.assets[0];
      
      // 4. Process image client-side
      const context = ImageManipulator.useImageManipulator(uri);
      context.resize({width:1200});
      const image = await context.renderAsync();
      const processedImage = await image.saveAsync({
        format: ImageManipulator.SaveFormat.JPEG,
      });
    
      // 5. Upload processed image
      const postUrl = await generateUploadUrl();
      const response = await fetch(processedImage.uri);
      const blob = await response.blob();

      // 6. Upload to Convex storage
      const uploadResult = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      if (!uploadResult.ok) throw new Error("Upload failed");
      const { storageId } = await uploadResult.json();

      // 7. Save processed image metadata (remove server-side processing)
      await saveMediaFile({
        storageId,
        mimeType: "image/jpeg"
      });

      return storageId;

    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  return { handleImageUpload };
};