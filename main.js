require('./trie.js');
let fs = require("file-system");
let reader = require("read-file");
let readline_sync = require("readline-sync");
let readline = require("linebyline");
const DEFAULT_ARTICLE_FILE = "article.dat", DEFAULT_COMPANY_FILE = "company.dat";
let textTrie = new Trie;
let companyTrie = new Trie;
let use_company_trie = true;
let total_hit_count = 0, total_relevance = 0, total_word_count = 0;
let articleText = '';
let companyMap = {};
let companyHits = {};
// method to bootstrap the app
let init = function () {
  if (use_company_trie){
    getCompanyNames();
    //getSearchText();
  }else{
    getSearchText();
    getCompanyNames();
  }

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
        //console.log(articleText);
        if (use_company_trie){
           processArticleText(articleText); // TODO: process in trie
        }else{
           preprocessArticleText(articleText); // TODO: process in trie
        }
    }
};

let getCompanyNames = function () {
    let companyFile = readline_sync.question("\nEnter company file path and name: ");

    let readStream = readline(companyFile).on("error", function () {
        console.log("\nFile " + companyFile + " not found! Reading from " + DEFAULT_COMPANY_FILE + "\n");
        readStream = readline(DEFAULT_COMPANY_FILE);
    });
    if (use_company_trie){
      readStream.on('line', function (line, lineCount, byteCount) {
          let companyNames = line.split("\t");
          let companySynonym = ''
          companyHits[companyNames[0]]=0;
          for (let i = 0; i<companyNames.length; i++){
            // Trim and strip company names of special characters
            companySynonym = companyNames[i].trim().replace(/(?!\w|\s)./g, '').replace(/\s+/g, ' ')
            companyMap[companySynonym]=companyNames[0];
            textTrie.Add(companySynonym);
          }
      }).on('end', function() {
        console.log('Companies added to Trie:');
        console.log(textTrie.Print());
        getSearchText();
      });
    }else{
      printResultHeader();
      readStream.on('line', function (line, lineCount, byteCount) {
          let companyNames = line.split("\t");
          searchForOccurrence(companyNames); // TODO: walk the trie to find occurrences
      });
    }

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

let processArticleText = function (companyNames) {
    let result = '';
    for (let i = 0; i < articleText.length; i++) {
        // find occurrence in trie and increment counter
        //console.log(companyNames[i] + "||");
        if (articleText[i]==' '){
          //TODO You should ignore the following words in the article
          //(but not the company name) when considering relevance: a, an, the, and, or, but
            total_word_count++;
        }else{
            result = textTrie.SearchString(articleText.substring(i));
            if (result.length>0 && articleText[i+result.length] ==' '){
                total_hit_count++;
                companyHits[companyMap[result]]++;
                i= i+result.length-1;
            }
        }
    }
    printResults();
};

let printResults = function(){
  printResultHeader();
  for (company in companyHits){
    printResult(company,companyHits[company]);
  }
  printTotalCount();

}
let printResult = function(company, hitCount) {
    // TODO: for this company print hit count
    let relevance = hitCount / total_word_count;
    console.log("\n" + company + "\t\t" + hitCount + "\t\t" + relevance.toFixed(4) + "%");
};

let printResultHeader = function () {
    console.log("\n\n" + "Company" + "\t\t\t" + "Hit Count" + "\t\t" + "Relevance");
};

let printTotalCount = function () {
    let total_relevance = total_hit_count / total_word_count;
    console.log("\n" + "Total" + "\t\t" + total_hit_count + "\t\t" + total_relevance.toFixed(4) + "%");
    console.log("Total Words" + "\t\t" + total_word_count);
};

init();
