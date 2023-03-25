"use strict";

import Page from "../page.js";
import HtmlTemplate from "./page-edit-player.html";

/**
 * Klasse PageEdit: Stellt die Seite zum Anlegen oder Bearbeiten eines Spielers
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
            name: "",
            skill_level: ""
        };

        this._playerData = [];



        // Eingabefelder
        this._nameInput = null;
        this._skillLevelInput  = null;

    }

    async init() {
        // HTML-Inhalt nachladen
        await super.init();

        // Bearbeiteten Datensatz laden
        if (this._editId) {
            this._url = `/player/${this._editId}`;
            this._dataset = await this._app.backend.fetch("GET", this._url);
            this._title = `${this._dataset.name}`;
        } else {
            this._url = `/player`;
            this._title = "Player hinzufügen";
        }

        this._playerData = await this._app.backend.fetch("GET", "/player")


        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$NAME$", this._dataset.name);
        html = html.replace("$SKILL_LEVEL$", this._dataset.skill_level);
        this._mainElement.innerHTML = html;

        // Event Listener registrieren
        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () => this._saveAndExit());

        // Eingabefelder zur späteren Verwendung merken
        this._nameInput = this._mainElement.querySelector("input.name");
        this._skillLevelInput  = this._mainElement.querySelector("input.skill_level");

    }

    /**
     * Speichert den aktuell bearbeiteten Datensatz und kehrt dann wieder
     * in die Listenübersicht zurück.
     */
    async _saveAndExit() {
        // Eingegebene Werte prüfen
        let oldName = this._dataset.name
        this._dataset._id        = this._editId;
        this._dataset.name = this._nameInput.value.trim();
        this._dataset.skill_level  = this._skillLevelInput.value.trim();


        if (!this._dataset.name) {
            alert("Geben Sie erst einen Namen ein.");
            return;
        }

        if (!this._dataset.skill_level) {
            alert("Geben Sie erst ein Skill Level ein.");
            return;
        }
        if(oldName !== this._dataset.name){
            for(let index in this._playerData){
                let dataset = this._playerData[index]
                if(this._dataset.name === dataset.name){
                    alert("Spieler "+ this._dataset.name+" schon vorhanden!")
                    return;
                }
            }
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
        location.hash = "#/player/";
    }
};
