import fs from "fs/promises";
import { sqlRef } from "./jsonData/importSQL.js";
import path from "path";
import {
  getAndSaveImg,
  deleteGalleryAndThumbnail,
} from "./getProductAndSave.js";
import { writeThumbnail, writeGallery, writeColor } from "./firebase.js";
import mysql from "mysql2/promise";

const temporaryGalleryFolder = path.resolve("temporary_file/gallery");
const temporaryThumbnailFolder = path.resolve("temporary_file/thumbnail");
const temporaryColor = path.resolve("temporary_file/color");
const WRITEONE = "writeOne";
const WRITEGROUP = "writeGroup";
const WRITETHUMBNAIL = "thumbnail";
const WRITEGALLERY = "gallery";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "shop_database",
};

// connection.beginTransaction(err => {
//     if (err) {return}
//     connection.query('SELECT * from sub_categories', (err, result ) => {
//         if (err) {connection.rollback(() => {
//             console.log(err)
//         })}
//         console.log(result)
//     })
// })

//predelare var

//get infomation from json file
const dataTest = JSON.parse(
  await fs.readFile(`${path.resolve("jsonData")}/doNuFullComplete.json`)
);

//import sqlid to product
sqlRef["2"].map((sqlId) => {
  for (const [key, values] of Object.entries(dataTest)) {
    if (key == sqlId["shop id"]) {
      values.map((value) => {
        value.SQlId = sqlId["sql id"];
      });
    }
  }
});

// const dummydata = dataTest["72883"][0];

// await writeThumbnail(dummydata.thumbnail, temporaryThumbnailFolder)

// test write gallery data to firebase

const writeGalleryToFirebase = async (id, product) => {
  let fireBaseResolve = {
    galleryApi: null,
    thumbnailLink: null,
    attributes: [],
  };
  try {
    let colorObject = [];
    await getAndSaveImg(WRITEGROUP, product.gallery, temporaryGalleryFolder);

    await getAndSaveImg(WRITEONE, product.thumbnail, temporaryThumbnailFolder);

    for (const [key, values] of Object.entries(product.attributes)) {
      await fs
        .access(`${temporaryColor}/${key}`)
        .then(async () => {
          await getAndSaveImg(
            WRITEONE,
            values.colorLink,
            `${temporaryColor}/${key}`
          );
        })
        .catch(async () => {
          await fs.mkdir(`${temporaryColor}/${key}`);
          await getAndSaveImg(
            WRITEONE,
            values.colorLink,
            `${temporaryColor}/${key}`
          );
        });
      colorObject.push({ key, path: `${temporaryColor}/${key}` });
    }

    const galleryResponse = await writeGallery(
      WRITEGALLERY,
      id,
      temporaryGalleryFolder
    );
    fireBaseResolve.galleryApi = galleryResponse;

    const thumbnailResponse = await writeThumbnail(
      WRITETHUMBNAIL,
      id,
      temporaryThumbnailFolder
    );
    fireBaseResolve.thumbnailLink = thumbnailResponse;

    for (const color of colorObject) {
      const attributesResponse = await writeColor(
        "color",
        color.key,
        id,
        color.path
      );
      fireBaseResolve.attributes.push(attributesResponse);
    }
  } catch (error) {
    throw error;
  }

  return fireBaseResolve;
};

// await getAndSaveImg( 'gallery',dummydata.gallery, temporaryGalleryFolder)
// await getAndSaveImg('thumbnail',dummydata.thumbnail, temporaryThumbnailFolder)

//function write file to sql

// const functionWriteToSql = async() => {
//     for ( const [ keys, values] of Object.entries(dataTest)) {
//             values.map( value => {
//                 const dataPrepareForProductParent = {
//                     name: value.name,
//                     categoryId: value.SQlId,

//                 }
//             })
//     }
// }

// functionWriteToSql(1)
const cleanFile = (data) => {
  const keyColor = Object.keys(data);
  deleteGalleryAndThumbnail(keyColor);
};

const functionTest = async (data) => {
  const connection = await mysql.createConnection(dbConfig);

  for (const productItem of data) {
    await connection.beginTransaction();
    const preData = {
      name: productItem.name,
      categoryID: productItem.SQlId,
      thumbnail: null,
      desc_content: productItem.description,
      likes: Math.floor(Math.random() * (20 - 5 + 1)) + 5,
      active: 1,
      galleryApi: null,
      attributes: productItem.attributes,
      price: productItem.price,
      importPrice: productItem.importPrice,
    };

    let productId = null;

    const [result, other] = await connection.query(
      "INSERT INTO product_parent  (name, CategoryID, desc_content, likes, active) VALUES (?,?,?,?,?)",
      [
        preData.name,
        preData.categoryID,
        preData.desc_content,
        preData.likes,
        preData.active,
      ]
    );

    productId = result.insertId;

    const responseFirebase = await writeGalleryToFirebase(
      productId,
      productItem
    );


    await connection.query(
      "UPDATE product_parent SET thumbnail_img =  ? , gallery_api = ? WHERE id = ?",
      [responseFirebase.thumbnailLink, responseFirebase.galleryApi, productId]
    );
    for (const value of responseFirebase.attributes) {
      let productChildId = null;
      const [result, other] = await connection.query(
        "SELECT id from attribute_define WHERE attribute_value = ?",
        [value.colorCode]
      );
      const [id, moreOther] = await connection.query(
        "INSERT INTO product_child ( product_parentID , main_attribute, color_link) VALUES (?,?,?)",
        [productId, result[0].id, value.colorLink]
      );
      productChildId = id.insertId;
      const sizeSub = preData.attributes[value.colorCode].size;
      for (const size of sizeSub) {
        const amount = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
        const [result, other] = await connection.query(
          "SELECT id from attribute_define WHERE attribute_value = ?",
          [size.size]
        );
        await connection.query(
          "INSERT INTO product_detail ( product_childID, barcode, import_price, price, amount, sub_attributeID, storage_locationID) VALUES (?,?,?,?,?,?,?)",
          [
            productChildId,
            size.barcode,
            preData.importPrice,
            preData.price,
            amount,
            result[0].id,
            1,
          ]
        );
      }
      await connection.commit();
    }

    await cleanFile(preData.attributes);
  }

  connection.end();
};


// const newData = dataTest['563878'].slice(39, (dataTest['563878'].length)) 

const newData = dataTest['563875']

functionTest(newData);
