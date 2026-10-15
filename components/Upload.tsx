import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

type UploadProps = {
  onComplete?: (base64: string) => void;
};

/** Lets signed-in users select a file, shows simulated progress, and calls onComplete with its data URL. */
const Upload: React.FC<UploadProps> = ( {onComplete} ) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  useEffect(
    () => () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    },
    [],
  );

  /** Reads a selected file as a data URL and simulates progress for signed-in users. */
  const processFile = (selectedFile: File | undefined) => {
    if (!isSignedIn || !selectedFile) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        console.error("Unable to read the selected file as Base64 data.");
        return;
      }

      const base64 = reader.result;
      let currentProgress = 0;

      intervalRef.current = window.setInterval(() => {
        currentProgress = Math.min(
          currentProgress + PROGRESS_INCREMENT,
          100,
        );
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          redirectTimeoutRef.current = window.setTimeout(() => {
            onComplete?.(base64);
            redirectTimeoutRef.current = null;
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };
    reader.onerror = () => {
      console.error("Unable to read the selected file.", reader.error);
    };
    reader.readAsDataURL(selectedFile);
  };

  /** Processes the first file selected through the input when signed in. */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    processFile(event.currentTarget.files?.[0]);
  };

  /** Prevents default drag behavior and highlights the dropzone for signed-in users. */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isSignedIn) setIsDragging(true);
  };

  /** Clears the dropzone highlight when the dragged file leaves. */
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  /** Prevents default drop behavior and processes the first file when signed in. */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    processFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg, .jpeg, .png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to Upload or just Drag and Drop"
                : "Sign in or sign up with puter to upload"}
            </p>
            <p className="help">Maximum file size 50MB</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <div>{file.name}</div>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? "Analyzing Floor Plan" : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
