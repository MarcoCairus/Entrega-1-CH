import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";

/*
-------------------------------
CONFIGURACION MULTER
-------------------------------
*/

const __fileName = fileURLToPath(import.meta.url)
const __dirname = dirname(__fileName)


export default __dirname


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/public/img')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
})


export const uploader = multer({ storage })

/*
-------------------------------
VALIDACION 'STATUS' = 'BOOLEAN'
-------------------------------
*/

export const validateBoolean = (value) => {
    if (typeof value == "boolean") return value

    if (typeof value == "string") {
        if (value == "false") return false
        if (value == "true") return true

        return null
    }
    return null

}

/*
-------------------------------
VALIDACIONES MIDDLEWARE
-------------------------------
*/

export const verification = (req, res, next) => {

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const finalPrice = parseFloat(price);
    const finalStatus = validateBoolean(status);
    const finalStock = parseInt(stock);

    

    if (typeof title != "string" || typeof description != "string" || typeof code != "string" || Number.isNaN(finalPrice) || typeof finalStatus != "boolean" || Number.isNaN(finalStock) || typeof category != "string") {
        return res.status(400).send('Faltan productos o producto con valor inadecuado')
    }    

    req.body.stock = finalStock;
    req.body.price = finalPrice;
    req.body.status = finalStatus;
    req.body.thumbnails = thumbnails;

    next();

}


