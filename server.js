const express = require('express')
const bodyParser = require("body-parser");
const formidable = require('express-formidable');
const multer = require('multer')
const cors = require('cors');
const fs = require("fs");
const path = require('path');
const { default: axios } = require('axios');
const app = express();
const port = 3000;
app.use(cors());

const jsonImageDataName = "imageData.json"
const baseDirJsonData = "resourses/";
const baseDirImage = "uploads/";
const imgaeDataPath = path.join(__dirname, baseDirJsonData + jsonImageDataName);

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        var baseDir = baseDirImage;
        if (file.mimetype === "application/json") {
            baseDir = baseDirJsonData;
        }
        cb(null, baseDir);
    },
    filename: (req, file, cb) => {
        var fileName = Date.now() + "-" + file.originalname;
        if (file.mimetype === "application/json") {
            fileName = "tmp-" + jsonImageDataName;
        }
        file.originalname = fileName;
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/json" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


function checkJsonData(json) {
    if (json.galleryImages != undefined && json.galleryImages.constructor === Array) {
        return true
    }
    return false;
}


app.options('*', cors());

app.post("/upload/", multer({ storage: storageConfig, fileFilter: fileFilter }).single("file"), async function(req, res) {
    var status = { status: "OK" }
    if (req.file) {
        if (req.file.mimetype != "application/json") {
            var imageData = JSON.parse(fs.readFileSync(imgaeDataPath, "utf8"));
            var imagePath = baseDirImage + req.file.originalname;
            if (imageData.galleryImages.find(item => { return item.url == req.file.originalname }) == undefined) {
                imageData.galleryImages.push({ "url": imagePath });
                fs.writeFile(imgaeDataPath, JSON.stringify(imageData), () => {});
                status.imagePath = imagePath;
                status.code = 100;
            }
        } else {
            var tmpJson = path.join(__dirname, baseDirJsonData + "tmp-" + jsonImageDataName);
            var json = JSON.parse(fs.readFileSync(tmpJson, "utf8"));

            if (checkJsonData(json)) {
                fs.writeFile(imgaeDataPath, JSON.stringify(json), () => {});
                status.code = 101;
                status.json = json;
            } else {
                res.status(400);
                status.status = "error";
                status.message = "json has an invalid format";
            }
            fs.unlink(tmpJson, (err) => {});
        }
    } else if (req.body.url) {
        try {
            var url = req.body.url;
            var { data } = await axios.get(url);
            if (checkJsonData(data)) {
                fs.writeFile(imgaeDataPath, JSON.stringify(data), () => {});
                status.code = 101;
                status.json = data;
            } else {
                res.status(400);
                status.status = "error";
                status.message = "json has an invalid format";
            }
        } catch (e) {
            res.status(400);
            status.status = "error";
        }
    }
    res.json(status);
})

app.get("/images/", function(req, res) {
    var json = JSON.parse(fs.readFileSync(path.join(__dirname, baseDirJsonData + jsonImageDataName), "utf8"));

    var resultJson = { galleryImages: [] }

    json.galleryImages.forEach(item => {
        if (item.url.indexOf("://") != -1) {
            resultJson.galleryImages.push(item);
        } else {
            try {
                fs.statSync(path.join(__dirname, item.url))
                resultJson.galleryImages.push(item);
            } catch (err) {}
        }
    })
    res.json(resultJson);
})

app.post("/delete/:id/", function(req, res) {
    var imgaeDataPath = path.join(__dirname, baseDirJsonData + jsonImageDataName);
    var imageData = JSON.parse(fs.readFileSync(imgaeDataPath, "utf8"));
    var imagePath = path.join(__dirname, imageData.galleryImages[req.params.id].url);
    fs.unlink(imagePath, (err) => {});
    imageData.galleryImages.splice(req.params.id, 1)
    fs.writeFile(imgaeDataPath, JSON.stringify(imageData), () => {});
    res.end("OK")
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})