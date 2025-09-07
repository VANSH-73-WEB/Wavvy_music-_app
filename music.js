async function searchMusic() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayResults(data.results);
  } catch (err) {
    console.error("Error fetching music:", err);
  }
}

function displayResults(tracks) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (tracks.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  tracks.forEach(track => {
    const trackEl = document.createElement("div");
    trackEl.className = "track";


   trackEl.innerHTML = `
      <img src="${track.artworkUrl100}" alt="${track.trackName}">
      <h3>${track.trackName}</h3>
      <p>${track.artistName}</p>
      <div class="custom-audio">
        <button class="play-btn">${getPlaySVG()}</button>
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        <span class="time-display">0:00 / 0:30</span>
        <a class="download-btn" href="${track.previewUrl}" download title="Download">
          ${getDownloadSVG()}
        </a>
        <button class="library-btn" title="Add to Library">❤️</button>
      </div>
      <audio class="hidden-audio" src="${track.previewUrl}"></audio>
    `;
 const libraryBtn = trackEl.querySelector(".library-btn");
  libraryBtn.addEventListener("click", () => {
    const songData = {
      trackId: track.trackId,
      trackName: track.trackName,
      artistName: track.artistName,
      previewUrl: track.previewUrl,
      artworkUrl100: track.artworkUrl100
    };
    addToLibrary(songData);
  });
    const audio = trackEl.querySelector("audio");
    const playBtn = trackEl.querySelector(".play-btn");
    const progressContainer = trackEl.querySelector(".progress-container");
    const progressBar = trackEl.querySelector(".progress-bar");
    const timeDisplay = trackEl.querySelector(".time-display");

    playBtn.addEventListener("click", () => {
      document.querySelectorAll("audio").forEach(a => {
        if (a !== audio) a.pause();
      });

      document.querySelectorAll(".play-btn").forEach(btn => {
        btn.innerHTML = getPlaySVG();
      });
      document.querySelectorAll(".track").forEach(el => el.classList.remove("playing"));

      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = getPauseSVG();
        trackEl.classList.add("playing");
      } else {
        audio.pause();
        playBtn.innerHTML = getPlaySVG();
        trackEl.classList.remove("playing");
      }
    });

    audio.addEventListener("timeupdate", () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${percent}%`;

      const current = formatTime(audio.currentTime);
      const total = formatTime(audio.duration || 30);
      timeDisplay.textContent = `${current} / ${total}`;
    });

    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.offsetWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;
      audio.currentTime = (clickX / width) * duration;
    });

    audio.addEventListener("ended", () => {
      playBtn.innerHTML = getPlaySVG();
      progressBar.style.width = "0%";
      trackEl.classList.remove("playing");
    });

    resultsDiv.appendChild(trackEl);
  });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// SVG helper functions
function getDownloadSVG() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="grey" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2v10m0 0l-4-4m4 4l4-4M4 18h12" stroke="grey" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function getPauseSVG() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="grey" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="4" height="16"/>
      <rect x="12" y="2" width="4" height="16"/>
    </svg>
  `;
}

function getPlaySVG() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="grey" xmlns="http://www.w3.org/2000/svg">
      <polygon points="5,3 15,10 5,17" />
    </svg>
  `;
}

// Fix click handler for login icon
document.querySelectorAll(".fa-regular.fa-user.fa-fade").forEach(icon => {
  icon.addEventListener("click", function () {
    window.location.href = "login.html";
  });
});
// store song in local storage
let library = JSON.parse(localStorage.getItem("library")) || [];

function addToLibrary(song) {
  if (!library.find(item => item.trackId === song.trackId)) {
    library.push(song);
    localStorage.setItem("library", JSON.stringify(library));
    alert(`${song.trackName} added to Library!`);
  } else {
    alert("Already in Library!");
  }
}
function loadLibrary() {
  const libraryDiv = document.getElementById("library-list");
  const library = JSON.parse(localStorage.getItem("library")) || [];

  if (library.length === 0) {
    libraryDiv.innerHTML = "<p>No songs in library yet.</p>";
    return;
  }

  libraryDiv.innerHTML = library.map(song => `
    <div class="track">
      <img src="${song.artworkUrl100}" alt="${song.trackName}">
      <h3>${song.trackName}</h3>
      <p>${song.artistName}</p>
      <audio controls src="${song.previewUrl}"></audio>
    </div>
  `).join("");
}
