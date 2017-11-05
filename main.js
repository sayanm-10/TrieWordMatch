require('./trie.js');
let fs = require("file-system");
let reader = require("read-file");
let readline_sync = require("readline-sync");
let readline = require("linebyline");
const DEFAULT_ARTICLE_FILE = "article.dat", DEFAULT_COMPANY_FILE = "company.dat";
let textTrie = new Trie;
let total_hit_count = 0, total_relevance = 0, total_word_count = 0;

// method to bootstrap the app
let init = function () {
    getSearchText();
    getCompanyNames();
};

let getSearchText = function () {
    let newsArticleFile = readline_sync.question("\nEnter news article file path and name: ");
    let readStream;

    try {
        readStream = reader.sync(newsArticleFile, "utf-8");
    }
    catch (error) {
        console.log("\nFile " + newsArticleFile + " not found! Reading from " + DEFAULT_ARTICLE_FILE + "\n");
        readStream = reader.sync(DEFAULT_ARTICLE_FILE, "utf-8");
    }
    finally {
        // get rid of speacial characters while preserving whitespace
        let articleText = readStream.trim().replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ');
        //console.log(articleText);
        preprocessArticleText(articleText); // TODO: process in trie
    }
};

let getCompanyNames = function () {
    let companyFile = readline_sync.question("\nEnter company file path and name: ");

    let readStream = readline(companyFile).on("error", function () {
        console.log("\nFile " + companyFile + " not found! Reading from " + DEFAULT_COMPANY_FILE + "\n");
        readStream = readline(DEFAULT_COMPANY_FILE);
    });

    printResultHeader();
    readStream.on('line', function (line, lineCount, byteCount) {
        let companyNames = line.split("\t");
        searchForOccurrence(companyNames); // TODO: walk the trie to find occurrences
    });
    //printTotalCount();
};

let preprocessArticleText = function (text) {
    // TODO: create trie with words in this string
    let words = text.split(" ");
    total_word_count = words.length;

    for (let word of words) {
        textTrie.Add(word);
    }
    //console.log(textTrie.Print());
};

let searchForOccurrence = function (companyNames) {
    let hitCount = 0;
    for (let i = 0; i < companyNames.length; i++) {
        // find occurrence in trie and increment counter
        //console.log(companyNames[i] + "||");
        hitCount += textTrie.FindWord(companyNames[i]);
    }

    total_hit_count += hitCount;
    printResult(companyNames[0], hitCount);
};

let printResult = function(company, hitCount) {
    // TODO: for this company print hit count
    let relevance = hitCount / total_word_count;
    console.log("\n" + company + "\t\t" + hitCount + "\t\t" + relevance.toFixed(4) + "%");
};

let printResultHeader = function () {
    console.log("\n\n" + "Company" + "\t\t" + "Hit Count" + "\t\t" + "Relevance");
};

let printTotalCount = function () {
    let total_relevance = total_hit_count / total_word_count;
    console.log("\n" + "Total" + "\t\t" + total_hit_count + "\t\t" + total_relevance.toFixed(4) + "%");
    console.log("Total Words" + "\t\t" + total_word_count);
};

init();