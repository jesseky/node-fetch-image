const fetchImage = require('./fetch-image');

(async () => {
    let site = process.argv.length > 2 ? process.argv[2] : '';
    let fromTo = process.argv.slice(3).map(n => parseInt(n)).filter(n => !isNaN(n)); // 从命令行参数获取from to
    let sites = {
        qbyhx: {
            url: "https://qingbuyaohaixiu.com/page/%s", // 带有%s或%d来生成每一页网址
            from: fromTo.length > 0 ? fromTo[0] : 1,
            to: fromTo.length > 1 ? fromTo[1] : {
                find: '.page-numbers',
                match: /\d+/
            }, // 传递一个 {find, match} 对象，则自动获取最后一页
            query: '.wp-post-image',
            source: s => s.replace(/-\d+x\d+/, ''), // source 为 提取原图函数
            saveto: f => `../../data/qbyhx/${f.match(/[^\/]*$/)[0]}` // saveto 为 网址转换成图片路径
        }
    };
    if (!site) {
        return console.log("usage node fetch site");
    } else if (!sites[site]) {
        return console.log(`site ${site} is not set, avaliable sites: [${Object.keys(sites)}]`);
    }
    await fetchImage(sites[site]);
})();

// 依赖：npm install -g node-fetch cheerio
// 使用方法：node fetch site 或  node fetch site 1 或 node fetch site 1 5 （起始页、终止页可不指定）