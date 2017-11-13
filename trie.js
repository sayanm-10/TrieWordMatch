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

	SearchString(string) {
		let node = this.root;
		let match_string = '';
		let match_found = false;
		while (node.keys.has(string[0])) {
			match_string = match_string + string[0];
			if (node.keys.get(string[0]).isEnd()) {
				string = string.substr(1);
				match_found = true;
				break;
			} else {
				node = node.keys.get(string[0]);
				string = string.substr(1);
			};
		};
		return match_found ? match_string : '';
	};
};

global.Trie = Trie;
