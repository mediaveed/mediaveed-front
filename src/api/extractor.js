import { BASE_URL } from './config/api';

/**
 * Detect platform from URL
 */
export const detectPlatform = (url) => {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube';
    }
    if (urlLower.includes('tiktok.com') || urlLower.includes('vm.tiktok.com')) {
        return 'tiktok';
    }
    if (urlLower.includes('instagram.com')) {
        return 'instagram';
    }
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return 'twitter';
    }

    return null;
};

/**
 * Extract video metadata from any supported platform
 */
export const extractVideo = async (url) => {
    const platform = detectPlatform(url);

    if (!platform) {
        throw new Error('Unsupported platform. Please use YouTube, TikTok, Instagram, or Twitter URLs.');
    }

    console.log(`🎯 Detected platform: ${platform}`);
    console.log(`📡 Extracting from: ${url}`);

    try {
        let response;

        if (platform === 'youtube') {
            // YouTube uses POST with JSON body
            response = await fetch(`${BASE_URL}/api/v1/youtube/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
        } else if (platform === 'tiktok') {
            // TikTok uses POST with JSON body
            response = await fetch(`${BASE_URL}/api/v1/tiktok/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
        } else {
            // Other platforms (if you add them later)
            response = await fetch(`${BASE_URL}/api/v1/${platform}/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Extraction failed:', errorData);
            throw new Error(errorData.error?.message || errorData.detail || 'Failed to extract video');
        }

        const data = await response.json();
        console.log('✅ Extraction successful:', data);

        // Handle different response structures
        let videoData;

        if (data.success && data.data) {
            // TikTok response structure: { success: true, data: {...} }
            videoData = data.data;
        } else if (data.platform) {
            // YouTube response structure: { platform: "youtube", ... }
            videoData = data;
        } else {
            throw new Error('Invalid response structure from server');
        }

        // Normalize the response to ensure all required fields exist
        // Only accept proxy_url from backend
        const normalizedData = {
            platform: videoData.platform || platform,
            title: videoData.title || 'Untitled Video',
            author: videoData.author || videoData.uploader || 'Unknown',
            thumbnail: videoData.thumbnail || null,
            duration: videoData.duration || null,
            views: videoData.views || null,
            likes: videoData.likes || null,
            description: videoData.description || null,

            proxy_url: videoData.proxy_url,

            video_url: videoData.video_url || null,
        };


        // Validation: Ensure we have a downloadable URL
        if (!normalizedData.proxy_url) {
            throw new Error('Server did not return a valid download URL.');
        }


        console.log('📦 Normalized data:', normalizedData);
        return normalizedData;

    } catch (error) {
        console.error('❌ Extraction error:', error);

        // Re-throw with more context
        if (error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        }

        throw error;
    }
};

/**
 * Download video or audio
 */
export const downloadMedia = async (proxyUrl, title, platform, kind = 'video') => {
    if (!proxyUrl) {
        throw new Error('No download URL provided');
    }

    // Build the full download URL
    let downloadUrl;
    if (proxyUrl.startsWith('/api')) {
        downloadUrl = `${BASE_URL}${proxyUrl}`;
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

    const finalUrl = encodeURI(downloadUrl).replace(/#/g, '%23');
    console.log(`🎯 Starting native download: ${finalUrl}`);

    // Use native navigation to avoid XHR/fetch CORS aborts on large binary streams
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = `${title || 'video'}.${kind === 'audio' ? 'mp3' : 'mp4'}`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
