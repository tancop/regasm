window.onload = function () {
  document.querySelectorAll("textarea").forEach(function (textarea) {
    textarea.style.height = textarea.scrollHeight + "px";
    textarea.style.overflowY = "hidden";

    textarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  });

  /** @type HTMLTextAreaElement */
  let inputArea = document.getElementById("input-area");
  /** @type HTMLPreElement */
  let outputArea = document.getElementById("output-area");
  /** @type HTMLButtonElement */
  let assembleButton = document.getElementById("assemble-button");
  /** @type HTMLParagraphElement */
  let memoryHeader = document.getElementById("memory-header");
  /** @type HTMLPreElement */
  let outputMem = document.getElementById("output-mem");

  assembleButton.addEventListener(
    "click",
    function () {
      /** @type string */
      let value = inputArea.value;
      let lines = value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
      let section = 0;
      let codeStart = 0;
      let cleanIndex = 0;
      let labels = {};
      let output = "";
      let memoryStart = -1;
      let memoryEnd = -1;
      let variables = {};

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line === "[data]") continue;
        if (line === "[code]") {
          section = 1;
          codeStart = i + 1;
          cleanIndex = -1;
          continue;
        }
        cleanIndex++;

        if (line.includes("#")) {
          line = line.split("#")[0].trimEnd();
        }

        if (section === 0) {
          let [label, value] = line.split(":");
          value = value.trimStart();

          if (label) {
            if (label.includes(" ") && label.split(" ")[0] == "var") {
              let varName = label.split(" ")[1];
              let [addressString, initValue] = value.split("=");
              let address = Number.parseInt(addressString);
              if (initValue) variables[address] = initValue.trim();
              labels[varName] = addressString.trim();

              if (memoryStart == -1 || address < memoryStart) {
                memoryStart = address;
              }
              if (memoryEnd == -1 || address > memoryEnd) {
                memoryEnd = address;
              }
            } else {
              labels[label] = value;
            }
          }
        } else {
          if (line.includes(":")) {
            let [label, rest] = line.split(":");
            if (rest.trimStart().length === 0) {
              labels[label] = cleanIndex;
              cleanIndex--;
            } else {
              labels[label] = cleanIndex;
            }
          }
        }
      }

      let re = /%[a-zA-Z0-9_-]+/g;

      for (let i = codeStart; i < lines.length; i++) {
        let line = lines[i];
        if (line.endsWith(":")) continue;
        if (line.includes(":")) {
          line = line.split(":")[1].trimStart();
        }

        if (line.includes("#")) {
          line = line.split("#")[0].trimEnd();
        }

        let replaced = line.replaceAll(re, (seq) => {
          let label = seq.slice(1);
          if (Object.hasOwn(labels, label)) {
            return labels[label];
          }
          return seq;
        });
        output = output.concat(replaced + "\n");
      }
      outputArea.innerHTML = output;

      let memoryOutput = "";
      for (let i = memoryStart; i < memoryEnd + 1; i++) {
        for (const [k, v] of Object.entries(variables)) {
          if (k == i) {
            memoryOutput = memoryOutput.concat(v);
          }
        }
        memoryOutput = memoryOutput.concat("\n");
      }
      outputMem.innerHTML = memoryOutput;
      memoryHeader.innerHTML = `Memory (starting at ${memoryStart}):`;
    },
    { passive: true },
  );
};
