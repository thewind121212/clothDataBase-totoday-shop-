import path from 'path'
import fs from 'fs/promises'

const absolutePath = path.resolve('dataFetched')



// api fetch data check page and get full products
const dataFetching = async (categoryId) => {
  let fullProductObj = []
  try {
    const urlNeed = (page) => {
      return `https://totoday-api.mltechsoft.com/products/search?icpp=48&page=${page}&categoryId=${categoryId}&parentId=0&status=Active&fromPrice=0&toPrice=999999`
    }
    for (let i = 1; i < 100; i++) {

      const response = await fetch(urlNeed(i))
      const data = await response.json()
      if (data.code === 1 && data.data.products.length > 0) {

        fullProductObj.push(...data.data.products)
      }
      else {
        i = 1000
      }

    }
    return fullProductObj
  } catch (error) {
    throw error
  }
}



//write data to json using fs 

const writeJsonHandler = async (filePath, masterCategory) => {
  const dataFetched = await dataFetching(masterCategory)
  const jsonString = JSON.stringify(dataFetched)
  fs.writeFile(`${filePath}/${masterCategory}.json`, jsonString, err => {
    if (err) throw err
    console.log('data has been write')
  })
}



// get need infomation

export const getInfoAndSave = async (filePath, masterCategory) => {
  let subCategoryByList = {}
  const dataGeneral = []
  try {
    const rawData = await fs.readFile(`${filePath}/${masterCategory}.json`)
    const dataTrasform = JSON.parse(rawData)
    //write data in loop
    for (let i = 0; i < dataTrasform.length; i++) {
      const pgo = dataTrasform[i]
      if (pgo.importPrice === null) {
        pgo.importPrice = pgo.price / 2
      }
      const productGeneral = {
        id: pgo.idNhanh,
        name: pgo.name,
        importPrice: pgo.importPrice,
        price: pgo.price,
        status: pgo.status,
        subCategory: pgo.categoryId
      }
      dataGeneral.push(productGeneral)

      if (subCategoryByList[`${pgo.categoryId}`] === undefined) {
        subCategoryByList[`${pgo.categoryId}`] = []
        subCategoryByList[`${pgo.categoryId}`].push(productGeneral)
      }
      else {
        subCategoryByList[`${pgo.categoryId}`].push(productGeneral)
      }
    }
    return {
      subCategoryByID: subCategoryByList,
      fullDataJoin: dataGeneral
    }

  } catch (error) {

  }

}




//write categoryByID into local 

const writeCategoryByIdHandler = async (filePath, fileName, callbackFunction) => {
  const data = await callbackFunction
  const jsonString = JSON.stringify(data)
  fs.writeFile(`${filePath}/${fileName}.json`, jsonString, err => {
    if (err) throw err
    console.log('data has been write')
  })
}

writeCategoryByIdHandler(absolutePath, 'doNam', getInfoAndSave(absolutePath, '72882'))



const getDataTest = async (idCategory, filePath, fileName) => {
  const dataDetailPerProduct = {}
  try {
    const data = await getInfoAndSave(filePath, idCategory)

    const jsonString = JSON.stringify(data)
    fs.writeFile(`${filePath}/${fileName}.json`, jsonString, err => {
      if (err) throw err
      console.log('data has been write')
    })

    const dataProductJSON = data
    for (let i = 0; i < dataProductJSON.fullDataJoin.length; i++) {
      const productId = dataProductJSON.fullDataJoin[i].id
      const rawDataPerProduct = await fetch(`https://totoday-api.mltechsoft.com/products/${productId}`)
      const dataPerProduct = await rawDataPerProduct.json()
      if (!dataDetailPerProduct[productId]) {
        dataDetailPerProduct[productId] = []
        dataDetailPerProduct[productId].push(dataPerProduct.data)
        console.log(`processing = ${(i / dataProductJSON.fullDataJoin.length) * 100}`)
      }
    }

    const preDataWrite = JSON.stringify(dataDetailPerProduct)
    fs.writeFile(`${filePath}/${fileName}Detail.json`, preDataWrite, err => {
      if (err) throw err
      console.log('data has been write')
    })
  } catch (error) {
    throw error
  }
}





// //add more information to prodcutById

// const addMoreInfomation = async (filePath, fileName) => {
//   try {
//     const preDataRaw = await fs.readFile(`${absolutePath}/${fileName}.json`)
//     const preDataDetailRaw = await fs.readFile(`${absolutePath}/${fileName}Detail.json`)
//     const preData = JSON.parse(preDataRaw)
//     const preDataDetail = JSON.parse(preDataDetailRaw)
//     for (const key in preData.subCategoryByID) {
//       const id = key
//       for (let i = 0; i < preData.subCategoryByID[key].length; i++) {
//         const productId = preData.subCategoryByID[key][i].id
//         preData.subCategoryByID[key][i].attributes = {}
//         preData.subCategoryByID[key][i].color = []
//         const collector = {}
//         for (let key in preDataDetail) {
//           if (productId === key) {
//             for (let newKey in preDataDetail[key][0]) {
//               const data = preDataDetail[key][0][newKey]
//               if (productId === newKey) {
//                 preData.subCategoryByID[id][i].thumbnail = data.image
//                 preData.subCategoryByID[id][i].gallery = data.content
//                 preData.subCategoryByID[id][i].description = data.description
//               }
//               else {
//                 if (data.image.trim() !== '') {
//                   preData.subCategoryByID[id][i].color.push(data.image)
//                 }
//                 const atributeTempValue = []
//                 for (const attributesKey in data.attributes) {
//                   for (const subAtributeKey in data.attributes[attributesKey]) {
//                     const attributeName = data.attributes[attributesKey][subAtributeKey].attributeName
//                     const attributeValue = data.attributes[attributesKey][subAtributeKey].name
//                     atributeTempValue.push(attributeValue)
//                     //check duplicate attribue 
//                     let dataChild = {
//                       barcode: data.barcode,
//                       subAtribute: '1 color'
//                     }
//                     if (atributeTempValue.length === 1 && !Object.keys(collector).includes(attributeValue) && attributeName === 'Kích cỡ') {
//                       collector[`${attributeValue}`] = []
//                       if (Object.keys(data.attributes).length === 1 && attributeName !== 'Kích cỡ') {
//                       }
//                       if (Object.keys(data.attributes).length === 1) {
//                         collector[`${atributeTempValue[0]}`].push(dataChild)
//                       }

//                     }
//                     else {

//                       if (attributeValue !== atributeTempValue[0] && attributeName !== 'Kích cỡ') {
//                         dataChild = {
//                           ...dataChild,
//                           subAtribute: attributeValue
//                         }
//                         collector[`${atributeTempValue[0]}`].push(dataChild)
//                       }
//                       if (attributeValue === atributeTempValue[0] && data.image.trim() !== '' && attributeName !== 'Kích cỡ') {
//                         dataChild = {
//                           ...dataChild,
//                           subAtribute: 'full size'
//                         }
//                         collector[`FS`] = []
//                         collector[`FS`].push(dataChild)
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//             preData.subCategoryByID[id][i].attributes = collector
//           }
//         }
//       }
//     }
//     return preData.subCategoryByID
//   } catch (err) {
//     throw err
//   }
// }

// const data = await addMoreInfomation(absolutePath, 'doNam')

// for (const [key, value] of Object.entries(data)) {
//   value.find((items) => {
//     console.log(items.attributes)
//     console.log(items.color)
//     console.log(items.name)
//   })
// }


//new

const addMoreInfomation = async (filePath, fileName) => {
  try {
    const preDataRaw = await fs.readFile(`${absolutePath}/${fileName}.json`)
    const preDataDetailRaw = await fs.readFile(`${absolutePath}/${fileName}Detail.json`)
    const preData = JSON.parse(preDataRaw)
    const preDataDetail = JSON.parse(preDataDetailRaw)
    for (const key in preData.subCategoryByID) {
      const id = key
      for (let i = 0; i < preData.subCategoryByID[key].length; i++) {
        const productId = preData.subCategoryByID[key][i].id
        preData.subCategoryByID[key][i].attributes = {}
        preData.subCategoryByID[key][i].color = []
        const collector = []
        const testing = {}
        let firstColor = null
        for (let key in preDataDetail) {
          if (productId === key) {
            //begin per child 
            for (let newKey in preDataDetail[key][0]) {
              const data = preDataDetail[key][0][newKey]
              if (productId === newKey) {
                preData.subCategoryByID[id][i].thumbnail = data.image
                preData.subCategoryByID[id][i].gallery = data.content
                preData.subCategoryByID[id][i].description = data.description
                firstColor = data.image
              }
              else {
                let colorId = null
                let sizeId = null
                data.attributes.map((attribute) => {
                  if (String(Object.keys(attribute)) === '83679') {
                    colorId = attribute['83679'].name
                  }
                  else if (String(Object.keys(attribute)) === '83678') {
                    sizeId = attribute['83678'].name
                  }
                })
                const dataAt = {
                  color: data.image,
                  barcode: data.barcode,
                  colorId: colorId,
                  sizeId: sizeId
                }
                collector.push(dataAt)
              }
            }
            const colorArray = []
            collector.map((collect) => {
              //thu thap mau

              if (collect.colorId !== null) {
                if (!colorArray.includes(collect.colorId)) {
                  testing[`${collect.colorId}`] = {
                    colorLink: collect.color,
                    size: []
                  }
                  colorArray.push((collect.colorId))
                }
                testing[`${collect.colorId}`].size.push({ size: collect.sizeId ? collect.sizeId : 'FS', barcode: collect.barcode })

              } else if (collect.colorId === null) {

                if (!colorArray.includes('1 Color')) {
                  testing[`1 Color`] = {
                    colorLink: collect.color ? collect.color : firstColor,
                    size: []
                  }
                  colorArray.push('1 Color')
                }
                testing['1 Color'].size.push({ size: collect.sizeId ? collect.sizeId : 'FS', barcode: collect.barcode })
              }
            })
            for (const [key, value] of Object.entries(testing)) {
              if (value.colorLink === '') {
                value.colorLink = 'missing'
              }
            }
          }

        }
        preData.subCategoryByID[key][i].attributes = testing
      }
    }
    return preData.subCategoryByID
  } catch (err) {
    throw err
  }
}

  const data = await addMoreInfomation(absolutePath, 'doNam')


// const writeFullData = async (path, name) => {
//   try {
//     const jsonData = JSON.stringify(data)
//     await fs.writeFile(`${path}/${name}.json`, jsonData)
//   } catch (error) {
//     throw error
//   }
// }

// writeFullData(absolutePath, 'doNamFull2')
