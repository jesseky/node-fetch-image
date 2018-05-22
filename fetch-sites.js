module.exports = {
    qbyhx: {
        url: "https://qingbuyaohaixiu.com/page/%s", // 带有%s或%d来生成每一页网址
        from: 1,
        to: {
            find: '.page-numbers',
            match: /\d+/
        }, // 传递一个 {find, match} 对象，用来自动获取最后一页
        query: '.wp-post-image',
        source: s => s.replace(/-\d+x\d+/, ''), // source 为 提取原图函数
        saveto: u => `../../data/qbyhx/${u.match(/[^\/]*$/)[0]}` // saveto 为 网址转换成图片路径
    },
    dbmn: {
        url: "https://www.dbmeinv.com/?pager_offset=%s",
        from: 1,
        to: 4452, // 不能取得最后一页
        query: '.height_min',
        source: s => s.replace(/\/bmiddle\//, '/large/'),
        saveto: u => `../../data/dbmn/${u.match(/[^\/]*$/)[0]}`
    }
};