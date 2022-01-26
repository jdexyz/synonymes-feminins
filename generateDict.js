const _ = require("lodash");
const fs = require("fs");
const csvParse = require("csv-parse/sync");

console.log("loading dict");

const dict = fs.readFileSync("./dict.tsv", { encoding: "utf8" });

console.log("parsing dict tsv");

const decodedDict = csvParse.parse(dict, {
  columns: true,
  skip_empty_lines: true,
  delimiter: "\t",
});

console.log("objectifying dict");

let completeDictAsObject = {};
for (let word of decodedDict) {
  completeDictAsObject[word.Flexion] = {
    fem: !!word["Étiquettes"].match(/fem/),
    nom: !!word["Étiquettes"].match(/nom/),
    epi: !!word["Étiquettes"].match(/epi/),
    freq: parseFloat(word["Fréquence"]),
  };
}
// console.log(completeDictAsObject);

const syn = fs.readFileSync("./syn.txt", { encoding: "utf8" });

let lines = syn.split("\n");

for (let i = 0; i < lines.length; i += 2) {
  let word = lines[i].match(/^([^\()]+)\|/);
  if (!word) {
    // console.log(i, lines[i]);
    i = i + 1;
  } else {
    word = word[1];
    let synonyms = lines[i + 1].split(/\|/g);
    if (synonyms) {
      synonyms = synonyms.slice(1);
      if (completeDictAsObject[word]) {
        let filteredSynonyms = synonyms.filter((synonym) => {
          let attributes = completeDictAsObject[synonym];
          if (attributes) {
            return attributes.nom && (attributes.fem || attributes.epi);
          } else {
            return false;
          }
        });
        completeDictAsObject[word].syn = _.sortBy(
          filteredSynonyms,
          (syn) => -completeDictAsObject[syn].freq
        );
      }
      //   console.log(word, synonyms);
    }
  }
}

// console.log(completeDictAsObject);

fs.writeFileSync("syn_gen.json", JSON.stringify(completeDictAsObject));
