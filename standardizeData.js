import fs from 'fs/promises'
import  mysql from 'mysql'
import path from 'path'
import convert from 'xml-js'
import {sqlRef} from './jsonData/importSQL.js'

export const processStringHandle = (string) => {
  const options = { compact: true, ignoreComment: true, spaces: 4, alwaysArray: true };
  const imgList = []
  const imgListName = []
  const result = convert.xml2js(string, options)
    for(const [key,value] of Object.entries(result.p)) {
            value.img.map((img) => {
                const imgFullLink = img._attributes.src 
            imgList.push(imgFullLink)
            imgListName.push(imgFullLink.split('/').reverse()[0])
            })
    }

    const absoluteLink = imgList[0].replace(imgListName[0], '')

    

    const returnValue =  {
    imgFullLink: imgList,
    imgName: imgListName,
    absoluteLink: absoluteLink
  }
  console.log(returnValue)

  return returnValue
}
const absolutePath = path.resolve('dataFetched')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'shop_database'
})

const readFullDataProduct = async (fileName) => {
    const rawData = await fs.readFile(`${absolutePath}/${fileName}.json`)
    const data  = JSON.parse(rawData)
        for(const [key, values] of Object.entries(data)) {
            values.map((value, index) => {
            console.log(value.id)
                    if(value.gallery === null) {
                    }
                if ( value.gallery !== null && value.gallery.substring(0,3) !== '<p>' ) {
                    value.gallery = ['<p>', value.gallery, '</p>'].join('')
                }
                const trasformGallery = processStringHandle(value.gallery)
                value.gallery = trasformGallery
                for (const [keyAt, valueAt] of Object.entries(value.attributes)) {
                    if(valueAt.colorLink === 'missing') {
                    }
                }
                        delete value.color 
            
        })
        }
    return data
}






//oh god final step 



const dataTest = JSON.parse(await fs.readFile(`${path.resolve('jsonData')}/doNamFullComplete.json`))




const value = dataTest['563878'].findIndex( (data, index) => {
   return  data.name === 'QUẦN JEAN M1QJN11104BSFTR' 
   
})

console.log(value)
// const newData = dataTest['563878'].slice(value, dataTest['563878'].length)
// console.log(newData)





