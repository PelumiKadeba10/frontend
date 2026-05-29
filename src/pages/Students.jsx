import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

import { api } from "../api/client";

export default function Students() {
  const webcamRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    matricNo: "",
    department: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  const [captureMode, setCaptureMode] = useState("upload");

  const [capturedImages, setCapturedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  useEffect(() => {
    async function loadDevices() {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(
          (device) => device.kind === "videoinput"
        );

        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadDevices();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const captureImage = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;

    setCapturedImages((prev) => [...prev, screenshot]);
  };

  const removeCapturedImage = (index) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCapturedImages = () => {
    setCapturedImages([]);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
  };

  const base64ToFile = async (base64, filename) => {
    const response = await fetch(base64);
    const blob = await response.blob();

    return new File([blob], filename, {
      type: "image/jpeg",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("matric_no", form.matricNo);
      formData.append("department", form.department);

      if (captureMode === "upload") {
        uploadedFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (captureMode === "camera") {
        for (let i = 0; i < capturedImages.length; i++) {
          const imageFile = await base64ToFile(
            capturedImages[i],
            `${form.matricNo}_${i + 1}.jpg`
          );

          formData.append("images", imageFile);
        }
      }

      const res = await api.post("/students/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res?.data;

      const isSuccess =
        res.status >= 200 &&
        res.status < 300 &&
        (data?.success === true || data?.success === undefined);

      if (isSuccess) {
        setError(null);
        setForm({
          name: "",
          matricNo: "",
          department: "",
        });

        setCapturedImages([]);
        setUploadedFiles([]);

        setFeedback({
          type: "success",
          message: data?.message ?? "Student enrolled successfully.",
        });
      } else {
        setFeedback({
          type: "error",
          message: data?.message ?? "Failed to enroll student.",
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error ?? "Failed to enroll student.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Enrollment</p>
          <h1>Students</h1>
          <p className="muted">Manage students synced with backend.</p>
        </div>
      </header>

      {feedback ? (
        <div className={`banner banner-${feedback.type}`}>{feedback.message}</div>
      ) : null}

      {error ? <div className="banner banner-error">{error}</div> : null}

      <section className="panel create-student-card">
        <div className="create-student-header">
          <p className="eyebrow">Enrollment Form</p>
          <h2>Register New Student</h2>
          <p className="muted">
            Add a student record and attach reference images for attendance.
          </p>
        </div>

        <form className="create-student-grid" onSubmit={handleSubmit}>
          <label className="create-student-field create-student-span-2">
            <span className="create-student-label">Full Name</span>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
            />
          </label>

          <label className="create-student-field">
            <span className="create-student-label">Matric Number</span>
            <input
              className="input"
              name="matricNo"
              value={form.matricNo}
              onChange={handleChange}
              required
              placeholder="ENG/1234"
            />
          </label>

          <label className="create-student-field">
            <span className="create-student-label">Department</span>
            <input
              className="input"
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              placeholder="Computer Engineering"
            />
          </label>

          <div className="create-student-field create-student-span-2">
            <label className="create-student-label">Image Input Method</label>
            <select
              className="input"
              value={captureMode}
              onChange={(e) => setCaptureMode(e.target.value)}
            >
              <option value="upload">Upload Images</option>
              <option value="camera">Live Camera Capture</option>
            </select>
          </div>

          {captureMode === "upload" && (
            <div className="camera-section create-student-span-2">
              <label className="create-student-label">Upload Student Images</label>

              <input
                className="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              {uploadedFiles.length > 0 && (
                <>
                  <div className="preview-grid">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="preview">
                        <img src={URL.createObjectURL(file)} alt={`Upload ${index}`} width="150" />

                        <button
                          type="button"
                          className="secondary"
                          onClick={() => removeUploadedFile(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="secondary create-student-secondary"
                    onClick={clearUploadedFiles}
                  >
                    Clear All Uploads
                  </button>
                </>
              )}
            </div>
          )}

          {captureMode === "camera" && (
            <div className="camera-section create-student-span-2">
              <label className="create-student-label">Select Camera</label>

              <select
                className="input"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>

              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: selectedDevice,
                }}
                className="webcam"
              />

              <button type="button" onClick={captureImage} className="secondary create-student-secondary">
                Capture Image
              </button>

              {capturedImages.length > 0 && (
                <>
                  <div className="preview-grid">
                    {capturedImages.map((image, index) => (
                      <div key={index} className="preview">
                        <img src={image} alt={`Capture ${index}`} width="140" />

                        <button
                          type="button"
                          className="secondary"
                          onClick={() => removeCapturedImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="secondary create-student-secondary"
                    onClick={clearCapturedImages}
                  >
                    Clear All Captures
                  </button>
                </>
              )}
            </div>
          )}

          <button type="submit" className="primary create-student-submit" disabled={submitting}>
            {submitting ? "Enrolling..." : "Enroll Student"}
          </button>
        </form>
      </section>
    </section>
  );
}
