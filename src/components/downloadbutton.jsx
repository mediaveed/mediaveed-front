import React, { useState } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { Loader2, CheckCircle } from "lucide-react";
import PlatformBadge from "./platformBadge";
import "./components.module.css";

const DownloadOptions = ({ proxyUrl, title, platform, backendRoot, thumbnail }) => {
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async (kind = "video") => {
    try {
      if (kind === "video") setLoadingVideo(true);
      if (kind === "audio") setLoadingAudio(true);
      setDone(false);

      let url;
      if (proxyUrl.startsWith("/api")) {
        url = `${backendRoot}${proxyUrl}`;
      } else {
        url = `${backendRoot}/api/v1/${platform}/download?video_url=${encodeURIComponent(
          proxyUrl
        )}&title=${encodeURIComponent(title)}&kind=${kind}`;
      }

      console.log("🎯 Download URL:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title || "video"}.${kind === "audio" ? "mp3" : "mp4"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      setDone(true);
    } catch (err) {
      console.error("❌ Download failed:", err);
      alert("Failed to download. Please try again.");
    } finally {
      setLoadingVideo(false);
      setLoadingAudio(false);
      setTimeout(() => setDone(false), 3000);
    }
  };
  const getThumbnailSrc = () => {
    if (!thumbnail) return null;
    return thumbnail.startsWith("http")
      ? thumbnail
      : `${backendRoot}${thumbnail}`;
  };

  return (
    <div className="download-section d-flex justify-content-center mt-5 mb-5">
      <Card
        className="shadow-lg border-0"
        style={{
          width: "25rem",
          borderRadius: "1rem",
          background: "linear-gradient(145deg, rgba(17,24,39,0.95), rgba(31,41,55,0.85))",
          color: "white",
          overflow: "hidden",
        }}
      >
        {thumbnail && (
          <Card.Img
            variant="top"
          src={getThumbnailSrc()}
             alt={title || "Video Thumbnail"}
            style={{
              height: "200px",
              objectFit: "cover",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
        )}

        <Card.Body className="text-center p-4">
          {/* Platform Badge */}
          <div className="d-flex justify-content-center mb-3">
            <PlatformBadge platform={platform} />
          </div>

          <Card.Title className="fw-bold mb-2" style={{ fontSize: "1.3rem", color: "#f8fafc" }}>
            {title || "Ready to Download"}
          </Card.Title>

          <Card.Text className="mb-4" style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
            Choose your preferred format 👇
          </Card.Text>

          <ButtonGroup vertical className="w-100">
            <Button
              onClick={() => handleDownload("video")}
              disabled={loadingVideo || loadingAudio}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                padding: "0.9rem 1rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              {loadingVideo ? (
                <>
                  <Loader2 className="me-2 animate-spin" size={18} /> Downloading...
                </>
              ) : done ? (
                <>
                  <CheckCircle className="me-2 text-green-400" size={18} /> Done!
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i> Download HD Video
                </>
              )}
            </Button>

            <Button
              onClick={() => handleDownload("audio")}
              disabled={loadingVideo || loadingAudio}
              style={{
                background: "rgba(253, 183, 20, 0.15)",
                border: "2px solid rgba(253, 183, 20, 0.5)",
                color: "#fcd34d",
                borderRadius: "10px",
                fontWeight: "600",
                padding: "0.9rem 1rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {loadingAudio ? (
                <>
                  <Loader2 className="me-2 animate-spin" size={18} /> Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-music-note-beamed me-2"></i> Audio Only (MP3)
                </>
              )}
            </Button>
          </ButtonGroup>

          <div
            className="text-center mt-4"
            style={{ fontSize: "0.85rem", color: "#9ca3af" }}
          >
            <i className="bi bi-info-circle me-1"></i>
            Best available quality from {platform || "source"}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DownloadOptions;
