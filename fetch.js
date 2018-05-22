const fetchImage = require('./fetch-image');
const sites = require('./fetch-sites');

// 开始执行
(async () => {
    let site = process.argv.length > 2 ? process.argv[2] : '';
    let fromTo = process.argv.slice(3).map(n => parseInt(n)).filter(n => !isNaN(n)); // 从命令行参数获取from to
    if (!site) {
        return console.log("usage node fetch site");
    } else if (!sites[site]) {
        return console.log(`site ${site} is not set, avaliable sites: [${Object.keys(sites)}]`);
    }
    let conf = sites[site]; // 获取配置
    if (fromTo.length) {
        conf.from = fromTo[0]; // 设置起始页
    }
    if (fromTo.length > 1) {
        conf.to = fromTo[1]; // 设置终止页
    }
    RegExp.prototype.toJSON = RegExp.prototype.toString; // or function () { return this.source; }; 
    console.log("\nsite: %s, from: %s, to: %s\n", site, conf.from, JSON.stringify(conf.to));
    await fetchImage(conf);
})();

// 依赖：npm install -g node-fetch cheerio
// 使用方法：node fetch site 或  node fetch site 1 或 node fetch site 1 5 （起始页、终止页可不指定）