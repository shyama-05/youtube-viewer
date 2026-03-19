const API_KEY = "AIzaSyDgs43aX3bXWTolsmoly4gtoT_Op7J07GA";

let nextPageToken = "";
let playlistIdGlobal = "";

/* =========================
   LOAD PLAYLIST / VIDEO
========================= */
function loadPlaylist() {
    const url = document.getElementById("playlistUrl").value;

    const videoId = extractVideoId(url);
    const playlistId = extractPlaylistId(url);

    const container = document.getElementById("videos");
    container.innerHTML = "";

    // 🎬 Play video if exists
    if (videoId) {
        playVideo(videoId);
    }

    // 📂 Load playlist if exists
    if (playlistId) {
        playlistIdGlobal = playlistId;
        nextPageToken = "";
        loadMoreVideos(true);
    }

    // ❌ Invalid
    if (!videoId && !playlistId) {
        alert("Invalid YouTube link 💖");
    }
}

/* =========================
   EXTRACT VIDEO ID
========================= */
function extractVideoId(url) {
    try {
        let match = url.match(/[?&]v=([^&]+)/);
        if (match) return match[1];

        match = url.match(/youtu\.be\/([^?&]+)/);
        if (match) return match[1];

        match = url.match(/shorts\/([^?&]+)/);
        if (match) return match[1];

        return null;
    } catch {
        return null;
    }
}

/* =========================
   EXTRACT PLAYLIST ID
========================= */
function extractPlaylistId(url) {
    try {
        let match = url.match(/[?&]list=([^&]+)/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

/* =========================
   LOAD MORE VIDEOS
========================= */
async function loadMoreVideos(isFirst = false) {

    const container = document.getElementById("videos");

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistIdGlobal}&pageToken=${nextPageToken}&key=${API_KEY}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.items) {
            alert("API Error ❌ Check API key or quota");
            console.error(data);
            return;
        }

        // ▶️ Play first video automatically
        if (isFirst && data.items.length > 0) {
            const firstVideo = data.items[0].snippet.resourceId.videoId;
            playVideo(firstVideo);
        }

        // 📜 Show videos
        data.items.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;
            const thumb = item.snippet.thumbnails.medium.url;

            const div = document.createElement("div");
            div.className = "video-item";

            div.innerHTML = `
                <img src="${thumb}">
                <p>${title}</p>
            `;

            div.onclick = () => playVideo(videoId);

            container.appendChild(div);
        });

        nextPageToken = data.nextPageToken;

        // ❌ Remove old button
        const oldBtn = document.getElementById("loadMoreBtn");
        if (oldBtn) oldBtn.remove();

        // ➕ Add Load More if more videos exist
        if (nextPageToken) {
            const btn = document.createElement("button");
            btn.id = "loadMoreBtn";
            btn.innerText = "Load More";
            btn.onclick = () => loadMoreVideos();

            container.appendChild(btn);
        }

    } catch (error) {
        alert("Error loading videos ❌");
        console.error(error);
    }
}

/* =========================
   PLAY VIDEO
========================= */
function playVideo(videoId) {
    document.getElementById("mainPlayer").src =
        `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`;
}

/* =========================
   SAVE PLAYLIST
========================= */
function savePlaylist() {
    const url = document.getElementById("playlistUrl").value;

    if (!url) {
        alert("Enter a link first 💖");
        return;
    }

    let saved = JSON.parse(localStorage.getItem("saved")) || [];

    if (!saved.includes(url)) {
        saved.push(url);
        localStorage.setItem("saved", JSON.stringify(saved));
    }

    showSaved();
}

/* =========================
   SHOW SAVED LIST
========================= */
function showSaved() {
    const container = document.getElementById("savedList");
    container.innerHTML = "";

    const saved = JSON.parse(localStorage.getItem("saved")) || [];

    saved.forEach((url, index) => {
        const div = document.createElement("div");
        div.className = "saved-item";

        div.innerHTML = `
            <p>${url}</p>
            <button onclick="loadSaved('${url}')">Load</button>
            <button onclick="deleteSaved(${index})">Delete</button>
        `;

        container.appendChild(div);
    });
}

/* =========================
   LOAD SAVED
========================= */
function loadSaved(url) {
    document.getElementById("playlistUrl").value = url;
    loadPlaylist();
}

/* =========================
   DELETE SAVED
========================= */
function deleteSaved(index) {
    let saved = JSON.parse(localStorage.getItem("saved")) || [];
    saved.splice(index, 1);
    localStorage.setItem("saved", JSON.stringify(saved));
    showSaved();
}

/* =========================
   ON LOAD
========================= */
window.onload = showSaved