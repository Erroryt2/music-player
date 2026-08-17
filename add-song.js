/* =========================================================
   SUPABASE ADMIN MUSIC UPLOAD
   Multiple Songs + Audio + Cover
   ADMIN ONLY
========================================================= */


/* =========================
   SUPABASE CONFIG
========================= */

const SUPABASE_URL =
    "https://wbrvmfolvmivdavhwqza.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_WImqKauLjX2vvkrSOnoe_Q_UjiCosQk";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                storage:
                    window.sessionStorage,

                persistSession:
                    true,

                autoRefreshToken:
                    true,

                detectSessionInUrl:
                    true
            }
        }
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
   ADMIN AUTH CHECK
========================= */

let isAdmin = false;


/* =========================
   CHECK ADMIN
========================= */

async function checkAdmin() {

    try {

        const {
            data: {
                session
            },
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        /* =========================
           NOT LOGGED IN
        ========================= */

        if (!session) {

            showLoginScreen();

            return false;
        }


        /* =========================
           CHECK ADMIN
        ========================= */

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "is_admin"
        );


        if (error) {

            console.error(
                "Admin check error:",
                error
            );

            showMessage(
                "Admin verification failed: " +
                error.message,
                true
            );

            return false;
        }


        if (!data) {

            showMessage(
                "Access denied. Only Admin can add songs.",
                true
            );

            if (addSongsBtn) {
                addSongsBtn.disabled = true;
            }

            return false;
        }


        /* =========================
           ADMIN VERIFIED
        ========================= */

        isAdmin = true;

        console.log(
            "Admin verified successfully"
        );

        return true;

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        showMessage(
            "Authentication error: " +
            error.message,
            true
        );

        return false;
    }
}


/* =========================
   LOGIN SCREEN
========================= */

function showLoginScreen() {

    const container =
        document.querySelector(
            ".container"
        ) ||
        document.body;


    const loginBox =
        document.createElement("div");

    loginBox.id =
        "adminLoginBox";


    loginBox.style.cssText = `
        max-width:420px;
        margin:40px auto;
        padding:30px;
        border-radius:18px;
        background:#1b1118;
        border:1px solid #3a2632;
        text-align:center;
        color:white;
    `;


    loginBox.innerHTML = `

        <h2 style="margin-bottom:10px;">
            🔐 Admin Login
        </h2>

        <p style="
            opacity:.7;
            margin-bottom:25px;
        ">
            Only Admin can add or remove songs.
        </p>

        <input
            id="adminEmail"
            type="email"
            placeholder="Admin Email"
            style="
                width:100%;
                box-sizing:border-box;
                padding:13px;
                margin-bottom:12px;
                border-radius:10px;
                border:1px solid #4a3540;
                background:#241820;
                color:white;
            "
        >

        <input
            id="adminPassword"
            type="password"
            placeholder="Password"
            style="
                width:100%;
                box-sizing:border-box;
                padding:13px;
                margin-bottom:15px;
                border-radius:10px;
                border:1px solid #4a3540;
                background:#241820;
                color:white;
            "
        >

        <button
            id="adminLoginBtn"
            style="
                width:100%;
                padding:13px;
                border:0;
                border-radius:10px;
                cursor:pointer;
                background:#ffffff;
                color:#111;
                font-weight:bold;
            "
        >
            Login
        </button>

        <div
            id="loginMessage"
            style="
                margin-top:15px;
                font-size:14px;
            "
        ></div>

    `;


    container.innerHTML = "";

    container.appendChild(
        loginBox
    );


    document
        .getElementById(
            "adminLoginBtn"
        )
        .addEventListener(
            "click",
            adminLogin
        );
}


/* =========================
   ADMIN LOGIN
========================= */

async function adminLogin() {

    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();

    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    if (!email || !password) {

        loginMessage.textContent =
            "Email এবং password দিন।";

        loginMessage.style.color =
            "#ff6b6b";

        return;
    }


    const loginBtn =
        document.getElementById(
            "adminLoginBtn"
        );

    loginBtn.disabled = true;

    loginBtn.textContent =
        "Logging in...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {
            throw error;
        }


        /* =========================
           CHECK ADMIN AFTER LOGIN
        ========================= */

        const {
            data: adminResult,
            error: adminError
        } =
            await supabaseClient.rpc(
                "is_admin"
            );


        if (adminError) {
            throw adminError;
        }


        if (!adminResult) {

            await supabaseClient.auth.signOut();

            loginMessage.textContent =
                "এই account Admin নয়।";

            loginMessage.style.color =
                "#ff6b6b";

            loginBtn.disabled = false;

            loginBtn.textContent =
                "Login";

            return;
        }


        /* =========================
           ADMIN SUCCESS
        ========================= */

        loginMessage.textContent =
            "✓ Admin login successful";

        loginMessage.style.color =
            "#5cff9d";


   setTimeout(
    function () {

        window.location.href =
            "add-song.html";

    },
    700
);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        loginMessage.textContent =
            "Login failed: " +
            error.message;

        loginMessage.style.color =
            "#ff6b6b";


        loginBtn.disabled = false;

        loginBtn.textContent =
            "Login";
    }
}


/* =========================
   AUDIO FILE SELECT
========================= */

if (audioInput) {

    audioInput.addEventListener(
        "change",
        function () {

            const files =
                Array.from(
                    audioInput.files
                );


            songList.innerHTML = "";


            if (files.length === 0) {

                selectedCount.textContent =
                    "No songs selected";

                return;
            }


            selectedCount.textContent =
                `${files.length} songs selected`;


            files.forEach(
                function (
                    file,
                    index
                ) {

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

}


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
   ADD ALL SONGS
========================= */

if (addSongsBtn) {

    addSongsBtn.addEventListener(
        "click",
        async function () {


            /* =========================
               ADMIN SECURITY CHECK
            ========================= */

            if (!isAdmin) {

                const adminOk =
                    await checkAdmin();

                if (!adminOk) {
                    return;
                }
            }


            const files =
                Array.from(
                    audioInput.files
                );


            const artist =
                artistInput.value.trim();


            const coverFile =
                coverInput.files[0] ||
                null;


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


            /* =========================
               BUTTON / PROGRESS
            ========================= */

            addSongsBtn.disabled =
                true;


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
                            (i /
                                files.length) *
                            100
                        )}%`;


                    /* =========================
                       AUDIO FILE NAME
                    ========================= */

                    const audioPath =
                        createSafeFileName(
                            audioFile.name
                        );


                    /* =========================
                       UPLOAD AUDIO
                    ========================= */

                    const {
                        error:
                            audioUploadError
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
                        audioPublicData
                            .publicUrl;


                    /* =========================
                       COVER UPLOAD
                    ========================= */

                    let coverUrl =
                        "";


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


                        if (
                            coverUploadError
                        ) {

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
                            coverPublicData
                                .publicUrl;
                    }


                    /* =========================
                       SAVE SONG DATABASE
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

}


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

    if (!message) {
        alert(text);
        return;
    }


    message.textContent =
        text;


    message.className =
        error
            ? "message error"
            : "message success";

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await checkAdmin();

    }
);
