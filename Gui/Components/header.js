export class Header extends HTMLElement {

  constructor(inp) {
    super();
    const bu = inp.BUname && inp.BUid ? `${inp.BUname} (${inp.BUid})` : "";

    this.node = this.attachShadow({mode: "closed"});
    this.node.innerHTML = `
    <style>
      * {
        font-family: var(--font-family);
      }

      #header {
        display: flex;
        margin: 0;
        border: 0;
        padding: 0;
        border-bottom: 5px solid var(--sf-orange);
      }

      #logo, #search-img, #load-img, #export-img, #deimport-img {
        margin: 0;
        border: 0;
        padding: 6px;
        height: auto;
      }

      #logo > img, #search-img > img, #load-img > img, #export-img > img, #deimport-img > img {
        height: 32px;
        width: 32px;
      }

      #search-img > img:hover, #load-img > img:hover, #export-img > img:hover, #deimport-img > img:hover {
        cursor: pointer;
      }

      #title {
        margin: 0;
        border: 0;
        padding: 10px 6px;
        color: var(--sf-blue);
        font-weight: bold;
        font-size: 15px;
      }

      #bu {
        margin: 0;
        border: 0;
        padding-left: 6px;
        padding-right: 6px;
        padding-top: 12px;
        padding-bottom: 10px;
        color: var(--sf-dark-blue);
        font-weight: lighter;
        font-size: 13px;
      }

      .tooltip {
        display: none;
        background-color: var(--dark-background-color);
        color: var(--text-color);
        margin: 0;
        border: 0;
        padding: 4px;
        border-radius: 6px;
        position: absolute;
        z-index: 1;
      }

      div:hover > span {
        display: inline;
        transform: translateX(-50%);
        transform: translateY(-50%);
      }
    </style>
    <div id="header">
      <div id="logo"><img src="${inp.logo}"></div>
      <div id="title">${inp.name} v${inp.ver}</div>
      <div id="bu">${bu}</div>
      <div id="search-img">
        <img src="${inp.search}">
        <span class="tooltip">Search</span>
      </div>
      <div id="load-img">
        <img src="${inp.load}">
        <span class="tooltip">Load</span>
      </div>
      <div id="export-img">
        <img src="${inp.exp}">
        <span class="tooltip">Export</span>
      </div>
      <div id="deimport-img">
        <img src="${inp.deimp}">
        <span class="tooltip">DE Import</span>
      </div>
    </div>`;

    this.node.getElementById("search-img").addEventListener("click", () => inp.inputs.InitSearch());
    this.node.getElementById("load-img").addEventListener("click", () => inp.inputs.InitLoad());
    this.node.getElementById("export-img").addEventListener("click", () => inp.inputs.InitExport());
    this.node.getElementById("deimport-img").addEventListener("click", () => inp.inputs.InitDEImport());
  }

  ProcessKey(ev) {
    if(ev.ctrlKey || "APP-INPUTS" === ev.target.tagName.toUpperCase()) return;

    let div;
    switch(ev.code) {
      case "KeyI":
        div = this.node.getElementById("deimport-img");
        break;

      case "KeyS":
        div = this.node.getElementById("search-img");
        break;

      case "KeyL":
        div = this.node.getElementById("load-img");
        break;

      case "KeyE":
        div = this.node.getElementById("export-img");
        break;
    }

    if(div) div.click();
  }

}

customElements.define("app-header", Header);