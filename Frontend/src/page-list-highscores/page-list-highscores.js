"use strict";

import Page from "../page.js";
import HtmlTemplate from "./page-list-highscores.html";

/**
 * Klasse PageList: Stellt die Listenübersicht zur Verfügung
 */
export default class PageList extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     */
    constructor(app) {
        super(app, HtmlTemplate);

        this._emptyMessageElement = null;
    }

    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        this._title = "Übersicht";

        // Platzhalter anzeigen, wenn noch keine Daten vorhanden sind
        let data = await this._app.backend.fetch("GET", "/highscore");
        data.sort(this.dynamicSort("name"))
        this._emptyMessageElement = this._mainElement.querySelector(".empty-placeholder");



        if (data.length) {
            this._emptyMessageElement.classList.add("hidden");
        }

        // Je Datensatz einen Listeneintrag generieren
        let olElement = this._mainElement.querySelector("ol");

        let templateElement = this._mainElement.querySelector(".list-entry");
        let templateHtml = templateElement.outerHTML;
        templateElement.remove();

        for (let index in data) {
            // Platzhalter ersetzen
            let dataset = data[index];
            let html = templateHtml;

            html = html.replace("$ID$", dataset._id);
            html = html.replace("$NAME", dataset.name);
            html = html.replace("$TRACK_TITLE", dataset.track);
            html = html.replace("$TIME", dataset.time);


            // Element in die Liste einfügen
            let dummyElement = document.createElement("div");
            dummyElement.innerHTML = html;
            let liElement = dummyElement.firstElementChild;
            liElement.remove();
            olElement.appendChild(liElement);

            // Event Handler registrieren
            liElement.querySelector(".action.edit").addEventListener("click", () => location.hash = `#/edit-highscore/${dataset._id}`);
            liElement.querySelector(".action.delete").addEventListener("click", () => this._askDelete(dataset._id));
        }
    }

   /**
     * Löschen des übergebenen Highscores. Zeigt einen Popup, ob der Anwender
     * den Highscore löschen will und löscht diese dann.
     *
     * @param {Integer} id ID des zu löschenden Datensatzes
     */
   async _askDelete(id) {
    // Sicherheitsfrage zeigen
    let answer = confirm("Soll der ausgewählte Highscore wirklich gelöscht werden?");
    if (!answer) return;

    // Datensatz löschen
    try {
        this._app.backend.fetch("DELETE", `/highscore/${id}`);
    } catch (ex) {
        this._app.showException(ex);
        return;
    }

    // HTML-Element entfernen
    this._mainElement.querySelector(`[data-id="${id}"]`)?.remove();

    if (this._mainElement.querySelector("[data-id]")) {
        this._emptyMessageElement.classList.add("hidden");
    } else {
        this._emptyMessageElement.classList.remove("hidden");
    }
}
dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
    
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
};

