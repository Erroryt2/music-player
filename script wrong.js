
/* =========================
   SONG LIST
========================= */

const songs = [ 

    

    {
        title: "Shape of You",
        artist: "Ed Sheeran",
        cover: "",
        audio: "assets/shape_of_you.m4a"
    },

    {
        title: "Keno Je Toke",
        artist: "Raj Barman",
        cover: "",
        audio: "assets/keno_je_toke.m4a"
    },

    {
        title: "Param Sundari",
        artist: "Shreya Ghoshal",
        cover: "",
        audio: "assets/param_sundari.m4a"
    }

];

/* =========================
   LOAD USER ADDED SONGS
========================= */

const userSongs =
    JSON.parse(
        localStorage.getItem("userSongs") || "[]"
    );

if (userSongs.length > 0) {

    userSongs.forEach(song => {

        songs.push({
            title: song.title,
            artist: song.artist,
            cover: song.cover || "",
            audio: song.audio
        });

    });

}

/* =========================
   PLAYER VARIABLES
========================= */

let currentSong = 0;

let isShuffle = false;

let isRepeat = false;

let favorites = JSON.parse(
    localStorage.getItem("favoriteSongs") || "[]"
);

let savedPosition = 0;

const audio = new Audio();

audio.preload = "metadata";


/* =========================
   HTML ELEMENTS
========================= */

const cover =
    document.getElementById("cover");

const songTitle =
    document.getElementById("songTitle");

const artist =
    document.getElementById("artist");

const playBtn =
    document.getElementById("playBtn");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const playlist =
    document.getElementById("playlist");

const songNumber =
    document.getElementById("songNumber");

const progress =
    document.getElementById("progress");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const volume =
    document.getElementById("volume");

const volumeIcon =
    document.getElementById("volumeIcon");

const shuffleBtn =
    document.getElementById("shuffleBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const searchInput =
    document.getElementById("searchInput");

/* =========================
   LOAD SONG
========================= */

function loadSong(autoplay = false) {

    if (songs.length === 0) {

        songTitle.textContent =
            "No Song Added";

        artist.textContent =
            "Add songs to your playlist";

        cover.src =
            "https://placehold.co/600x600/111111/ffffff?text=Music";

        songNumber.textContent =
            "0 / 0";

        playlist.innerHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:#777;
            ">
                No songs in playlist
            </div>
        `;

        return;
    }


    const song =
        songs[currentSong];


    /* Song information */

    songTitle.textContent =
        song.title;

    artist.textContent =
        song.artist;


    /* Cover */

    if (song.cover) {

        cover.src =
            song.cover;

    } else {

        cover.src =
            "https://placehold.co/600x600/111111/ffffff?text=Music";

    }


    cover.alt =
        song.title;


    /* Counter */

    songNumber.textContent =
        `${currentSong + 1} / ${songs.length}`;


    /* Stop previous song */

    audio.pause();


    audio.src =
        song.audio || "";


    audio.load();


    /* Reset */

    progress.value = 0;

    currentTime.textContent =
        "0:00";

    duration.textContent =
        "0:00";

    playBtn.textContent =
        "▶";


    /* Remove animation */

    const coverContainer =
        document.querySelector(
            ".cover-container"
        );

    if (coverContainer) {

        coverContainer.classList.remove(
            "playing"
        );

    }

    renderPlaylist();


    /* Autoplay when next/previous is used */

    if (autoplay && song.audio) {

        audio.play().catch(() => {});

    }

}


/* =========================
   PLAY / PAUSE
========================= */

playBtn.addEventListener(
    "click",
    () => {

        if (!songs.length) return;


        if (!songs[currentSong].audio) {

            alert(
                "Audio file পাওয়া যায়নি।"
            );

            return;

        }


        if (audio.paused) {

            audio.play().catch(() => {

                alert(
                    "Audio চালানো যাচ্ছে না।"
                );

            });

        } else {

            audio.pause();

        }

    }
);


/* =========================
   AUDIO PLAY
========================= */

audio.addEventListener(
    "play",
    () => {

        playBtn.textContent =
            "❚❚";


        const coverContainer =
            document.querySelector(
                ".cover-container"
            );


        if (coverContainer) {

            coverContainer.classList.add(
                "playing"
            );

        }

    }
);


/* =========================
   AUDIO PAUSE
========================= */

audio.addEventListener(
    "pause",
    () => {

        playBtn.textContent =
            "▶";


        const coverContainer =
            document.querySelector(
                ".cover-container"
            );


        if (coverContainer) {

            coverContainer.classList.remove(
                "playing"
            );

        }

    }
);


/* =========================
   SONG ENDED
========================= */

audio.addEventListener(
    "ended",
    () => {

        if (isRepeat) {

            audio.currentTime = 0;

            audio.play();

            return;

        }


        nextSong(true);

    }
);


/* =========================
   NEXT SONG
========================= */

nextBtn.addEventListener(
    "click",
    () => {

        nextSong(true);

    }
);


function nextSong(autoplay = false) {

    if (!songs.length) return;


    if (isShuffle && songs.length > 1) {

        let nextIndex;

        do {

            nextIndex =
                Math.floor(
                    Math.random() *
                    songs.length
                );

        } while (
            nextIndex === currentSong
        );


        currentSong =
            nextIndex;

    } else {

        currentSong++;


        if (
            currentSong >=
            songs.length
        ) {

            currentSong = 0;

        }

    }


    savePlayerState();

    loadSong(autoplay);

}


/* =========================
   PREVIOUS SONG
========================= */

prevBtn.addEventListener(
    "click",
    () => {

        if (!songs.length) return;


        /*
        গান 3 সেকেন্ডের বেশি চললে
        Previous চাপলে বর্তমান গান
        আবার শুরু হবে।
        */

        if (audio.currentTime > 3) {

            audio.currentTime = 0;

            return;

        }


        currentSong--;


        if (currentSong < 0) {

            currentSong =
                songs.length - 1;

        }


        savePlayerState();

        loadSong(true);

    }
);


/* =========================
   PROGRESS
========================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) return;

        const percent =
            (audio.currentTime /
            audio.duration) * 100;

        progress.value = percent;

        currentTime.textContent =
            formatTime(audio.currentTime);


        // প্রতিটি গানের position আলাদা করে save হবে
        localStorage.setItem(
            `musicPosition_${currentSong}`,
            audio.currentTime
        );

        localStorage.setItem(
            "currentSong",
            currentSong
        );

    }
);


/* =========================
   DURATION
========================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(audio.duration);


        // যে গানটি চলছে, শুধু সেই গানের position load হবে
        const savedPosition =
            Number(
                localStorage.getItem(
                    `musicPosition_${currentSong}`
                )
            );


        if (
            savedPosition > 0 &&
            savedPosition < audio.duration
        ) {

            audio.currentTime =
                savedPosition;

        }

    }
);


/* =========================
   SEEK
========================= */

progress.addEventListener(
    "input",
    () => {

        if (!audio.duration) return;


        audio.currentTime =
            (
                Number(progress.value) /
                100
            ) * audio.duration;

    }
);


/* =========================
   VOLUME
========================= */

volume.value = 80;

audio.volume = 0.8;


volume.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(volume.value) /
            100;


        localStorage.setItem(
            "musicVolume",
            volume.value
        );


        updateVolumeIcon();

    }
);

/* =========================
   MUTE / UNMUTE
========================= */

let lastVolume = audio.volume;


volumeIcon.addEventListener(
    "click",
    () => {

        if (audio.volume > 0) {

            lastVolume =
                audio.volume;

            audio.volume = 0;

            volume.value = 0;

        } else {

            audio.volume =
                lastVolume || 0.8;

            volume.value =
                audio.volume * 100;

        }


        updateVolumeIcon();


        localStorage.setItem(
            "musicVolume",
            volume.value
        );

    }
);


/* =========================
   LOAD SAVED VOLUME
========================= */

const savedVolume =
    localStorage.getItem(
        "musicVolume"
    );


if (savedVolume !== null) {

    volume.value =
        savedVolume;

    audio.volume =
        Number(savedVolume) /
        100;

}


/* =========================
   VOLUME ICON
========================= */

function updateVolumeIcon() {

    const value =
        Number(volume.value);


    if (value === 0) {

        volumeIcon.textContent =
            "🔇";

    }

    else if (value < 50) {

        volumeIcon.textContent =
            "🔉";

    }

    else {

        volumeIcon.textContent =
            "🔊";

    }

}


/* =========================
   SHUFFLE
========================= */

if (shuffleBtn) {

    shuffleBtn.addEventListener(
        "click",
        () => {

            isShuffle =
                !isShuffle;


            shuffleBtn.classList.toggle(
                "active",
                isShuffle
            );


            localStorage.setItem(
                "shuffle",
                isShuffle
            );

        }
    );

}


/* =========================
   REPEAT
========================= */

if (repeatBtn) {

    repeatBtn.addEventListener(
        "click",
        () => {

            isRepeat =
                !isRepeat;


            repeatBtn.classList.toggle(
                "active",
                isRepeat
            );


            localStorage.setItem(
                "repeat",
                isRepeat
            );

        }
    );

}


/* =========================
   LOAD SHUFFLE / REPEAT
========================= */

isShuffle =
    localStorage.getItem(
        "shuffle"
    ) === "true";


isRepeat =
    localStorage.getItem(
        "repeat"
    ) === "true";


if (shuffleBtn) {

    shuffleBtn.classList.toggle(
        "active",
        isShuffle
    );

}


if (repeatBtn) {

    repeatBtn.classList.toggle(
        "active",
        isRepeat
    );

}


/* =========================
   PLAYLIST
========================= */

function renderPlaylist(searchText = "") {

    if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            renderPlaylist(
                searchInput.value
            );

        }
    );

}

    playlist.innerHTML = "";

    const search =
        searchText.trim().toLowerCase();

    const filteredSongs =
        songs
            .map((song, index) => ({
                song,
                index
            }))
            .filter(({ song }) => {

                return (
                    song.title.toLowerCase().includes(search) ||
                    song.artist.toLowerCase().includes(search)
                );

            });


    if (filteredSongs.length === 0) {

        playlist.innerHTML = `
            <div style="
                padding: 20px;
                text-align: center;
                color: #777;
            ">
                No songs found
            </div>
        `;

        return;
    }


    filteredSongs.forEach(
        ({ song, index }) => {

            const item =
                document.createElement("div");


            item.className =
                "playlist-item";


            if (index === currentSong) {

                item.classList.add("active");

            }

            const isFavorite =
             favorites.includes(index);

            item.innerHTML = `

                <img
                    class="playlist-thumb"
                    src="https://placehold.co/100x100/222222/ffffff?text=Music"
                    alt=""
                >

                <div class="playlist-text">

                    <strong>
                        ${song.title}
                    </strong>

                    <small>
                        ${song.artist}
                    </small>

                </div>

                <button
    class="favorite-btn ${isFavorite ? "favorite" : ""}"
    title="Favorite"
>
    ${isFavorite ? "♥" : "♡"}
</button>

            `;


            item.addEventListener(
                "click",
                () => {

                    currentSong = index;

                    savePlayerState();

                    loadSong(true);

                }
            );

            const favoriteBtn =
    item.querySelector(".favorite-btn");

favoriteBtn.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        toggleFavorite(index);

    }
);

            playlist.appendChild(item);

        }
    );

}


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.floor(
            seconds % 60
        );


    return `${minutes}:${remaining
        .toString()
        .padStart(2, "0")}`;

}


/* =========================
   SAVE CURRENT SONG
========================= */

function savePlayerState() {

    localStorage.setItem(
        "currentSong",
        currentSong
    );

}


/* =========================
   RESTORE CURRENT SONG
========================= */

const savedSong =
    localStorage.getItem(
        "currentSong"
    );


if (
    savedSong !== null &&
    Number(savedSong) < songs.length
) {

    currentSong =
        Number(savedSong);

}


/* =========================
   COVER ERROR
========================= */

cover.addEventListener(
    "error",
    () => {

        cover.src =
            "https://placehold.co/600x600/111111/ffffff?text=Music";

    }
);


/* =========================
   INITIALIZE
========================= */

loadSong();

updateVolumeIcon();

function toggleFavorite(index) {

    const position =
        favorites.indexOf(index);

    if (position === -1) {

        favorites.push(index);

    } else {

        favorites.splice(
            position,
            1
        );

    }

    localStorage.setItem(
        "favoriteSongs",
        JSON.stringify(favorites)
    );

    renderPlaylist(
        searchInput ? searchInput.value : ""
    );
}

/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener(
    "keydown",
    (event) => {

        // Search box-এ লিখলে keyboard shortcut কাজ করবে না
        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }


        // Space = Play / Pause
        if (event.code === "Space") {

            event.preventDefault();

            playBtn.click();

        }


        // Left Arrow = 5 sec Back
        if (event.code === "ArrowLeft") {

            if (audio.duration) {

                audio.currentTime =
                    Math.max(
                        0,
                        audio.currentTime - 5
                    );

            }

        }


        // Right Arrow = 5 sec Forward
        if (event.code === "ArrowRight") {

            if (audio.duration) {

                audio.currentTime =
                    Math.min(
                        audio.duration,
                        audio.currentTime + 5
                    );

            }

        }


        // N = Next
        if (
            event.key.toLowerCase() === "n"
        ) {

            nextSong(true);

        }


        // P = Previous
        if (
            event.key.toLowerCase() === "p"
        ) {

            prevBtn.click();

        }

    }
);

/* =========================
   SETTINGS MENU
========================= */

const settingsBtn =
    document.getElementById("settingsBtn");

const settingsMenu =
    document.getElementById("settingsMenu");

const closeSettings =
    document.getElementById("closeSettings");


if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        () => {

            settingsMenu.classList.toggle(
                "show"
            );

        }
    );

}


if (closeSettings) {

    closeSettings.addEventListener(
        "click",
        () => {

            settingsMenu.classList.remove(
                "show"
            );

        }
    );

}