import * as DocumentPicker from "expo-document-picker";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

// Hook for handling file uploads
export const useFileUpload = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveMediaFile = useMutation(api.files.saveMediaFile);

  const handleFileUpload = async () => {
    try {
      // 1. Launch the document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow all file types; customize if needed (e.g. "application/pdf")
        copyToCacheDirectory: true,
      });

      // 2. Get file details (uri, name, and optionally mimeType)
      if (!result.assets || result.assets.length === 0) return null;

      const { uri } = result.assets[0];
      // For mimeType, you may either rely on DocumentPicker (if provided) or derive it later from the blob
      // Here we assume the blob type will provide a fallback.
      
      // 3. Generate an upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 4. Fetch the file data and convert it to a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // 5. Upload the file using the generated URL
      const uploadResult = await fetch(postUrl, {
        method: "POST",
        headers: {
          // Use the blob type if available, otherwise default to application/octet-stream
          "Content-Type": blob.type || "application/octet-stream",
        },
        body: blob,
      });

      if (!uploadResult.ok) throw new Error("File upload failed");
      const { storageId } = await uploadResult.json();

      // 6. Save file metadata, including mime type and file name
      await saveMediaFile({
        storageId,
        mimeType: blob.type || "application/octet-stream",
      });

      return storageId;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  return { handleFileUpload };
};


// const compressFile = async (fileUri: string): Promise<string> => {
//     try {
//       // Define the target path for the compressed file
//       const targetPath = FileSystem.documentDirectory + 'compressed.zip';
//       // Compress the file (or folder) into a zip archive
//       const zipPath = await zip(fileUri, targetPath);
//       return zipPath;
//     } catch (error) {
//       console.error("Compression failed:", error);
//       throw error;
//     }
//   };
