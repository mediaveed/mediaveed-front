import React, { useState } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { Loader2, CheckCircle, AlertCircle, Download, Music } from "lucide-react";
import PlatformBadge from "./platformbadge";
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

      // Build download URL - ALWAYS use original URL for TikTok
      let downloadUrl;

      if (platform === 'tiktok' && originalUrl) {
        // For TikTok, construct URL with original TikTok URL (not CDN)
        const encodedUrl = encodeURIComponent(originalUrl);
        const encodedTitle = encodeURIComponent(title || 'TikTok_Video');
        downloadUrl = `${backendRoot}/api/v1/tiktok/download?video_url=${encodedUrl}&title=${encodedTitle}&kind=${kind}`;
        console.log(`🎯 Using original TikTok URL for download`);
      } else if (proxyUrl.startsWith('/api')) {
        downloadUrl = `${backendRoot}${proxyUrl}`;
        // Add kind parameter for audio downloads
        if (kind === 'audio' && !downloadUrl.includes('kind=')) {
          const separator = downloadUrl.includes('?') ? '&' : '?';
          downloadUrl += `${separator}kind=audio`;
        }
      } else if (proxyUrl.startsWith('http')) {
        downloadUrl = proxyUrl;
      } else {
        throw new Error('Invalid proxy URL format');
      }

      console.log(`🎯 Final download URL: ${downloadUrl}`);

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        let errorText;
        try {
          const errorJson = await response.json();
          errorText = errorJson.detail?.error || errorJson.error || `Download failed with status ${response.status}`;
        } catch {
          errorText = await response.text();
        }
        console.error('❌ Download failed:', errorText);
        throw new Error(errorText);
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
          width: "100%",
          maxWidth: "28rem",
          borderRadius: "1.25rem",
          background: "linear-gradient(145deg, rgba(17,24,39,0.98), rgba(31,41,55,0.9))",
          color: "white",
          overflow: "hidden",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          transition: "all 0.3s ease",
        }}
      >
        {thumbnail && (
          <div style={{ position: "relative", overflow: "hidden" }}>
            <Card.Img
              variant="top"
              src={getThumbnailSrc()}
              alt={title || "Video Thumbnail"}
              style={{
                height: "220px",
                objectFit: "cover",
                borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
                transition: "transform 0.3s ease",
              }}
              onError={(e) => {
                console.warn("Thumbnail failed to load:", getThumbnailSrc());
                e.target.style.display = "none";
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
            <div
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                padding: "0.5rem 1rem",
                borderRadius: "50px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <PlatformBadge platform={platform} />
            </div>
          </div>
        )}

        <Card.Body className="text-center p-4">
          {/* Platform Badge - Only show if no thumbnail */}
          {!thumbnail && (
            <div className="d-flex justify-content-center mb-3">
              <PlatformBadge platform={platform} />
            </div>
          )}

          <Card.Title
            className="fw-bold mb-2"
            style={{
              fontSize: "1.4rem",
              color: "#f8fafc",
              lineHeight: "1.3",
              wordBreak: "break-word"
            }}
          >
            {title || "Ready to Download"}
          </Card.Title>

          <Card.Text
            className="mb-4"
            style={{
              color: "#cbd5e1",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}
          >
            <i className="bi bi-arrow-down-circle me-2"></i>
            Choose your preferred format
          </Card.Text>

          {/* Error Display */}
          {error && (
            <div
              className="alert d-flex align-items-center mb-3"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "12px",
                padding: "1rem",
                color: "#fca5a5",
                animation: "slideDown 0.3s ease",
              }}
            >
              <AlertCircle size={20} className="me-2" style={{ flexShrink: 0 }} />
              <small style={{ fontWeight: "500" }}>{error}</small>
            </div>
          )}

          <ButtonGroup vertical className="w-100" style={{ gap: "0.75rem" }}>
            {/* Video Download Button */}
            <Button
              onClick={() => handleDownload("video")}
              disabled={loadingVideo || loadingAudio}
              style={{
                background: loadingVideo
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "linear-gradient(135deg, #3b82f6, #6366f1)",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                padding: "1rem 1.25rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!loadingVideo && !loadingAudio) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
              }}
            >
              {loadingVideo ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Downloading...
                </>
              ) : done && !loadingAudio ? (
                <>
                  <CheckCircle size={20} style={{ color: "#10b981" }} />
                  Done!
                </>
              ) : (
                <>
                  <Download size={20} />
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
                borderRadius: "12px",
                fontWeight: "600",
                padding: "1rem 1.25rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(253, 183, 20, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                if (!loadingVideo && !loadingAudio) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.background = "rgba(253, 183, 20, 0.25)";
                  e.target.style.boxShadow = "0 6px 20px rgba(253, 183, 20, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "rgba(253, 183, 20, 0.15)";
                e.target.style.boxShadow = "0 4px 15px rgba(253, 183, 20, 0.2)";
              }}
            >
              {loadingAudio ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : done && !loadingVideo ? (
                <>
                  <CheckCircle size={20} style={{ color: "#10b981" }} />
                  Done!
                </>
              ) : (
                <>
                  <Music size={20} />
                  Audio Only (MP3)
                </>
              )}
            </Button>
          </ButtonGroup>

          <div
            className="text-center mt-4 pt-3"
            style={{
              fontSize: "0.85rem",
              color: "#94a3af",
              borderTop: "1px solid rgba(59, 130, 246, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <i className="bi bi-shield-check" style={{ color: "#10b981" }}></i>
            <span>Best quality • Safe • Fast download</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DownloadOptions;