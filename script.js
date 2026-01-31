// ====== ELEMENTS ======
const audio = document.getElementById("audio");
const songTitle = document.getElementById("song-title");
const playlist = document.getElementById("playlist");
const homeView = document.getElementById("homeView");
const playerView = document.getElementById("playerView");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const loopBtn = document.getElementById("loop");
const shuffleBtn = document.getElementById("shuffle");
const backBtn = document.getElementById("back");
const downloadBtn = document.getElementById("download");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const welcomeModal = document.getElementById("welcomeModal");
const closeWelcome = document.getElementById("closeWelcome");

// Ensure DOM is ready
document.addEventListener("DOMContentLoaded", () => {

    // Close when button is clicked
    closeWelcome.onclick = () => {
        welcomeModal.classList.add("hidden-modal");
    };

    // Auto-hide after 5 seconds
    setTimeout(() => {
        welcomeModal.classList.add("hidden-modal");
    }, 5000);

});

// ====== AUDIO CONTEXT (EQ + VISUALIZER) ======
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);

// Bass
const bassFilter = audioCtx.createBiquadFilter();
bassFilter.type = "lowshelf";
bassFilter.frequency.value = 200;

// Mids
const midFilter = audioCtx.createBiquadFilter();
midFilter.type = "peaking";
midFilter.frequency.value = 1000;
midFilter.Q.value = 1;

// Treble
const trebleFilter = audioCtx.createBiquadFilter();
trebleFilter.type = "highshelf";
trebleFilter.frequency.value = 3000;

// Analyzer
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;

// Connect audio chain
source.connect(bassFilter).connect(midFilter).connect(trebleFilter).connect(analyser).connect(audioCtx.destination);

// ====== EQ CONTROLS ======
document.getElementById("bass").oninput = e => bassFilter.gain.value = e.target.value;
document.getElementById("mid").oninput = e => midFilter.gain.value = e.target.value;
document.getElementById("treble").oninput = e => trebleFilter.gain.value = e.target.value;

// ====== VISUALIZER ======
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.8;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = data[i] * 0.7;
        ctx.fillStyle = `rgb(${barHeight + 50}, 100, 200)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}
drawVisualizer();

// ====== SONG DATA ======
const songs = [
    { title: "Popcaan - Where We Come From", src: "music/popcaan-where-we-come-from.mp3", category: "dancehall" },
    { title: "Vybz Kartel - God Is The Greatest", src: "music/vybz-kartel-god-is-the-greatest.mp3", category: "dancehall" },
    { title: "Flappy ft Demon X Baby - Enkimaana", src: "music/flappy-demonx-enkimaana.mp3", category: "hiphop" },
    { title: "Ayra Starr & Rema - Who’s Dat Girl", src: "music/ayra-starr-rema-whos-dat-girl.mp3", category: "afrobeat" },
    { title: "CIZA - Isaka II (6am)", src: "music/ciza-isaka-ii.mp3", category: "afrobeat" },
    { title: "Spice - So Mi Like It", src: "music/spice - so-mi-like-it.mp3", category: "dancehall" },
    { title: "Alex Warren - Ordinary", src: "music/Alex Warren - Ordinary (Official Video)(MP3_160K).mp3", category: "pop" },
    { title: "Ruger Bnxn - Bae Bae", src: "music/Ruger_ Bnxn - Bae Bae (Live Session) _ Vevo ctrl(MP3_160K).mp3", category: "afrobeat" },
    { title: "Davido - With You ft. Omah Lay", src: "music/davido-with-you-ft-omah-lay.mp3", category: "afrobeat" },
    { title: "Miles Away - Bring Me Back", src: "music/Miles Away - Bring Me Back (Lyrics) ft. Claire Ridgely(MP3_160K).mp3", category: "pop" },
    { title: "Kido Wange - Wiz Kadayo", src: "music/kido-wange-wiz-kadayo-1981-BC-SLP.mp3", category: "dancehall" }
];

// ====== STATE ======
let currentSong = 0;
let isLoop = false;
let isShuffle = false;

// ====== PLAYLIST ======
function loadPlaylist(list) {
    playlist.innerHTML = "";
    list.forEach(song => {
        const li = document.createElement("li");
        li.textContent = song.title;
        li.onclick = () => playSong(songs.indexOf(song));
        playlist.appendChild(li);
    });
}

// ====== PLAY SONG ======
function playSong(index) {
    currentSong = index;
    audio.src = songs[currentSong].src;
    songTitle.textContent = songs[currentSong].title;

    audioCtx.resume();
    audio.play();
    playBtn.className = "bx bx-pause";
    openPlayer();
}

// ====== PLAY / PAUSE ======
playBtn.onclick = () => {
    audioCtx.resume();
    if (audio.paused) {
        audio.play();
        playBtn.className = "bx bx-pause";
    } else {
        audio.pause();
        playBtn.className = "bx bx-play";
    }
};

// ====== NEXT / PREV ======
nextBtn.onclick = () => playNext();
prevBtn.onclick = () => playPrev();

function playNext() {
    if (isShuffle) {
        let rand;
        do { rand = Math.floor(Math.random() * songs.length); } 
        while (rand === currentSong);
        playSong(rand);
    } else {
        currentSong = (currentSong + 1) % songs.length;
        playSong(currentSong);
    }
}

function playPrev() {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    playSong(currentSong);
}

// ====== AUTO NEXT ======
audio.addEventListener("ended", () => {
    if (!isLoop) playNext();
});

// ====== LOOP / SHUFFLE ======
loopBtn.onclick = () => {
    isLoop = !isLoop;
    audio.loop = isLoop;
    loopBtn.classList.toggle("active", isLoop);
};
shuffleBtn.onclick = () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
};

// ====== BACK BUTTON ======
backBtn.onclick = () => goHome();

// ====== PLAYER VIEW SLIDE-UP ======
function openPlayer() {
    playerView.classList.add("active");
}
function goHome() {
    playerView.classList.remove("active");
    playBtn.className = audio.paused ? "bx bx-play" : "bx bx-pause";
}

// ====== PROGRESS BAR ======
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.value = percent;

    const curMin = Math.floor(audio.currentTime / 60);
    const curSec = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
    currentTimeEl.textContent = `${curMin}:${curSec}`;

    const durMin = Math.floor(audio.duration / 60);
    const durSec = Math.floor(audio.duration % 60).toString().padStart(2, "0");
    durationEl.textContent = `${durMin}:${durSec}`;
});

progress.addEventListener("input", () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

// ====== DOWNLOAD BUTTON ======
downloadBtn.onclick = () => {
    const currentSongObj = songs[currentSong];
    const link = document.createElement("a");
    link.href = currentSongObj.src;
    link.download = currentSongObj.title + ".mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ====== FILTER ======
function filterSongs(category) {
    const filtered = category === "all" ? songs : songs.filter(s => s.category === category);
    loadPlaylist(filtered);
}

// ====== SEARCH ======
function searchSongs() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll("#playlist li").forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(input) ? "block" : "none";
    });
}
function clearSearch() {
    document.getElementById("searchInput").value = "";
    searchSongs();
}
function startVoiceSearch() {
    if (!("webkitSpeechRecognition" in window)) { alert("Voice search not supported"); return; }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = e => {
        document.getElementById("searchInput").value = e.results[0][0].transcript;
        searchSongs();
    };
}

// ====== WELCOME MODAL ======
// Close modal by adding hidden class
closeWelcome.onclick = () => {
    welcomeModal.classList.add("hidden-modal");
};

// Optional: auto-hide after 5 seconds
setTimeout(() => {
    welcomeModal.classList.add("hidden-modal");
}, 5000);

// ====== INIT ======
loadPlaylist(songs);

const myMusicBtn = document.getElementById("myMusicBtn");
const fileInput = document.getElementById("fileInput");

let mySongs = []; // Store user-added songs

myMusicBtn.onclick = () => {
    fileInput.click();
};

fileInput.addEventListener("change", e => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
        const url = URL.createObjectURL(file);
        const songObj = {
            title: file.name,
            src: url,
            category: "myMusic"
        };
        mySongs.push(songObj);

        // Add to playlist UI
        const li = document.createElement("li");
        li.textContent = file.name;

        li.onclick = () => {
            playSong(mySongs.indexOf(songObj), mySongs); // pass mySongs list
        };

        playlist.appendChild(li);
    });
});

// Modify playSong to accept optional list
function playSong(index, list = songs) {
    currentSong = index;
    const songList = list;
    audio.src = songList[currentSong].src;
    songTitle.textContent = songList[currentSong].title;

    audioCtx.resume();
    audio.play();
    playBtn.className = "bx bx-pause";
    openPlayer();
}

// ====== REGISTER SERVICE WORKER ======
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.log("SW failed", err));
  });
}