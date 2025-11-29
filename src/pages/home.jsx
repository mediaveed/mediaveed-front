import React, { useState } from 'react';
import { BASE_URL } from '../api/config/api';
import { Container, Row, Col } from 'react-bootstrap';
import UrlInput from '../components/input';
import Loader from '../components/loader';
import { extractVideo, detectPlatform } from '../api/extractor';
import './home.css';
import DownloadOptions from '../components/downloadbutton';
import { TopBannerAd, MidBannerAd, MiddleBannerAd, FooterBannerAd, ResponsiveAdWrapper } from '../components/Adbanner';

export default function Home({ onNavigate = () => {} }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    // Detect platform first
    const platform = detectPlatform(url);
    if (!platform) {
      setError("Unsupported platform. Please use YouTube, TikTok, Instagram, or Twitter URLs.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log(`🚀 Extracting video from ${platform}...`);
      const result = await extractVideo(url);

      console.log('📦 Extraction result:', result);

      // Validate the result
      if (!result) {
        throw new Error("No data received from server");
      }

      // Check if we have a downloadable URL
      if (!result.proxy_url && !result.video_url) {
        throw new Error("No downloadable formats available for this video");
      }

      // Set the data
      setData(result);
      console.log('✅ Video data loaded successfully');

    } catch (err) {
      console.error('❌ Extraction error:', err);

      // Handle different error types
      let errorMessage = "Failed to extract video. Please try again.";

      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear error when URL changes
  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    if (error) setError(null);
  };

  return (
    <div className="home-page">
      {/* TOP BANNER AD */}
      <div className="ad-section ad-section-top">
        <Container>
          <ResponsiveAdWrapper type="top">
            <TopBannerAd />
          </ResponsiveAdWrapper>
        </Container>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <div className="hero-section">
              <div className="decorative-icons">
                <div className="icon icon-star"></div>
                <div className="icon icon-youtube"></div>
                <div className="icon icon-music"></div>
                <div className="icon icon-play"></div>
              </div>

              <h1 className="hero-title">
                Media<span className="title-highlight">Veed</span>
              </h1>
              <h3 >All in one video downloader</h3>
              <p className="hero-subtitle">
                Download videos from YouTube, TikTok, Instagram, Twitter and more.
                Fast, free, and easy to use. No registration required.
              </p>
              <div className="mt-3 text-center small" style={{ color: "#cbd5f5" }}>
                <p className="mb-0">
                  Processing usually takes <strong>2–4 minutes</strong> depending on length—please keep this tab open until it finishes.
                </p>
              </div>

              <div className="input-section">
                <UrlInput
                  url={url}
                  setUrl={handleUrlChange}
                  onSubmit={handleSubmit}
                />
        

                {loading && (
                  <div className="mt-4">
                    <Loader />
                    <p className="text-center mt-2" style={{ color: '#9ca3af' }}>
                      Extracting video metadata...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}
              </div>

              {/* MID-PAGE AD - Shows when video data is loaded */}
              {data && !loading && (
                <div className="ad-section ad-section-mid">
                  <ResponsiveAdWrapper type="mid">
                    <MidBannerAd />
                  </ResponsiveAdWrapper>
                </div>
              )}

              {/* Download Options - Only show if we have valid data */}
              {data && data.proxy_url && !loading && !error && (
                <DownloadOptions
                  proxyUrl={data.proxy_url}
                  title={data.title}
                  thumbnail={data.thumbnail}
                  platform={data.platform}
                  backendRoot={BASE_URL}
                  originalUrl={data.original_url || url}
                />
              )}


              <div className="supported-platforms">
                <p className="platforms-label">Supported Platforms:</p>
                <div className="platforms-list">
                  <div className="platform-chip">
                    <i className="bi bi-youtube"></i>
                    YouTube
                  </div>
                  <div className="platform-chip">
                    <i className="bi bi-tiktok"></i>
                    TikTok
                  </div>
                  {/* <div className="platform-chip">
                    <i className="bi bi-instagram"></i>
                    Instagram
                  </div>
                  <div className="platform-chip">
                    <i className="bi bi-twitter"></i>
                    Twitter
                  </div> */}
                </div>
              </div>
            </div>

            <div className="features-section">
              <h2 className="features-title">Why Choose Our Downloader?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>
                  <h3>Lightning Fast</h3>
                  <p>Download videos in seconds with our optimized servers</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h3>100% Safe</h3>
                  <p>No malware, completely secure downloads</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-phone"></i>
                  </div>
                  <h3>All Devices</h3>
                  <p>Works perfectly on desktop, mobile, and tablet devices</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-infinity"></i>
                  </div>
                  <h3>Unlimited</h3>
                  <p>Download as many videos as you want, no limits</p>
                </div>
              </div>

              <div className="highlight-tool-cta">
                <div>
                  <p className="cta-eyebrow">NEW • Highlight Generator</p>
                  <h3>Send downloads straight into our AI highlight engine</h3>
                  <p>
                    Automatically detect high-energy moments, curate reels, and export MP4/SRT timelines from one workspace.
                  </p>
                </div>
                <button
                  type="button"
                  className="cta-button"
                  onClick={() => onNavigate('highlight-tool')}
                >
                  Launch Highlight Tool
                </button>
              </div>
            </div>

            <div className="warning-banner">
              <i className="bi bi-shield-exclamation"></i>
              <p>WE DO NOT ALLOW/SUPPORT THE DOWNLOAD OF COPYRIGHTED MATERIAL!</p>
            </div>

            {/* FOOTER AD */}
            <div className="ad-section ad-section-footer">
              <ResponsiveAdWrapper type="footer">
                <FooterBannerAd />
              </ResponsiveAdWrapper>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
