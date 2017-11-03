let fs = require("file-system");
let reader = require("read-file");
let readline_sync = require("readline-sync");
let readline = require("linebyline");
const DEFAULT_ARTICLE_FILE = "article.dat", DEFAULT_COMPANY_FILE = "company.dat";

// method to bootstrap the app
let init = function () {
    getSearchText();
    getCompanyNames();
};

let getSearchText = function () {
    let newsArticleFile = readline_sync.question("\nEnter news article file path and name: ");
    newsArticleFile = newsArticleFile || DEFAULT_ARTICLE_FILE;

    let readStream = reader.sync(newsArticleFile, "utf-8");
    // get rid of speacial characters while preserving whitespace
    let articleText = readStream.trim().replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ');
    preprocessArticleText(articleText); // TODO: process in trie
};

let getCompanyNames = function () {
    let companyFile = readline_sync.question("\nEnter company file path and name: ");
    companyFile = companyFile || DEFAULT_COMPANY_FILE;

    let readStream = reader.sync(companyFile, "utf-8");
    readStream.on('line', function (line, lineCount, byteCount) {
        let companyNames = line.split("\t");
        searchForOccurrence(companyNames); // TODO: walk the trie to find occurrences
    });
};

let preprocessArticleText = function (text) {
    // TODO: create trie with words in this string
};

let searchForOccurrence = function (companyNames) {
    let hitCount = 0;
    for (company in companyNames) {
        // find occurrence in trie and increment counter
    }

    printResult(companyNames[0], hitCount);
};

let printResult = function(company, hitCount) {
    // TODO: for this company print hit count
};

init();