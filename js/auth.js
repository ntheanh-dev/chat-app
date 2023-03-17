// import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut, getAdditionalUserInfo }
    from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { doc, onSnapshot, getFirestore, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { addDocument, getCurrentUserData, fetchUserById, generateKeywords } from "../firebase/service.js";
var signInWithGoogle = document.getElementById('signInWithGoogle');
var singInWithFacebook = document.getElementById('singInWithFacebook');

export const authThentication = {
    // FirebaseUI config.
    uiConfig: {
        signInSuccessUrl: "<url-to-redirect-to-on-success>",
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        tosUrl: "<your-tos-url>",
        privacyPolicyUrl: function () {
            window.location.assign("<your-privacy-policy-url>");
        },
    },
    signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        const auth = getAuth();
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;

                const { isNewUser, profile } = getAdditionalUserInfo(result)
                if (isNewUser) {
                    profile.lastLoginAt = result.user.metadata.lastLoginAt
                    profile.keywords = generateKeywords(profile.name)
                    profile.listFriend = []
                    profile.listRequest = []
                    addDocument('users', {
                        name: profile.name,
                        picture: profile.picture,
                        email: profile.email,
                        id: profile.id,
                        lastLoginAt: result.user.metadata.lastLoginAt,
                        keywords: generateKeywords(profile.name),
                        listFriend: [],
                        listRequest: [],
                    })
                    localStorage.setItem("userData", JSON.stringify(profile));
                    setTimeout(() => {
                        window.location.href = "/main.html";
                    }, 2000);
                } else {
                    fetchUserById(profile.id)
                        .then(currentUser => {
                            if (currentUser) {
                                localStorage.setItem("userData", JSON.stringify(currentUser));
                                window.location.href = "/main.html";
                            }
                        })
                }
            }).catch((error) => {
                console.log(error)
            })
    },
    signInWithFacebook() {
        const provider = new FacebookAuthProvider();
        const auth = getAuth();
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;

                const { isNewUser, profile } = getAdditionalUserInfo(result)

                console.log(profile)
                console.log(result)
                if (isNewUser) {
                    addDocument('users', {
                        name: profile.name,
                        picture: result.user.photoURL,
                        email: result.user.email,
                        id: profile.id,
                        lastLoginAt: result.user.metadata.lastLoginAt,
                        keywords: generateKeywords(profile.name),
                        listFriend: [],
                        listRequest: [],
                    })
                    localStorage.setItem("userData", JSON.stringify(profile));
                    setTimeout(() => {
                        window.location.href = "/main.html";
                    }, 2000);
                } else {
                    fetchUserById(profile.id)
                        .then(currentUser => {
                            if (currentUser) {
                                localStorage.setItem("userData", JSON.stringify(currentUser));
                                window.location.href = "/main.html";
                            }
                        })
                }
            }).catch((error) => {
                console.log(error)
            })

    },
    signOut() {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
            localStorage.removeItem("userData");
            localStorage.removeItem("selectedChat");
            localStorage.removeItem("currently");
            window.location.href = "./index.html";
        }).catch((error) => {
            // An error happened.
        });
    },
    init() {
        const firebaseConfig = {
            apiKey: "AIzaSyBg9nb7XlQ_N8mH4uDdmhvLIsbdlHTpz-4",
            authDomain: "chat-app-realtime-5a030.firebaseapp.com",
            projectId: "chat-app-realtime-5a030",
            storageBucket: "chat-app-realtime-5a030.appspot.com",
            messagingSenderId: "599439824254",
            appId: "1:599439824254:web:0f83c946f38fa277ee0f2f",
            measurementId: "G-719T911TT5",
        };
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const storage = getStorage(app);

        const db = getFirestore();
        const currentUser = getCurrentUserData();
        if (currentUser) {
            const unsub = onSnapshot(doc(db, "users", currentUser.id), async (docum) => {
                localStorage.setItem("userData", JSON.stringify(docum.data()));
            });
        }
    }
}

authThentication.init();

if (signInWithGoogle) {
    signInWithGoogle.addEventListener('click', event => {
        event.preventDefault();
        const currentUser = getCurrentUserData();
        if (currentUser)
            window.location.href = "./main.html";
        else
            authThentication.signInWithGoogle();
    })
}
if (singInWithFacebook) {
    singInWithFacebook.addEventListener('click', event => {
        event.preventDefault();
        const currentUser = getCurrentUserData();
        if (currentUser)
            window.location.href = "./index.html";
        else
            authThentication.signInWithFacebook();
    })
}