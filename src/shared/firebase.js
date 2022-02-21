import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAYnmUdxJz1YBmh38phwQznAOtEEjS5nOE",
  authDomain: "myinsta-60d69.firebaseapp.com",
  projectId: "myinsta-60d69",
  storageBucket: "myinsta-60d69.appspot.com",
  messagingSenderId: "309473971240",
  appId: "1:309473971240:web:a1844614cbe8baae44b91d",
};

firebase.initializeApp(firebaseConfig);

const apiKey = firebaseConfig.apiKey;

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

export { auth, apiKey, firestore, storage };
