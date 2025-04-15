export class Header extends HTMLElement {

  constructor(name, ver, BUname, BUid, logo, search, load, exp, inputs) {
    super();
    const bu = BUname && BUid ? `${BUname} (${BUid})` : "";

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

      #logo, #search-img, #load-img, #export-img {
        margin: 0;
        border: 0;
        padding: 6px;
        height: auto;
      }

      #logo > img, #search-img > img, #load-img > img, #export-img > img {
        height: 32px;
        width: 32px;
      }

      #search-img > img:hover, #load-img > img:hover, #export-img > img:hover {
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
    </style>
    <div id="header">
      <div id="logo"><img src="${logo}"></div>
      <div id="title">${name} v${ver}</div>
      <div id="bu">${bu}</div>
      <div id="search-img"><img src="${search}"></div>
      <div id="load-img"><img src="${load}"></div>
      <div id="export-img"><img src="${exp}"></div>
    </div>`;

    this.node.getElementById("search-img").addEventListener("click", () => inputs.InitSearch());
    this.node.getElementById("load-img").addEventListener("click", () => inputs.InitLoad());
    this.node.getElementById("export-img").addEventListener("click", () => inputs.InitExport());
  }

}

customElements.define("app-header", Header);