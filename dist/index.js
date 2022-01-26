// As quick and dirty as can be
async function main() {
  const button = document.querySelector(".btn");
  button.innerHTML = "Chargement...";
  const mainText = document.getElementById("textarea").value;
  console.log(mainText);
  let synGenDict = await (await fetch("./synonymesFeminins.json")).json();
  let template = mainText.replace(/[A-zÀ-ú]+/g, function (word) {
    if (
      synGenDict[word] &&
      !(synGenDict[word].fem || synGenDict[word].epi) &&
      synGenDict[word].nom &&
      synGenDict[word].syn &&
      synGenDict[word].syn.length > 0
    ) {
      return `<suggestion options="${synGenDict[word].syn
        .concat([word])
        .join("|")}" default="${word}"></suggestion>`;
    } else {
      return word;
    }
  });
  template = template.replace(/\n/g, "<br>");
  let suggestion = Vue.component("suggestion", {
    template: `<tippy class="tippy" arrow :interactive="true" placement="bottom">
        <template v-slot:trigger>
            <i>{{text}}</i>
        </template>
    
        <div class="suggestions">
            <div @click="text=option" v-for="(option, index) in parsedOptions" :key="index">{{option}}</div>
        </div>
    </tippy>`,
    data() {
      return {
        text: "",
      };
    },
    props: {
      options: {
        type: String,
        required: true,
      },
      default: {
        type: String,
        required: true,
      },
    },
    mounted() {
      this.text = this.default;
    },
    computed: {
      parsedOptions() {
        return this.options.split(/\|/);
      },
    },
    methods: {},
  });

  // document.getElementById("main").innerHTML = output;
  let app = new Vue({
    el: "#main",
    components: { suggestion },
    data: {},
    template: "<div id='main'><h1>Texte transformé</h1>" + template + "</div>",
    mounted() {
      button.innerHTML = "Transformer";
    },
  });
}
