/* =========================================================
   SUPABASE CLOUD MUSIC UPLOAD
   Multiple Songs + Audio + Cover
========================================================= */


/* =========================
   SUPABASE CONFIG
========================= */

const SUPABASE_URL =
    "https://wbrvmfolvmivdavhwqza.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_WImqKauLjX2vvkrSOnoe_Q_UjiCosQk;

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================
   HTML ELEMENTS
========================= */

const artistInput =
    document.getElementById("artistInput");

const audioInput =
    document.getElementById("audioInput");

const coverInput =
    document.getElementById("coverInput");

const coverPreview =
    document.getElementById("coverPreview");

const selectedCount =
    document.getElementById("selectedCount");

const songList =
    document.getElementById("songList");

const addSongsBtn =
    document.getElementById("addSongsBtn");

const progress =
    document.getElementById("progress");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

const message =
    document.getElementById("message");


/* =========================
   AUDIO FILE SELECT
========================= */

audioInput.addEventListener(
    "change",
    function () {

        const files =
            Array.from(audioInput.files);

        songList.innerHTML = "";

        if (files.length === 0) {

            selectedCount.textContent =
                "No songs selected";

            return;
        }

        selectedCount.textContent =
            `${files.length} songs selected`;

        files.forEach(
            function (file, index) {

                const item =
                    document.createElement("div");

                item.className =
                    "song-item";

                item.innerHTML = `
                    <span class="song-number">
                        ${index + 1}
                    </span>

                    <span class="song-name">
                        ${escapeHTML(
                            removeExtension(file.name)
                        )}
                    </span>
                `;

                songList.appendChild(item);

            }
        );

    }
);


/* =========================
   COVER PREVIEW
========================= */

coverInput.addEventListener(
    "change",
    function () {

        const file =
            coverInput.files[0];

        if (!file) {

            coverPreview.style.display =
                "none";

            return;
        }

        coverPreview.src =
            URL.createObjectURL(file);

        coverPreview.style.display =
            "block";

    }
);


/* =========================
   ADD ALL SONGS
========================= */

addSongsBtn.addEventListener(
    "click",
    async function () {

        const files =
            Array.from(audioInput.files);

        const artist =
            artistInput.value.trim();

        const coverFile =
            coverInput.files[0] || null;


        /* =========================
           VALIDATION
        ========================= */

        if (files.length === 0) {

            showMessage(
                "কমপক্ষে একটি audio file select করুন।",
                true
            );

            return;
        }


        if (!artist) {

            showMessage(
                "Artist name দিন।",
                true
            );

            return;
        }


        if (
            !SUPABASE_PUBLISHABLE_KEY ||
            SUPABASE_PUBLISHABLE_KEY ===
                "PASTE_YOUR_PUBLISHABLE_KEY_HERE"
        ) {

            showMessage(
                "Supabase Publishable Key সেট করা হয়নি।",
                true
            );

            return;
        }


        /* =========================
           BUTTON / PROGRESS
        ========================= */

        addSongsBtn.disabled = true;

        addSongsBtn.textContent =
            "Uploading Songs...";

        progress.style.display =
            "block";

        progressFill.style.width =
            "0%";


        let added = 0;


        try {

            /* =========================
               UPLOAD EACH SONG
            ========================= */

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
                    `Uploading ${i + 1} / ${files.length}`;


                progressFill.style.width =
                    `${(
                        (i / files.length) * 100
                    )}%`;


                /* =========================
                   UNIQUE AUDIO FILE NAME
                ========================= */

                const audioPath =
                    createSafeFileName(
                        audioFile.name
                    );


                /* =========================
                   UPLOAD AUDIO
                ========================= */

                const {
                    error: audioUploadError
                } =
                    await supabaseClient
                        .storage
                        .from("music")
                        .upload(
                            audioPath,
                            audioFile,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    audioFile.type ||
                                    "audio/mpeg"
                            }
                        );


                if (audioUploadError) {

                    throw new Error(
                        "Audio upload failed: " +
                        audioUploadError.message
                    );
                }


                /* =========================
                   AUDIO PUBLIC URL
                ========================= */

                const {
                    data:
                    audioPublicData
                } =
                    supabaseClient
                        .storage
                        .from("music")
                        .getPublicUrl(
                            audioPath
                        );


                const audioUrl =
                    audioPublicData.publicUrl;


                /* =========================
                   COVER UPLOAD
                ========================= */

                let coverUrl = "";


                if (coverFile) {

                    const coverPath =
                        createSafeFileName(
                            coverFile.name
                        );


                    const {
                        error:
                        coverUploadError
                    } =
                        await supabaseClient
                            .storage
                            .from("music")
                            .upload(
                                coverPath,
                                coverFile,
                                {
                                    cacheControl:
                                        "3600",

                                    upsert:
                                        false,

                                    contentType:
                                        coverFile.type ||
                                        "image/jpeg"
                                }
                            );


                    if (coverUploadError) {

                        throw new Error(
                            "Cover upload failed: " +
                            coverUploadError.message
                        );
                    }


                    const {
                        data:
                        coverPublicData
                    } =
                        supabaseClient
                            .storage
                            .from("music")
                            .getPublicUrl(
                                coverPath
                            );


                    coverUrl =
                        coverPublicData.publicUrl;

                }


                /* =========================
                   SAVE SONG IN DATABASE
                ========================= */

                const {
                    error:
                    databaseError
                } =
                    await supabaseClient
                        .from("songs")
                        .insert([
                            {
                                title:
                                    title,

                                artist:
                                    artist,

                                audio_url:
                                    audioUrl,

                                cover_url:
                                    coverUrl
                            }
                        ]);


                if (databaseError) {

                    throw new Error(
                        "Database save failed: " +
                        databaseError.message
                    );
                }


                added++;

            }


            /* =========================
               SUCCESS
            ========================= */

            progressText.textContent =
                `${added} / ${files.length} songs uploaded`;

            progressFill.style.width =
                "100%";


            showMessage(
                `✓ ${added} songs successfully uploaded to cloud!`,
                false
            );


            /* =========================
               CLEAR FORM
            ========================= */

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
             * Player page-এ ফেরত
             */

            setTimeout(
                function () {

                    window.location.href =
                        "index.html";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Cloud upload error:",
                error
            );


            showMessage(
                "গান upload করা যায়নি: " +
                error.message,
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
   CREATE UNIQUE FILE NAME
========================= */

function createSafeFileName(
    originalName
) {

    const extension =
        originalName.includes(".")
            ? originalName
                .substring(
                    originalName
                        .lastIndexOf(".")
                )
                .toLowerCase()
            : "";

    const randomPart =
        crypto.randomUUID();

    return (
        Date.now() +
        "_" +
        randomPart +
        extension
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
        document.createElement("div");

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
