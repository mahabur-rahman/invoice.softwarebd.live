import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

export const uploadLogo = async (
  options: RcCustomRequestOptions
): Promise<string> => {
  const { file, onSuccess, onError } = options;

  try {
    if (!(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    // 🔥 Cloudinary Environment Variables
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error("Missing Cloudinary configuration");
    }

    // 1️⃣ Prepare upload form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    // 2️⃣ Upload to Cloudinary
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

    const data = await uploadRes.json();

    // 3️⃣ Extract secure image URL
    const imageUrl = data.secure_url;

    onSuccess?.(file);
    return imageUrl;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    onError?.(err as Error);
    throw err;
  }
};
