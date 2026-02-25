export const uploadToCloudinary = async (file) => {

  const url = `https://api.cloudinary.com/v1_1/dfq0pmt5y/auto/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "serviceswap"); // preset you created

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    return data.secure_url; // final file URL

  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
};