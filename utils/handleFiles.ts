import * as DocumentPicker from "expo-document-picker";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

// Hook for handling file uploads
export function useFileUpload () {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveMediaFile = useMutation(api.files.saveMediaFile);

  return async (uri: string) => {
    try {
      // Remove DocumentPicker and directly use the provided uri
      if (!uri) return null; // Check if uri is provided

      // 4. Fetch the file data and convert it to a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // 5. Generate an upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 6. Upload the file using the generated URL
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

      // 7. Save file metadata, including mime type and file name
      await saveMediaFile({
        storageId: storageId as Id<"_storage">,
        mimeType: blob.type || "application/octet-stream",
      });

      return storageId;
      console.log("got the storageId : ",storageId);
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };
}