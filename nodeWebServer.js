const express = require("express");

const app = express();

const vFrontDir = "scm_front";
const vSpliter = "/";
const vPageExtension = ".html";

app.use(express.static("scm_front"));

app.get("/:page", (req, res) => {
    if (req.params.page.indexOf("favicon.ico") > -1)
        res.sendFile(__dirname + vSpliter + vFrontDir + vSpliter + "img" + vSpliter + "btn_back.png");
    else
        res.sendFile(__dirname + vSpliter + vFrontDir + vSpliter + req.params.page + vPageExtension);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + vSpliter + vFrontDir + vSpliter + "main" + vPageExtension);
});

app.listen(3000, () => { });