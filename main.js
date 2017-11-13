require('./trie.js');
let fs = require("file-system");
let reader = require("read-file");
let readline_sync = require("readline-sync");
let readline = require("linebyline");
const DEFAULT_ARTICLE_FILE = "article.dat", DEFAULT_COMPANY_FILE = "company.dat";
let textTrie = new Trie;
let companyTrie = new Trie;
let total_hit_count = 0, total_relevance = 0, total_word_count = 0;
let articleText = '';
let companyMap = {};
let companyHits = {};

/*
    PadEnd POLYFILL

 https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
*/
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
}


/*
    PadStart POLYFILL

    https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
*/
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

// method to bootstrap the app
let init = function () {
    getCompanyNames();
};

let getSearchText = function () {
    let newsArticleFile = readline_sync.question("\nEnter news article file path and name: ");
    let readStream;
    // TODO: Add functionality to read from standard input
    try {
        readStream = reader.sync(newsArticleFile, "utf-8");
    }
    catch (error) {
        console.log("\nFile " + newsArticleFile + " not found! Reading from " + DEFAULT_ARTICLE_FILE + "\n");
        readStream = reader.sync(DEFAULT_ARTICLE_FILE, "utf-8");
    }
    finally {
        // get rid of speacial characters while preserving whitespace
        articleText = readStream.trim().replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ');
        processArticleText(articleText); // TODO: process in trie
    }
};

let getCompanyNames = function () {
    let companyFile = readline_sync.question("\nEnter company file path and name: ");
    let readStream = readline(companyFile).on("error", function () {
        console.log("\nFile " + companyFile + " not found!");
        getCompanyNames(); // keep calling recursively till user inputs a valid file
        return;
    });
    
    readStream.on('line', function (line, lineCount, byteCount) {
        let companyNames = line.split("\t");
        let companySynonym = ''
        companyHits[companyNames[0]] = 0;
        for (let i = 0; i < companyNames.length; i++) {
            // Trim and strip company names of special characters
            companySynonym = companyNames[i].trim().replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ');
            companyMap[companySynonym] = companyNames[0];
            textTrie.Add(companySynonym);
        }
    }).on('end', function() {
        getSearchText();
    });
};

let preprocessArticleText = function (text) {
    let words = text.split(" ");
    total_word_count = words.length;
    for (let word of words) {
        textTrie.Add(word);
    }
};

let searchForOccurrence = function (companyNames) {
    let hitCount = 0;
    for (let i = 0; i < companyNames.length; i++) {
        // find occurrence in trie and increment counter
        hitCount += textTrie.FindWord(companyNames[i]);
    }

    total_hit_count += hitCount;
    printResult(companyNames[0], hitCount);
};

let processArticleText = function (companyNames) {
    let result = '';
    let nextWord ='', nextSpace = 0;
    while(articleText.length > 0) {
      // find occurrence in trie and increment counter
      nextSpace = articleText.trim().indexOf(' ');
      nextWord = articleText.substring(0, nextSpace > 0 ? nextSpace : articleText.length);
      result = textTrie.SearchString(articleText);
        if (result.length > 0 && articleText[result.length] == ' '){
            total_hit_count++;
            companyHits[companyMap[result]]++;
            nextWord = result;
        }
        switch (nextWord) {
        case 'a':
        case 'an':
        case 'and':
        case 'but':
        case 'or':
        case 'the':
          break;
        default:
          total_word_count++;
          break;
      }
      articleText = articleText.substring(nextWord.length + 1);
    }
    printResults();
};

let printResults = function(){
  // get the length of the longest string for the first column
  let companyWidth = Object.keys(companyHits).reduce(function (a, b) { 
                    return a.length > b.length ? a : b; 
                }).length;
  companyWidth = companyWidth > 7 ? companyWidth : 7;
  // get the length of the longest string for the second column
  let hitCountWidth = String(total_word_count).length > 11 ? String(total_word_count).length : 11;
  let tableWidth = companyWidth + hitCountWidth + 11;
  printResultHeader(companyWidth, hitCountWidth, tableWidth);

  for (company in companyHits) {
    printResult(company, companyHits[company], companyWidth, hitCountWidth);
  }
  printTotalCount(companyWidth, hitCountWidth, tableWidth);

}
let printResult = function(company, hitCount, col1Width = 15, col2Width = 10) {
    let relevance = hitCount / total_word_count;
    console.log(company.padEnd(col1Width) + String(hitCount).padStart(col2Width)  + relevance.toFixed(4).padStart(10) + "%");
};

let printResultHeader = function (col1Width = 15, col2Width = 10, totalWidth = 35) {
    console.log("\n\n" + "Company".padEnd(col1Width) + "Hit Count".padStart(col2Width)  + "  Relevance");
    console.log('-'.repeat(totalWidth));
};

let printTotalCount = function (col1Width = 15, col2Width = 10, totalWidth = 35) {
    let total_relevance = total_hit_count / total_word_count;
    console.log('-'.repeat(totalWidth));
    console.log("Total".padEnd(col1Width) + String(total_hit_count).padStart(col2Width)  + total_relevance.toFixed(4).padStart(10) + "%");
    console.log('-'.repeat(totalWidth));

    let totalWordsLength = 18 + String(total_word_count).length;
    let endPadding = totalWordsLength + (totalWidth - totalWordsLength) / 2;
    console.log(`Total Words      ${total_word_count}`
        .padEnd(endPadding).padStart(totalWidth));
};

init();
