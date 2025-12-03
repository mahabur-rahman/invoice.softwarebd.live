import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";

export const uploadLogo = async (
    options: RcCustomRequestOptions
): Promise<string> => {
    const { file, onSuccess, onError } = options;

    try {
        if (!(file instanceof File)) {
            throw new Error("Invalid file provided");
        }

        // 1️⃣ Request pre-signed URL from backend
        const res = await fetch(
            `/api/s3-presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`
        );


        if (!res.ok) throw new Error("Failed to fetch pre-signed URL");

        const { url, key } = await res.json();

        // 2️⃣ Upload to S3 using the signed URL
        const uploadRes = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload file to S3");

        // 3️⃣ Return the final public S3 URL
        const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

        onSuccess?.(file);
        return imageUrl;
    } catch (err) {
        console.error("Upload failed:", err);
        onError?.(err as Error);
        throw err;
    }
};
