"use strict";

import Page from "../page.js";
import HtmlTemplate from "./page-edit-highscore.html";

/**
 * Klasse PageEdit: Stellt die Seite zum Anlegen oder Bearbeiten einer Adresse
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
            track: "",
            time: ""
        };

        this._playerData = {
            name: "",
            skill_level: "",
        };


        this._trackData = {
            track_title: "",
            game_version: "",
        };

        // Eingabefelder
        this._titleInput = null;
        this._nameInput  = null;
        this._time = null;

    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     *
     * HINWEIS: Durch die geerbte init()-Methode wird `this._mainElement` mit
     * dem <main>-Element aus der nachgeladenen HTML-Datei versorgt. Dieses
     * Element wird dann auch von der App-Klasse verwendet, um die Seite
     * anzuzeigen. Hier muss daher einfach mit dem üblichen DOM-Methoden
     * `this._mainElement` nachbearbeitet werden, um die angezeigten Inhalte
     * zu beeinflussen.
     *
     * HINWEIS: In dieser Version der App wird mit dem üblichen DOM-Methoden
     * gearbeitet, um den finalen HTML-Code der Seite zu generieren. In größeren
     * Apps würde man ggf. eine Template Engine wie z.B. Nunjucks integrieren
     * und den JavaScript-Code dadurch deutlich vereinfachen.
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();

        // Bearbeiteten Datensatz laden
        if (this._editId) {
            this._url = `/highscore/${this._editId}`;
            this._dataset = await this._app.backend.fetch("GET", this._url);
            this._title = `${this._dataset.name}`;


        } else {
            this._url = `/highscore`;
            this._title = "Highscore hinzufügen";
        }

        //Daten von Track und Player laden
        this._playerData = await this._app.backend.fetch("GET", "/player")
        this._trackData = await this._app.backend.fetch("GET", "/track")
    

        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$NAME$", this._dataset.name);
        html = html.replace("$TITLE$", this._dataset.track);
        html = html.replace("$TIME$", this._dataset.time);
        this._mainElement.innerHTML = html;

        // Event Listener registrieren
        let saveButton = this._mainElement.querySelector(".action.save");
        saveButton.addEventListener("click", () => this._saveAndExit());

        // Eingabefelder zur späteren Verwendung merken
        this._titleInput = this._mainElement.querySelector("input.title");
        this._nameInput  = this._mainElement.querySelector("input.name");
        this._timeInput  = this._mainElement.querySelector("input.time");


    }

    /**
     * Speichert den aktuell bearbeiteten Datensatz und kehrt dann wieder
     * in die Listenübersicht zurück.
     */
    async _saveAndExit() {
        // Eingegebene Werte prüfen
        let oldName = this._dataset.name
        let oldTrack = this._dataset.track
        this._dataset._id        = this._editId;
        this._dataset.track = this._titleInput.value.trim();
        this._dataset.name  = this._nameInput.value.trim();
        this._dataset.time  = this._timeInput.value.trim();



        if (!this._dataset.name) {
            alert("Geben Sie erst einen Namen ein.");
            return;
        }

        if (!this._dataset.track) {
            alert("Geben Sie erst einen Titel ein.");
            return;
        }

        if (!this._dataset.time) {
            alert("Geben Sie erst ein Zeit ein.");
            return;
        }

        var playerFound = false
        for (let index in this._playerData) {
            let dataset = this._playerData[index];
            if(this._dataset.name == dataset.name){
                playerFound = true
            }
        }
        if(!playerFound){
            alert("Der Player " +this._dataset.name+" ist nicht bekannt!")
            return;
        }
        var trackFound = false
        for (let index in this._trackData) {
            let dataset = this._trackData[index];
            if(this._dataset.track == dataset.track_title){
                trackFound = true
            }
        }
        if(!trackFound){
            alert("Der Track " +this._dataset.track+" ist nicht bekannt!")
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
        location.hash = "#/highscores/";
    }
};
