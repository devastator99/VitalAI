import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import * as ImageManipulator from "expo-image-manipulator";
import { Id } from "~/convex/_generated/dataModel";

// Create a custom hook that contains the mutations
export function useImageUpload() {
  const useImgManipulator = ImageManipulator.ImageManipulator.manipulate;
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveMediaFile = useMutation(api.files.saveMediaFile);

  // Return the handler function that uses these mutations
  return async (uri: string) => {
    try {
      // 1. Request permissions
      // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // if (status !== "granted") throw new Error("Photo permission denied");
      const context = useImgManipulator(uri);
      console.log("context : ",context);
      context.resize({width:700});
      const image = await context.renderAsync();
      console.log(image);
      const processedImage = await image.saveAsync({
        format: ImageManipulator.SaveFormat.JPEG,
      });
      console.log("processedImage : ",processedImage);
    
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

      console.log("uploadResult : ",uploadResult);

      if (!uploadResult.ok) throw new Error("Upload failed");
      const { storageId } = await uploadResult.json();
      console.log("storageId : ",storageId);
      // 7. Save processed image metadata (remove server-side processing)
      await saveMediaFile({
        storageId: storageId as Id<"_storage">,
        mimeType: "image/jpeg"
      });

      console.log("saved media file");

      return storageId;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };
}