// import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, getAdditionalUserInfo }
    from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { doc, onSnapshot, getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import { addDocument, getCurrentUserData, fetchUserById, generateKeywords } from "../firebase/service.js";
var signInWithGoogle = document.getElementById('signInWithGoogle');

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
                    addDocument('users', profile)
                    localStorage.setItem("userData", JSON.stringify(profile));
                    window.location.href = "/index.html";
                } else {
                    fetchUserById(profile.id)
                        .then(currentUser => {
                            if (currentUser) {
                                localStorage.setItem("userData", JSON.stringify(currentUser));
                                window.location.href = "/index.html";
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
            window.location.href = "./signIn.html";
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

        let db = getFirestore();
        const currentUser = getCurrentUserData();
        if (currentUser) {
            const unsub = onSnapshot(doc(db, "users", currentUser.id), (doc) => {
                localStorage.setItem("userData", JSON.stringify(doc.data()));
            });
        }
    }
}

authThentication.init();

if (signInWithGoogle) {
    signInWithGoogle.addEventListener('click', async e => {
        authThentication.signInWithGoogle();

    })
}