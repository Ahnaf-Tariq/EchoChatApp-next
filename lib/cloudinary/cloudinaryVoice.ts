import axios from "axios";

export const uploadCloudinaryVoice = async (blob: Blob) => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary name & preset not found in env file");
      return null;
    }

    const audioFile = new File([blob], `voice-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "video");
    formData.append("folder", "chat-app-voices");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload voice msg error:" + error);
    return null;
  }
};
