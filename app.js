'use strict'

if(!process.env.token){
    console.log(`tokenがありません。$ token=<自分のgyazoトークン> node app.js という形で実行してください。`);
    return;
}

const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;
const Gyazo  = require('gyazo-api');
const client = new Gyazo(process.env.token);
let changeCount = 0;

const watcher = chokidar.watch('./', {ignored:/[\/\\]\./,persistent:true});
watcher.on('ready',() => {
    console.log("ready watching...");
    watcher.on('add',addAction);
    watcher.on('change',changeAction);
});

//ファイル追加時のアクション
function addAction(filepath){
    //拡張子取得
    console.log(filepath + " added.");
    let extname = path.extname(filepath);
    
    //png以外を排除
    if(extname !== '.png') return;
    console.log('pngなので処理続行');
    
    //リネーム
    let newFileName = 'image.png';
    fs.renameSync(filepath, newFileName);

    //プレビューを開く
    execSync(`open ./${newFileName}`);
}

//ファイル更新時のアクション
function changeAction(filepath){
    //ファイル更新の1回目は省く
    changeCount++;
    if(changeCount <= 1)return;
    console.log(filepath + " changed.");

    //gyazoへアップロード
    gyazo(filepath);
    changeCount = 0;
}

function gyazo(filepath){
    console.log('gyazoにアップロード開始します。');
    // closeWindow();
    client.upload(filepath, {
        title: "my screenshot",
        desc: "upload from nodejs"
    })
    .then((res) => {
        console.log(res.data.image_id);
        console.log(res.data.permalink_url);
        fs.unlinkSync(filepath);
        execSync(`open ${res.data.permalink_url}`);
    })
    .catch((err) => {
        console.error(err);
    });
}