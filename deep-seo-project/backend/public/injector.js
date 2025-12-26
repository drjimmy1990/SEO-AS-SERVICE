// backend/public/injector.js
(() => {
    const API_URL = '{{API_URL}}/api/settings/live';

    // CRITICAL FIX: Clean the URL to match how it's stored in the database.
    // 1. Get the full href.
    // 2. Remove any #hash part.
    // 3. Remove any trailing slash (if it exists).
    //   revise seoability......cases..
    const currentUrl = window.location.href.split('#')[0].replace(/\/$/, '');

    console.log(`[DeepSEO Injector] Fetching settings for cleaned URL: ${currentUrl}`);

    fetch(`${API_URL}?url=${encodeURIComponent(currentUrl)}`, {
        headers: {
            'Bypass-Tunnel-Reminder': 'true'
        }
    })
        .then(response => {
            if (!response.ok || response.status === 404) {
                console.log('[DeepSEO Injector] No live settings found for this URL.');
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;

            // Update Title
            if (data.title) {
                document.title = data.title;
            }

            // Update Meta Description
            if (data.description) {
                let meta = document.querySelector('meta[name="description"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', 'description');
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', data.description);
            }

            // Update Image Alt Texts
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach(imgData => {
                    try {
                        const imgElement = document.querySelector(imgData.selector);
                        if (imgElement) {
                            imgElement.setAttribute('alt', imgData.alt);
                        } else {
                            console.warn(`[DeepSEO Injector] Could not find element with selector: ${imgData.selector}`);
                        }
                    } catch (e) {
                        console.warn(`[DeepSEO Injector] Invalid selector: ${imgData.selector}`);
                    }
                });
            }

            console.log('[DeepSEO Injector] SEO settings applied successfully.');
        })
        .catch(error => {
            console.error('[DeepSEO Injector] Failed to load settings:', error);
        });
})();
