"use strict";

import Page from "../page.js";
import HtmlTemplate from "./page-edit-track.html";

/**
 * Klasse PageEdit: Stellt die Seite zum Anlegen oder Bearbeiten einer Strecke
 * zur Verfügung.
 */
export default class PageEdit extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     * @param {Integer} editId ID des bearbeiteten Datensatzes
     */
    constructor(app, editId) {
        super(app, HtmlTemplate);

        // Bearbeiteter Datensatz
        this._editId = editId;

        this._dataset = {
            track_title: "",
            game_version: ""
        };

        // Eingabefelder
        this._titleInput = null;
        this._gameVersionInput  = null;

    }

    
    async init() {
        // HTML-Inhalt nachladen
        await super.init();

        // Bearbeiteten Datensatz laden
        if (this._editId) {
            this._url = `/track/${this._editId}`;
            this._dataset = await this._app.backend.fetch("GET", this._url);
            this._title = `${this._dataset.name}`;
        } else {
            this._url = `/track`;
            this._title = "Track hinzufügen";
        }

        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$TITLE$", this._dataset.track_title);
        html = html.replace("$GAME_VERSION$", this._dataset.game_version);
        this._mainElement.innerHTML = html;

        // Event Listener registrieren
        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () => this._saveAndExit());

        // Eingabefelder zur späteren Verwendung merken
        this._titleInput = this._mainElement.querySelector("input.title");
        this._gameVersionInput  = this._mainElement.querySelector("input.game_version");

    }

    /**
     * Speichert den aktuell bearbeiteten Datensatz und kehrt dann wieder
     * in die Listenübersicht zurück.
     */
    async _saveAndExit() {
        // Eingegebene Werte prüfen
        this._dataset._id        = this._editId;
        this._dataset.track_title = this._titleInput.value.trim();
        this._dataset.game_version  = this._gameVersionInput.value.trim();


        if (!this._dataset.track_title) {
            alert("Geben Sie erst einen Titel ein.");
            return;
        }

        if (!this._dataset.game_version) {
            alert("Geben Sie erst eine Game Version ein.");
            return;
        }

        // Datensatz speichern
        try {
            if (this._editId) {
                await this._app.backend.fetch("PUT", this._url, {body: this._dataset});
            } else {
                await this._app.backend.fetch("POST", this._url, {body: this._dataset});
            }
        } catch (ex) {
            this._app.showException(ex);
            return;
        }

        // Zurück zur Übersicht
        location.hash = "#/tracks/";
    }
};
