'use strict';
const fs = require('fs');   //ファイルを扱うためのモジュール
const readline = require('readline');   // ファイルを一行ずつ読み込むためのモジュール
const rs = fs.createReadStream('./popu-pref.csv');  // ファイルから読み込みを行うStreamを生成する
const rl = readline.createInterface({'input':rs, 'output':{}}); // 
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
rl.on('line', (lineString) => {     // 'line'というイベントが発生したらこの無名関数を呼ぶ
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu10to14 = parseInt(columns[2]);    // 10-14歳の人口
    const pupu15to19 = parseInt(columns[3]);    // 15-19歳の人口
    if(year === 2010 || 2015){
        let value = prefectureDataMap.get(prefecture);
        if(!value){ 
            // もしこの県の処理が初めてであればオブジェクトを作る
            value = {
                popu10to14Of2010: 0,    // 2010年の10-14歳の人口
                popu15to19Of2010: 0,    // 2010年の15-19歳の人口
                popu10To14Of2015: 0,    // 2015年の10-14歳の人口
                popu15To19Of2015: 0,    // 2015年の15-19歳の人口
                changeOf10To14: null,   // 10-14歳の人口増加率
                changeOf15To19: null    // 15-19歳の人口増加率
            };
        }
        if(year === 2010){
            value.popu10To14Of2010 = popu10to14;
            value.popu15To19Of2010 = pupu15to19;
        }
        if(year === 2015){
            value.popu10To14Of2015 = popu10to14;
            value.popu15To19Of2015 = pupu15to19;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
rl.on('close', () => {
    // 変化率を計算
    for(let [key, value] of prefectureDataMap){
        value.changeOf10To14 = value.popu10To14Of2015 / value.popu10To14Of2010;
        value.changeOf15To19 = value.popu15To19Of2015 / value.popu15To19Of2010;
    }
    // 10 ~ 14歳のランキング
    // sort関数を使うために配列に変換する
    const rankingArray10to14 = Array.from(prefectureDataMap).sort((a, b) =>{
        return b[1].changeOf10To14 - a[1].changeOf10To14;
    });
    console.log("10-14歳の増加率ランキング");
    const rankingStrings10to14 = rankingArray10to14.map(([key,value]) => {
        return key + ': ' + value.popu10To14Of2010 + '=>' + value.popu10To14Of2015 + ' 変化率:' + value.changeOf10To14; 
    });
    console.log(rankingStrings10to14);

    // 15-19歳のランキング
    const rankingArray15to19 = Array.from(prefectureDataMap).sort((a,b) => {
        return b[1].changeOf15To19 - a[1].changeOf15To19;
    });
    console.log("15-19歳の増加率ランキング");
    const rankingStrings15to19 = rankingArray15to19.map(([key, value]) => {
        return key + ': ' + value.popu15To19Of2010 + '=>' + value.popu15To19Of2015 + ' 変化率:' + value.changeOf15To19;
    });
    console.log(rankingStrings15to19);
})
