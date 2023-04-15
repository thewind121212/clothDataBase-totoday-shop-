console.log('running')
import fetch from 'node-fetch'
import mysql from 'mysql'

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'shop_database'
})

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLAcaRd_duPdNvfkSdmbOMysbfRr66xes",
  authDomain: "cothing-clone.firebaseapp.com",
  projectId: "cothing-clone",
  storageBucket: "cothing-clone.appspot.com",
  messagingSenderId: "136444386299",
  appId: "1:136444386299:web:aec5102f731d9ba603095e",
  measurementId: "G-V7WD1X5KRH"
};

// connect to sql database

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId)
})




// Initialize Firebase
const app = initializeApp(firebaseConfig);


const getData = async () => {
  try {
    const response = await fetch('https://totoday-api.mltechsoft.com/attribute/list?icpp=100&attributeId')
    const data = await response.json()
    return data
  }
  catch (err) {
    console.log(err)
  }
}


//transactions insert data
//


const insertDataToSql = async () => {
  const dataFetched = await getData();
  for (let i = 0; i < dataFetched.attributes.length; i++) {
    const indexAttribute = dataFetched.attributes[i]
    const newDataPrepair = {
      ...indexAttribute,
      attributeName: indexAttribute.attributeName == 'Kích cỡ' ? 1 : 2
    }
    connection.beginTransaction(function(err) {
      if (err) { console.log(err); }
      connection.query('INSERT INTO attribute_define (attribute_storageID, attribute_value, attribute_name) VALUES (?,?,?)', [newDataPrepair.attributeName, newDataPrepair.name, newDataPrepair.value],
        (err, result) => {
          console.log(result)
        }
      )

      connection.commit((err) => {
        if (err) {

          connection.rollback(() => {
            console.log(err)
          })
        }
        console.log('success!')
      })
    })


  }
}

insertDataToSql()


