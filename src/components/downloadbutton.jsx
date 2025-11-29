import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Card, Modal } from "react-bootstrap";
import { Loader2, CheckCircle, AlertCircle, Download, Music } from "lucide-react";
import PlatformBadge from "./platformbadge";
import "./components.css";

const DownloadOptions = ({ proxyUrl, title, platform, backendRoot, thumbnail, originalUrl }) => {
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [progressVideo, setProgressVideo] = useState(0);
  const [progressAudio, setProgressAudio] = useState(0);
  const [toolPanelVisible, setToolPanelVisible] = useState(false);
  const [lastDownloadInfo, setLastDownloadInfo] = useState(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const progressTimers = useRef({ video: null, audio: null });

  useEffect(() => {
    return () => {
      Object.values(progressTimers.current).forEach((timer) => {
        if (timer) clearInterval(timer);
      });
    };
  }, []);

  const startProgress = (type) => {
    const setter = type === "video" ? setProgressVideo : setProgressAudio;
    const key = type === "video" ? "video" : "audio";
    setter(5);
    if (progressTimers.current[key]) {
      clearInterval(progressTimers.current[key]);
    }
    progressTimers.current[key] = setInterval(() => {
      setter((prev) => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 400);
  };

  const stopProgress = (type, success = false) => {
    const setter = type === "video" ? setProgressVideo : setProgressAudio;
    const key = type === "video" ? "video" : "audio";
    if (progressTimers.current[key]) {
      clearInterval(progressTimers.current[key]);
      progressTimers.current[key] = null;
    }
    setter(success ? 100 : 0);
    if (success) {
      setTimeout(() => setter(0), 600);
    }
  };

  const handleDownload = async (kind = "video") => {
    let success = false;
    try {
      if (kind === "video") setLoadingVideo(true);
      if (kind === "audio") setLoadingAudio(true);
      setDone(false);
      setError(null);
      startProgress(kind);

      console.log(`🎯 Starting ${kind} download...`);
      console.log(`Platform: ${platform}`);
      console.log(`Proxy URL: ${proxyUrl}`);
      console.log(`Original URL: ${originalUrl}`);
      console.log(`Title: ${title}`);
      console.log(`Backend Root: ${backendRoot}`);

      if (proxyUrl.includes('video_url=')) {
        const urlMatch = proxyUrl.match(/video_url=([^&]+)/);
        if (urlMatch) {
          const encodedUrl = urlMatch[1];
          const decodedUrl = decodeURIComponent(encodedUrl);
          console.log(`🔍 URL in proxy_url (decoded): ${decodedUrl}`);
        }
      }

      let downloadUrl;

      if (proxyUrl.startsWith('/api')) {
        downloadUrl = `${backendRoot}${proxyUrl}`;

        if (kind === 'audio') {
          if (downloadUrl.includes('kind=video')) {
            downloadUrl = downloadUrl.replace('kind=video', 'kind=audio');
          } else if (!downloadUrl.includes('kind=')) {
            const separator = downloadUrl.includes('?') ? '&' : '?';
            downloadUrl += `${separator}kind=audio`;
          }
        }
      } else if (proxyUrl.startsWith('http')) {
        downloadUrl = proxyUrl;
        // Add kind parameter for audio
        if (kind === 'audio' && !downloadUrl.includes('kind=')) {
          const separator = downloadUrl.includes('?') ? '&' : '?';
          downloadUrl += `${separator}kind=audio`;
        }
      } else {
        throw new Error('Invalid proxy URL format');
      }

      const fetchUrl = encodeURI(downloadUrl).replace(/#/g, '%23');
      console.log(`🎯 Final download URL: ${fetchUrl}`);

      const response = await fetch(fetchUrl);

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response headers:`, response.headers);

      if (!response.ok) {
        let errorDetails;
        const contentType = response.headers.get('content-type');

        try {
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            console.error('❌ Server error response:', errorJson);

            const detail = errorJson.detail;
            if (detail) {
              if (typeof detail === 'string') {
                errorDetails = detail;
              } else if (detail.error) {
                errorDetails = detail.error;
                if (detail.tip) {
                  errorDetails += ` (Tip: ${detail.tip})`;
                } else if (detail.message) {
                  errorDetails += ` - ${detail.message}`;
                }
              } else if (detail.message) {
                errorDetails = detail.message;
              } else {
                errorDetails = JSON.stringify(detail);
              }
            } else if (errorJson.error) {
              errorDetails = errorJson.error;
            } else {
              errorDetails = JSON.stringify(errorJson);
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Server error text:', errorText);
            errorDetails = errorText.substring(0, 150); // Limit length
          }
        } catch (parseError) {
          console.error('❌ Could not parse error:', parseError);
          errorDetails = `Server error (${response.status}). Please try again.`;
        }

        throw new Error(errorDetails || `Download failed. Please try again.`);
      }

      console.log('✅ Response OK, creating blob...');
      const blob = await response.blob();
      console.log(`📦 Blob size: ${blob.size} bytes, type: ${blob.type}`);
      const blobUrl = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title || 'video'}.${kind === 'audio' ? 'mp3' : 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

      setDone(true);
      console.log(`✅ ${kind} download completed`);
      success = true;
      const info = {
        title,
        platform,
        originalUrl,
        downloadUrl: fetchUrl,
        kind,
        completedAt: Date.now(),
      };
      localStorage.setItem('mediaveed_last_download', JSON.stringify(info));
      window.dispatchEvent(new CustomEvent('mediaveed:downloadComplete', { detail: info }));
      setLastDownloadInfo(info);
      setToolPanelVisible(true);
      setShowToolModal(true);

    } catch (err) {
      console.error(`❌ ${kind} download failed:`, err);

      let userMessage = err.message || `Failed to download ${kind}`;

      // Clean up technical jargon for users
      if (userMessage.includes('Failed to fetch')) {
        userMessage = 'Connection error. Please check your internet and try again.';
      } else if (userMessage.includes('NetworkError')) {
        userMessage = 'Network error. Please try again.';
      } else if (userMessage.includes('timeout')) {
        userMessage = 'Download timed out. The video might be too large. Try again.';
      } else if (userMessage.includes('CORS')) {
        userMessage = 'Security error. Please try again or use a different browser.';
      }

      // Limit message length
      if (userMessage.length > 150) {
        userMessage = userMessage.substring(0, 147) + '...';
      }

      setError(userMessage);
    } finally {
      setLoadingVideo(false);
      setLoadingAudio(false);
      stopProgress(kind, success);
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

  const handleOpenHighlightTool = () => {
    if (lastDownloadInfo) {
      localStorage.setItem('mediaveed_last_download', JSON.stringify(lastDownloadInfo));
    }
    window.dispatchEvent(new CustomEvent('mediaveed:navigate', { detail: 'highlight-tool' }));
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
            {loadingVideo && (
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: `${progressVideo}%`,
                    height: "100%",
                    background: "linear-gradient(90deg,#60a5fa,#a855f7)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}

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
            {loadingAudio && (
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "rgba(253, 183, 20, 0.15)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginTop: "0.4rem",
                }}
              >
                <div
                  style={{
                    width: `${progressAudio}%`,
                    height: "100%",
                    background: "linear-gradient(90deg,#fbbf24,#f97316)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
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

          <Modal
            show={showToolModal}
            centered
            backdrop="static"
            keyboard={false}
            dialogClassName="mediaveed-modal"
            onHide={() => setShowToolModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Continue in MediaVeed</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-2">
                {lastDownloadInfo?.title || title || 'Your video'} is ready for highlight detection.
              </p>
              <p className="text-muted mb-0">
                Jump into the Highlight Generator to analyze and stitch this clip automatically.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setShowToolModal(false)}>
                Stay here
              </Button>
              <Button variant="primary" onClick={() => {
                setShowToolModal(false);
                handleOpenHighlightTool();
              }}>
                Open Highlight Tool
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DownloadOptions;
