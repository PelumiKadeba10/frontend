import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

import { api, endpoints } from "../api/client";
import { DataTable } from "../components/DataTable";
import { useApiData } from "../hooks/useApiData";

export default function Students() {
  const {
    data: students,
    loading,
    error,
    refetch,
  } = useApiData(endpoints.students);

  const webcamRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    matricNo: "",
    department: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [feedback, setFeedback] =
    useState(null);

  const [captureMode, setCaptureMode] =
    useState("upload");

  // MULTIPLE IMAGES
  const [capturedImages, setCapturedImages] =
    useState([]);

  const [uploadedFiles, setUploadedFiles] =
    useState([]);

  const [devices, setDevices] = useState([]);

  const [selectedDevice, setSelectedDevice] =
    useState("");

  // LOAD CAMERAS
  useEffect(() => {
    async function loadDevices() {
      try {
        const mediaDevices =
          await navigator.mediaDevices.enumerateDevices();

        const videoDevices = mediaDevices.filter(
          (device) =>
            device.kind === "videoinput"
        );

        setDevices(videoDevices);

        if (videoDevices.length > 0) {
          setSelectedDevice(
            videoDevices[0].deviceId
          );
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
      [event.target.name]:
        event.target.value,
    }));
  };

  // CAPTURE IMAGE
  const captureImage = () => {
    const screenshot =
      webcamRef.current?.getScreenshot();

    if (!screenshot) return;

    setCapturedImages((prev) => [
      ...prev,
      screenshot,
    ]);
  };

  // REMOVE CAPTURED IMAGE
  const removeCapturedImage = (index) => {
    setCapturedImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // CLEAR CAPTURED IMAGES
  const clearCapturedImages = () => {
    setCapturedImages([]);
  };

  // HANDLE MULTIPLE FILES
  const handleFileChange = (event) => {
    const files = Array.from(
      event.target.files
    );

    setUploadedFiles((prev) => [
      ...prev,
      ...files,
    ]);
  };

  // REMOVE UPLOADED FILE
  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // CLEAR UPLOADED FILES
  const clearUploadedFiles = () => {
    setUploadedFiles([]);
  };

  // BASE64 -> FILE
  const base64ToFile = async (
    base64,
    filename
  ) => {
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

    try {
      const formData = new FormData();

      formData.append("name", form.name);

      formData.append(
        "matric_no",
        form.matricNo
      );

      formData.append(
        "department",
        form.department
      );

      // UPLOAD MODE
      if (captureMode === "upload") {
        uploadedFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      // CAMERA MODE
      if (captureMode === "camera") {
        for (
          let i = 0;
          i < capturedImages.length;
          i++
        ) {
          const imageFile =
            await base64ToFile(
              capturedImages[i],
              `${form.matricNo}_${i + 1}.jpg`
            );

          formData.append(
            "images",
            imageFile
          );
        }
      }

      await api.post(
        endpoints.students,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setForm({
        name: "",
        matricNo: "",
        department: "",
      });

      setCapturedImages([]);

      setUploadedFiles([]);

      setFeedback({
        type: "success",
        message:
          "Student enrolled successfully.",
      });

      refetch();
    } catch (err) {
      console.error(err);

      setFeedback({
        type: "error",
        message:
          err.response?.data?.error ??
          "Failed to enroll student.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const rows = students.map((student) => ({
    id: student.id,
    name: student.name,
    matric_no: student.matric_no,
    department: student.department,
    created_at: student.created_at
      ? new Date(
          student.created_at
        ).toLocaleString()
      : "—",
  }));

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Enrollment
          </p>

          <h1>Students</h1>

          <p className="muted">
            Manage students synced with
            backend.
          </p>
        </div>
      </header>

      {feedback ? (
        <div
          className={`banner banner-${feedback.type}`}
        >
          {feedback.message}
        </div>
      ) : null}

      {error ? (
        <div className="banner banner-error">
          {error}
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Register New Student</h2>
        </div>

        <form
          className="form-grid"
          onSubmit={handleSubmit}
        >
          <label>
            Full Name

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
            />
          </label>

          <label>
            Matric Number

            <input
              name="matricNo"
              value={form.matricNo}
              onChange={handleChange}
              required
              placeholder="ENG/1234"
            />
          </label>

          <label>
            Department

            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              placeholder="Computer Engineering"
            />
          </label>

          {/* MODE SELECT */}
          <div>
            <label>
              Image Input Method
            </label>

            <select
              value={captureMode}
              onChange={(e) =>
                setCaptureMode(
                  e.target.value
                )
              }
            >
              <option value="upload">
                Upload Images
              </option>

              <option value="camera">
                Live Camera Capture
              </option>
            </select>
          </div>

          {/* UPLOAD MODE */}
          {captureMode === "upload" && (
            <div className="camera-section">
              <label>
                Upload Student Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              {uploadedFiles.length >
                0 && (
                <>
                  <div className="preview-grid">
                    {uploadedFiles.map(
                      (file, index) => (
                        <div
                          key={index}
                          className="preview"
                        >
                          <img
                            src={URL.createObjectURL(
                              file
                            )}
                            alt={`Upload ${index}`}
                            width="150"
                          />

                          <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                              removeUploadedFile(
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      clearUploadedFiles
                    }
                  >
                    Clear All Uploads
                  </button>
                </>
              )}
            </div>
          )}

          {/* CAMERA MODE */}
          {captureMode === "camera" && (
            <div className="camera-section">
              <label>
                Select Camera
              </label>

              <select
                value={selectedDevice}
                onChange={(e) =>
                  setSelectedDevice(
                    e.target.value
                  )
                }
              >
                {devices.map(
                  (device, index) => (
                    <option
                      key={device.deviceId}
                      value={
                        device.deviceId
                      }
                    >
                      {device.label ||
                        `Camera ${
                          index + 1
                        }`}
                    </option>
                  )
                )}
              </select>

              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId:
                    selectedDevice,
                }}
                className="webcam"
              />

              <button
                type="button"
                onClick={captureImage}
                className="secondary"
              >
                Capture Image
              </button>

              {capturedImages.length >
                0 && (
                <>
                  <div className="preview-grid">
                    {capturedImages.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={index}
                          className="preview"
                        >
                          <img
                            src={image}
                            alt={`Capture ${index}`}
                            width="140"
                          />

                          <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                              removeCapturedImage(
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      clearCapturedImages
                    }
                  >
                    Clear All Captures
                  </button>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            className="primary"
            disabled={submitting}
          >
            {submitting
              ? "Enrolling..."
              : "Enroll Student"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>All Students</h2>
        </div>

        {loading ? (
          <p className="muted">
            Loading students...
          </p>
        ) : (
          <DataTable
            columns={[
              {
                key: "name",
                label: "Name",
              },
              {
                key: "matric_no",
                label: "Matric No",
              },
              {
                key: "department",
                label: "Department",
              },
              {
                key: "created_at",
                label: "Created",
              },
            ]}
            rows={rows}
            emptyLabel="No students found."
          />
        )}
      </section>
    </section>
  );
}