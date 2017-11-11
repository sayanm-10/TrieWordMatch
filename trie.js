let use_company_trie = true;
/*
    Node class to represent in Trie data structure
*/
class Node {
    constructor () {
        this.keys = new Map();
        this.occurrence = 0;
        this.end = false;
    }

    setEnd () {
        this.occurrence++;
        this.end = true;
    };

    isEnd () {
        return this.end;
    };
};

/*
    Trie data structure for text
*/
class Trie {

    constructor () {
        this.root = new Node();
    }

	Add (input, node) {
        node = node || this.root;
		if (input.length == 0) {
			node.setEnd();
		} else if (!node.keys.has(input[0])) {
			node.keys.set(input[0], new Node());
			return this.Add(input.substr(1), node.keys.get(input[0]));
		} else {
			return this.Add(input.substr(1), node.keys.get(input[0]));
		};
	};

	FindWord (word) {
			let node = this.root;
			while (word.length > 1) {
				if (!node.keys.has(word[0])) {
					return false;
				} else {
					node = node.keys.get(word[0]);
					word = word.substr(1);
				};
			};
					// if the last node matches and it is the end of the trie
	    return (node.keys.has(word) && node.keys.get(word).isEnd()) ? node.keys.get(word).occurrence : 0;
	};

	SearchString(string){
		let node = this.root;
    let match_string = '';
		while (node.keys.has(string[0])) {
			console.log(node.keys.get(string[0]));
      match_string = match_string + string[0];
			if (node.keys.get(string[0]).isEnd()){
				string = string.substr(1);
				break;
			} else {
				node = node.keys.get(string[0]);
				string = string.substr(1);
			};
		};
		return match_string;
	};
  
	Print () {
		let words = new Array();
		let search = function (node, string) {
			if (node.keys.size != 0) {
				for (let letter of node.keys.keys()) {
					search(node.keys.get(letter), string.concat(letter));
				};
				if (node.isEnd()) {
					words.push(string);
				};
			} else {
				string.length > 0 ? words.push(string) : undefined;
				return;
			};
		};
		search(this.root, new String());
		return words.length > 0 ? words : 0;
	};
};

global.Trie = Trie;
