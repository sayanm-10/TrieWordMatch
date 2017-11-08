require('./trie.js');
let fs = require("file-system");
let reader = require("read-file");
let readline_sync = require("readline-sync");
let readline = require("linebyline");
const DEFAULT_ARTICLE_FILE = "article.dat", DEFAULT_COMPANY_FILE = "company.dat";
let textTrie = new Trie;
let total_hit_count = 0, total_relevance = 0, total_word_count = 0, news_article;

let debug = true;

// method to bootstrap the app
let init = function () {
    getSearchText();
    getCompanyNames();
};

let getSearchText = function () {
    news_article = '';
    console.log("\nEnter news article:");
    readline_sync.promptLoop(function (input) {
        news_article = news_article + " " + input;
        return input === "."; // exit criteria from std i/p
    });

    if (debug) {
        console.log("\nNEWS: \n" + news_article);
    }

    if (news_article.length > 2) {
        // get rid of speacial characters while preserving single whitespace b/w words
        news_article = news_article.trim().replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ');
        preprocessArticleText(news_article);
    } else {
        getSearchText();
    }
};

let getCompanyNames = function () {
    let companyFile = readline_sync.question("\nEnter company file path and name: ");

    let readStream = readline(companyFile).on("error", function () {
        console.log("\nFile " + companyFile + " not found!");
        getCompanyNames(); // keep calling itsellf till user inputs a valid file
        return;
    });

    printResultHeader();
    readStream.on('line', function (line, lineCount, byteCount) {
        let companyNames = line.split("\t");
        searchForOccurrence(companyNames);
    }).on("end", function () {
        printTotalCount();
    });
    
};

let preprocessArticleText = function (text) {
    let ignoreWordsCount = 0;
    let words = text.split(" ");
    let regexMatch = text.match(/\b(a|an|the|and|or|but)\b/gi);

    if (regexMatch) {
        ignoreWordsCount = regexMatch.length;
    }
    total_word_count = words.length - ignoreWordsCount;

    // create a trie for these words
    for (let word of words) {
        textTrie.Add(word);
    }
    //console.log(textTrie.Print());
};

let searchForOccurrence = function (companyNames) {
    let hitCount = 0;
    for (let i = 0; i < companyNames.length; i++) {
        // normalize company name by removing special characters
        let normalizedCompanyName = companyNames[i].replace(/(?!\w|\s)./g, '');
        // find occurrence of company in trie and increment counter
        hitCount += textTrie.FindWord(normalizedCompanyName);
    }

    total_hit_count += hitCount;
    printResult(companyNames[0], hitCount);
};

let printResult = function(company, hitCount) {
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