/* =========================
   ADD SONG - INDEXED DB
========================= */

const titleInput =
    document.getElementById("newSongTitle");

const artistInput =
    document.getElementById("newSongArtist");

const audioInput =
    document.getElementById("newSongAudio");

const coverInput =
    document.getElementById("newSongCover");

const saveBtn =
    document.getElementById("saveSongBtn");

const message =
    document.getElementById("addMessage");

const coverPreview =
    document.getElementById("coverPreview");


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
    function (event) {

        const database =
            event.target.result;


        if (
            !database.objectStoreNames
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
    function (event) {

        db =
            event.target.result;

    };


dbRequest.onerror =
    function () {

        showMessage(
            "Database open হচ্ছে না।",
            true
        );

    };


/* =========================
   COVER PREVIEW
========================= */

if (coverInput) {

    coverInput.addEventListener(
        "change",
        function () {

            const file =
                coverInput.files[0];


            if (!file) {

                coverPreview.style.display =
                    "none";

                coverPreview.removeAttribute(
                    "src"
                );

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

}


/* =========================
   ADD SONG
========================= */

saveBtn.addEventListener(
    "click",
    function () {

        const title =
            titleInput.value.trim();

        const artist =
            artistInput.value.trim();

        const audioFile =
            audioInput.files[0];

        const coverFile =
            coverInput.files[0] || null;


        /* Title */

        if (!title) {

            showMessage(
                "Song title দিন।",
                true
            );

            return;

        }


        /* Artist */

        if (!artist) {

            showMessage(
                "Artist name দিন।",
                true
            );

            return;

        }


        /* Audio */

        if (!audioFile) {

            showMessage(
                "Audio file select করুন।",
                true
            );

            return;

        }


        /* Database ready */

        if (!db) {

            showMessage(
                "Database এখনও প্রস্তুত হয়নি। একটু পরে আবার চেষ্টা করুন।",
                true
            );

            return;

        }


        /* Disable button */

        saveBtn.disabled =
            true;

        saveBtn.textContent =
            "Adding...";


        /* Transaction */

        const transaction =
            db.transaction(
                ["songs"],
                "readwrite"
            );


        const store =
            transaction.objectStore(
                "songs"
            );


        /* Song object */

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


        /* Save */

        store.add(
            song
        );


        /* Success */

        transaction.oncomplete =
            function () {

                showMessage(
                    `"${title}" added successfully!`,
                    false
                );


                /* Clear form */

                titleInput.value =
                    "";

                artistInput.value =
                    "";

                audioInput.value =
                    "";

                coverInput.value =
                    "";


                /* Clear preview */

                coverPreview.style.display =
                    "none";

                coverPreview.removeAttribute(
                    "src"
                );


                /* Enable button */

                saveBtn.disabled =
                    false;

                saveBtn.textContent =
                    "＋ Add Song";

            };


        /* Error */

        transaction.onerror =
            function () {

                showMessage(
                    "Song save করা যায়নি। আবার চেষ্টা করুন।",
                    true
                );


                saveBtn.disabled =
                    false;

                saveBtn.textContent =
                    "＋ Add Song";

            };

    }
);


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
            ? "add-message error"
            : "add-message success";

}