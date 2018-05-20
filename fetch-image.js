require('http').globalAgent.maxSockets = Infinity;
require('https').globalAgent.maxSockets = Infinity;

const util = require('util');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const options = {
    timeout: 30 * 1000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1 Safari/605.1.15'
    }
};

/**
 * almost, 替换all，忽略执行失败的promise, 来源: https://gist.github.com/nhagen/a1d36b39977822c224b8
 * @param r promise数组 
 */
Promise.almost = r => Promise.all(r.map(p => p.catch ? p.catch(e => e instanceof Error ? e : new Error(e)) : p));

/**
 * 判断文件是否存在
 * @param f 文件路径
 */
let fle = f => new Promise((r, j) => fs.stat(f, (e, s) => e ? j() : r(f)));

/**
 * 日志
 * @param args 
 */
let log = (...args) => console.log("[" + (new Date()).toLocaleString() + "] " + args[0], ...args.slice(1));

/**
 * 异步抓取函数，source, saveto 为函数。
 * @param {url, from, to, query, source, saveto} url: 带有%s的网址, from: 起始页, to 结束页数或{query: 选择器, match: 提取正则}。
 * query: 图片选择器, source: 图片网址处理函数（获取缩略图对应的大图）,若网址为原图：source = s => s, saveto: 网址转换成保存的图片路径函数
 */
async function fetchImage({
    url,
    from,
    to,
    query,
    source,
    saveto
}) {
    let page = from;
    let getTo = ($, {
        find,
        match
    }) => Math.max(...$(find).map((_, e) => parseInt(($(e).text().match(match) || ['']).slice(-1)[0])).get().filter(e => !isNaN(e)));
    do {
        let uri = util.format(url, page);
        let start = Date.now();
        log("URL: %s", uri);
        try {
            let html = await (await fetch(uri, options)).text();
            let $ = cheerio.load(html);
            if (typeof to === 'object') {
                log("End: %d", to = getTo($, to)); // 获取最后一页
            }
            let imgs = $(query).map((_, m) => source($(m).attr('src'))).get();
            log("URL: %s [%d] %fs", uri, imgs.length, (Date.now() - start) / 1e3);
            let exists = await Promise.almost(imgs.map(u => fle(saveto(u)))); // 获取所有已经存在的图片
            start = Date.now();
            let dones = await Promise.almost(imgs.map(u => {
                let f = saveto(u);
                return exists.includes(f) ? Promise.resolve(f) : fetch(u, options).then(rs => {
                    return rs.status === 200 ? new Promise((res, rej) => {
                        rs.body.pipe(fs.createWriteStream(f).on('error', err => rej(err)).on('finish', () => res(u)));
                    }) : Promise.reject("response status " + rs.status);
                });
            }));
            let fails = dones.filter(e => e instanceof Error);
            log("URL: %s [%d/%d] %fs", uri, imgs.length - fails.length, imgs.length, (Date.now() - start) / 1e3);
            if (fails.length) {
                fails.forEach((e, j) => log("Page: %s, %s Error: %s", page, imgs[j], e.message));
            }
        } catch (e) {
            log("URL: %s Error: %s", uri, e.message);
        }
    } while (page++ < to);
}
module.exports = fetchImage;