import fs from "fs/promises";
import axios from "axios";
import axiosRetry from "axios-retry";
import path from "path";

const temporaryGalleryFolder = path.resolve("temporary_file/gallery");
const temporaryThumbnailFolder = path.resolve("temporary_file/thumbnail");
const temporaryColor = path.resolve("temporary_file/color");

//=================== get gallery and import to local
//get image from url and save to local disk

axiosRetry(axios , {
  retries: 3,
  retryDelay:(retryCount) => {
    return retryCount * 1300
  }
})

export const getAndSaveImg = async (writeType, imageInfo, filePath) => {
  let imageData = null;
  //if write to gallery
  if (writeType === "writeGroup") {
    imageData = imageInfo;
  }
  //if write to thumbnail process link and write
  else if (writeType === "writeOne") {
    imageData = stringLinkTransform(imageInfo);
  }
  for (let i = 0; i < imageData.imgFullLink.length; i++) {
    //fetch api data
    try {
      const response = await axios({
        method: "get",
        url: imageData.imgFullLink[i],
        responseType: "arraybuffer",
      });
      //write file to local
      await fs.writeFile(`${filePath}/${imageData.imgName[i]}`, response.data);
      // console.log(`writting ${imageData.imgName[i]} `);
    } catch (error) {
      throw error;
    }
  }
  // console.log("write complete");
};

//delete file from local disk (after write to firebase)

export const deleteFile = ({ imgName }, filePath) => {
  try {
    fs.unlinkSync(`${filePath}/${imgName}`);
  } catch (error) {
    console.log(error);
  }
};

// function process data

//=================== Write thumbnail

const stringLinkTransform = (stringLink) => {
  const imgFullLink = stringLink;
  const imgName = imgFullLink.split("/").reverse()[0];
  const imgAbsoluteLink = imgFullLink.replace(imgName, "");

  return {
    imgFullLink: [imgFullLink],
    imgName: [imgName],
    imgAbsoluteLink: [imgAbsoluteLink],
  };
};

export const writeThumbnail = async (stringLink, filePath) => {
  const imageInfo = stringLinkTransform(stringLink);
  console.log(imageInfo);
  await getAndSaveImg(imageInfo, filePath);
};

//------------clean up file
//clean gallery and thumbnail

export const deleteGalleryAndThumbnail = async (colorCode) => {
  try {
    //get file name form folder
    const galleryFolder = await fs.readdir(temporaryGalleryFolder);
    const thumbnailFolder = await fs.readdir(temporaryThumbnailFolder);

    //delete file from that folder
    //delete file from gallery
    console.log("begining delete gallery");
    for (const fileName of galleryFolder) {
      await fs.unlink(`${temporaryGalleryFolder}/${fileName}`);
      console.log(`deleting ${fileName}`);
    }
    //delete file from thumbnail
    console.log("begining delete thumbnail");
    for (const fileName of thumbnailFolder) {
      await fs.unlink(`${temporaryThumbnailFolder}/${fileName}`);
      console.log(`deleting ${fileName}`);
    }
    console.log("begining delete color");
    //delete file from color
    for (const colorKey of colorCode) {
      await fs.rm(`${temporaryColor}/${colorKey}`, {recursive: true, force: true});
      // const fileColorNames = await fs.readdir(`${temporaryColor}/${colorKey}`);
      // for (const fileColorName of fileColorNames) {
      //   await fs.unlink(`${temporaryColor}/${colorKey}/${fileColorName}`);
      //   console.log(`deleting ${fileColorName}`);
      // }
    }
    console.log("delete complete");
  } catch (error) {}
};
