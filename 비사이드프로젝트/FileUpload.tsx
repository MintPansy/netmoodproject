import axios from 'axios';
export default function FileUpload() {
  const [progress, setProgress] = useState(0);
  async function upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => { setProgress(Math.round((e.loaded / e.total) * 100)); }
    });
    const { uploadId } = resp.data;
    // subscribe socket to uploadId if needed
    // show UI
  }
}