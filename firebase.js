import path from "path";
import fs from "fs/promises";

const absolutePath = path.resolve("temporary_file");
const absolutePathJson = path.resolve("dataFetched");
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDownloadURL, getStorage, ref, uploadBytes, listAll} from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLAcaRd_duPdNvfkSdmbOMysbfRr66xes",
  authDomain: "cothing-clone.firebaseapp.com",
  projectId: "cothing-clone",
  storageBucket: "cothing-clone.appspot.com",
  messagingSenderId: "136444386299",
  appId: "1:136444386299:web:aec5102f731d9ba603095e",
  measurementId: "G-V7WD1X5KRH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create storage reference

const storage = getStorage(app);

//read dir and write thumbnail and gallery to firebase

export const writeGallery = async (writeDefind, id, filePath) => {
  try {
    const fileFolder = await fs.readdir(filePath);
    console.log(fileFolder);
    for (let i = 0; i < fileFolder.length; i++) {
      const fileName = fileFolder[i];
      if (fileName !== ".DS_Store") {
        const file = await fs.readFile(`${filePath}/${fileName}`);
        const storageRef = ref(
          storage,
          `assets/${id}/${writeDefind}/${fileName}`
        );
        await uploadBytes(storageRef, file).then((snapshot) => {
          console.log(`upload ${fileName} complete`);
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
  return `assets/${id}/${writeDefind}`
};

export const writeThumbnail = async (writeDefind, id, filePath) => {
  let pathRef = null;
  try {
    const fileFolder = await fs.readdir(filePath);
    console.log(fileFolder);
    for (let i = 0; i < fileFolder.length; i++) {
      const fileName = fileFolder[i];
      if (fileName !== ".DS_Store") {
        const file = await fs.readFile(`${filePath}/${fileName}`);
        const storageRef = ref(
          storage,
          `assets/${id}/${writeDefind}/${fileName}`
        );
        await uploadBytes(storageRef, file).then( async (snapshot) => {
          console.log(`upload ${fileName} complete`);
          await getDownloadURL(ref(storage, snapshot.metadata.fullPath)).then(
            res => pathRef = res
          );
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
  return pathRef;
};

export const writeColor = async (writeDefind, colorId ,id, filePath) => {
  let attributesAndLink = {
    colorCode: colorId,
    colorLink: null
  }
  try {
    const fileFolder = await fs.readdir(filePath);
    console.log(fileFolder);
    for (let i = 0; i < fileFolder.length; i++) {
      const fileName = fileFolder[i];
      if (fileName !== ".DS_Store") {
        const file = await fs.readFile(`${filePath}/${fileName}`);
        const storageRef = ref(
          storage,
          `assets/${id}/${writeDefind}/${colorId}/${fileName}`
        );
        await uploadBytes(storageRef, file).then( async (snapshot) => {
          console.log(`upload ${fileName} complete`);
           await getDownloadURL(ref(storage, snapshot.metadata.fullPath)).then(
            res => attributesAndLink.colorLink = res
           );
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
  return attributesAndLink
};

// await readFileHandler(112, absolutePath)

// const listRef = ref(storage, 'assets/1/gallery')

// listAll(listRef).then(res => {
//   res.items.forEach(item => {
//     console.log(item)
//   })
// })
