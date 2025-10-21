import React, { useState } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import PlatformBadge from "./platformbadge";
// import { downloadMedia } from "../api/extractor";
import "./components.module.css";

const DownloadOptions = ({ proxyUrl, title, platform, backendRoot, thumbnail, originalUrl }) => {
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async (kind = "video") => {
    try {
      if (kind === "video") setLoadingVideo(true);
      if (kind === "audio") setLoadingAudio(true);
      setDone(false);
      setError(null);

      console.log(`🎯 Starting ${kind} download...`);
      console.log(`Platform: ${platform}`);
      console.log(`Proxy URL: ${proxyUrl}`);
      console.log(`Original URL: ${originalUrl}`);
      console.log(`Title: ${title}`);

      // Build download URL
      let downloadUrl;
      
      if (proxyUrl.startsWith('/api')) {
        downloadUrl = `${backendRoot}${proxyUrl}`;
      } else if (proxyUrl.startsWith('http')) {
        downloadUrl = proxyUrl;
      } else {
        throw new Error('Invalid proxy URL format');
      }

      // Add kind parameter for audio downloads
      if (kind === 'audio' && !downloadUrl.includes('kind=')) {
        const separator = downloadUrl.includes('?') ? '&' : '?';
        downloadUrl += `${separator}kind=audio`;
      }

      console.log(`🎯 Final download URL: ${downloadUrl}`);

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Download failed:', errorText);
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'video'}.${kind === 'audio' ? 'mp3' : 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(blobUrl);

      setDone(true);
      console.log(`✅ ${kind} download completed`);

    } catch (err) {
      console.error(`❌ ${kind} download failed:`, err);
      setError(err.message || `Failed to download ${kind}. Please try again.`);
    } finally {
      setLoadingVideo(false);
      setLoadingAudio(false);
      setTimeout(() => {
        setDone(false);
        setError(null);
      }, 3000);
    }
  };

  const getThumbnailSrc = () => {
    if (!thumbnail) return null;
    
    // Handle absolute URLs
    if (thumbnail.startsWith("http")) {
      return thumbnail;
    }
    
    // Handle relative URLs
    if (thumbnail.startsWith("/")) {
      return `${backendRoot}${thumbnail}`;
    }
    
    return `${backendRoot}/${thumbnail}`;
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
            onError={(e) => {
              console.warn("Thumbnail failed to load:", getThumbnailSrc());
              e.target.style.display = "none";
            }}
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

          {/* Error Display */}
          {error && (
            <div
              className="alert alert-danger d-flex align-items-center mb-3"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "8px",
                padding: "0.75rem",
              }}
            >
              <AlertCircle size={18} className="me-2" />
              <small>{error}</small>
            </div>
          )}

          <ButtonGroup vertical className="w-100">
            {/* Video Download Button */}
            <Button
              onClick={() => handleDownload("video")}
              disabled={loadingVideo || loadingAudio}
              style={{
                background: loadingVideo
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                padding: "0.9rem 1rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "all 0.3s ease",
              }}
            >
              {loadingVideo ? (
                <>
                  <Loader2 className="me-2 animate-spin" size={18} style={{ display: "inline" }} />
                  Downloading...
                </>
              ) : done && !loadingAudio ? (
                <>
                  <CheckCircle className="me-2" size={18} style={{ display: "inline", color: "#10b981" }} />
                  Done!
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Download HD Video
                </>
              )}
            </Button>

            {/* Audio Download Button */}
            <Button
              onClick={() => handleDownload("audio")}
              disabled={loadingVideo || loadingAudio}
              style={{
                background: loadingAudio
                  ? "rgba(253, 183, 20, 0.3)"
                  : "rgba(253, 183, 20, 0.15)",
                border: "2px solid rgba(253, 183, 20, 0.5)",
                color: "#fcd34d",
                borderRadius: "10px",
                fontWeight: "600",
                padding: "0.9rem 1rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
              }}
            >
              {loadingAudio ? (
                <>
                  <Loader2 className="me-2 animate-spin" size={18} style={{ display: "inline" }} />
                  Processing...
                </>
              ) : done && !loadingVideo ? (
                <>
                  <CheckCircle className="me-2" size={18} style={{ display: "inline", color: "#10b981" }} />
                  Done!
                </>
              ) : (
                <>
                  <i className="bi bi-music-note-beamed me-2"></i>
                  Audio Only (MP3)
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