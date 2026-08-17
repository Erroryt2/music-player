/* =========================
   MULTIPLE SONG UPLOAD
========================= */


const artistInput =
    document.getElementById(
        "artistInput"
    );


const audioInput =
    document.getElementById(
        "audioInput"
    );


const coverInput =
    document.getElementById(
        "coverInput"
    );


const coverPreview =
    document.getElementById(
        "coverPreview"
    );


const selectedCount =
    document.getElementById(
        "selectedCount"
    );


const songList =
    document.getElementById(
        "songList"
    );


const addSongsBtn =
    document.getElementById(
        "addSongsBtn"
    );


const progress =
    document.getElementById(
        "progress"
    );


const progressText =
    document.getElementById(
        "progressText"
    );


const progressFill =
    document.getElementById(
        "progressFill"
    );


const message =
    document.getElementById(
        "message"
    );


/* =========================
   DATABASE
========================= */


let db = null;


const dbRequest =
    indexedDB.open(
        "MyMusicDB",
        1
    );


dbRequest.onupgradeneeded =
    function(event) {

        const database =
            event.target.result;


        if (
            !database
                .objectStoreNames
                .contains("songs")
        ) {

            database.createObjectStore(
                "songs",
                {
                    keyPath: "id",
                    autoIncrement: true
                }
            );

        }

    };


dbRequest.onsuccess =
    function(event) {

        db =
            event.target.result;

    };


dbRequest.onerror =
    function() {

        showMessage(
            "Database open হচ্ছে না।",
            true
        );

    };


/* =========================
   AUDIO FILE SELECT
========================= */


audioInput.addEventListener(
    "change",
    function() {

        const files =
            Array.from(
                audioInput.files
            );


        songList.innerHTML =
            "";


        if (
            files.length === 0
        ) {

            selectedCount.textContent =
                "No songs selected";

            return;

        }


        selectedCount.textContent =
            `${files.length} songs selected`;


        files.forEach(
            function(file, index) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "song-item";


                item.innerHTML = `

                    <span class="song-number">
                        ${index + 1}
                    </span>

                    <span class="song-name">
                        ${escapeHTML(
                            removeExtension(
                                file.name
                            )
                        )}
                    </span>

                `;


                songList.appendChild(
                    item
                );

            }
        );

    }
);


/* =========================
   COVER PREVIEW
========================= */


coverInput.addEventListener(
    "change",
    function() {

        const file =
            coverInput.files[0];


        if (!file) {

            coverPreview.style.display =
                "none";

            return;

        }


        coverPreview.src =
            URL.createObjectURL(
                file
            );


        coverPreview.style.display =
            "block";

    }
);


/* =========================
   ADD ALL SONGS
========================= */


addSongsBtn.addEventListener(
    "click",
    async function() {

        const files =
            Array.from(
                audioInput.files
            );


        const artist =
            artistInput.value.trim();


        const coverFile =
            coverInput.files[0] ||
            null;


        /* Check songs */

        if (
            files.length === 0
        ) {

            showMessage(
                "কমপক্ষে একটি audio file select করুন।",
                true
            );

            return;

        }


        /* Check artist */

        if (!artist) {

            showMessage(
                "Artist name দিন।",
                true
            );

            return;

        }


        /* Check DB */

        if (!db) {

            showMessage(
                "Database এখনও প্রস্তুত হয়নি। একটু পরে চেষ্টা করুন।",
                true
            );

            return;

        }


        /* Button */

        addSongsBtn.disabled =
            true;


        addSongsBtn.textContent =
            "Adding Songs...";


        progress.style.display =
            "block";


        progressFill.style.width =
            "0%";


        let added =
            0;


        try {

            /*
             * প্রতিটি গান আলাদা
             * IndexedDB transaction-এ save হবে
             */

            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                const audioFile =
                    files[i];


                const title =
                    removeExtension(
                        audioFile.name
                    );


                progressText.textContent =
                    `Adding ${i + 1} / ${files.length}`;


                progressFill.style.width =
                    `${(
                        (i + 1) /
                        files.length
                    ) * 100}%`;


                await saveSong(
                    title,
                    artist,
                    audioFile,
                    coverFile
                );


                added++;

            }


            /* Success */

            progressText.textContent =
                `${added} / ${files.length} songs added`;


            progressFill.style.width =
                "100%";


            showMessage(
                `✓ ${added} songs successfully added!`,
                false
            );


            /* Clear */

            artistInput.value =
                "";


            audioInput.value =
                "";


            coverInput.value =
                "";


            songList.innerHTML =
                "";


            selectedCount.textContent =
                "No songs selected";


            coverPreview.style.display =
                "none";


            /*
             * Player-এ ফেরত
             * যাওয়ার জন্য একটু delay
             */

            setTimeout(
                function() {

                    window.location.href =
                        "index.html";

                },
                1200
            );


        } catch(error) {

            console.error(
                "Add songs error:",
                error
            );


            showMessage(
                "কিছু গান save করা যায়নি।",
                true
            );

        }


        addSongsBtn.disabled =
            false;


        addSongsBtn.textContent =
            "＋ Add All Songs";

    }
);


/* =========================
   SAVE ONE SONG
========================= */


function saveSong(
    title,
    artist,
    audioFile,
    coverFile
) {

    return new Promise(
        function(
            resolve,
            reject
        ) {

            const transaction =
                db.transaction(
                    ["songs"],
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    "songs"
                );


            const song = {

                title:
                    title,

                artist:
                    artist,

                audio:
                    audioFile,

                cover:
                    coverFile,

                addedAt:
                    Date.now()

            };


            store.add(
                song
            );


            transaction.oncomplete =
                function() {

                    resolve();

                };


            transaction.onerror =
                function() {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =========================
   REMOVE EXTENSION
========================= */


function removeExtension(
    filename
) {

    return filename.replace(
        /\.[^/.]+$/,
        ""
    );

}


/* =========================
   ESCAPE HTML
========================= */


function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================
   MESSAGE
========================= */


function showMessage(
    text,
    error
) {

    message.textContent =
        text;


    message.className =
        error
            ? "message error"
            : "message success";

}