"use strict";

import Backend from "./backend.js";
import Router from "./router.js";
import "./app.css";

/**
 * Hauptklasse App: Steuert die gesamte Anwendung
 *
 * Diese Klasse erzeugt den Single Page Router zur Navigation innerhalb
 * der Anwendung und ein Datenbankobjekt zur Verwaltung der Adressliste.
 * Darüber hinaus beinhaltet sie verschiedene vom Single Page Router
 * aufgerufene Methoden, zum Umschalten der aktiven Seite.
 */
class App {
    /**
     * Konstruktor.
     */
    constructor() {
        // Datenbank-Klasse zur Verwaltung der Datensätze
        this.backend = new Backend();

        // Single Page Router zur Steuerung der sichtbaren Inhalte

        this.router = new Router([
 
            {
                url: "^/player/(.*)$",
                show: () => this._gotoListPlayer()
            },
            {
                url: "^/tracks/(.*)$",
                show: () => this._gotoListTracks()
            },
            {
                url: "^/highscores/(.*)$",
                show: () => this._gotoListHighscores()
            },
            {
                url: "^/edit-player/(.*)$",
                show: matches => this._gotoPlayerEdit(matches[1]),
            },
            {
                url: "^/edit-track/(.*)$",
                show: matches => this._gotoTrackEdit(matches[1]),
            },
            {
                url: "^/edit-highscore/(.*)$",
                show: matches => this._gotoHighscoreEdit(matches[1]),
            },
            {
                url: "^/highscore-by-track/(.*)$",
                show: matches => this._gotoHighscoreByTrack(matches[1]),
            },
            {
                url: "^/highscore-by-player/(.*)$",
                show: matches => this._gotoHighscoreByPlayer(matches[1]),
            },{
                url: "^/(.*)$",
                show: () => this._gotoListHighscores()
            },
            
        ]);

        // Fenstertitel merken, um später den Name der aktuellen Seite anzuhängen
        this._documentTitle = document.title;

        // Von dieser Klasse benötigte HTML-Elemente
        this._pageCssElement = document.querySelector("#page-css");
        this._bodyElement = document.querySelector("body");
        this._menuElement = document.querySelector("#app-menu");
    }

    /**
     * Initialisierung der Anwendung beim Start. Im Gegensatz zum Konstruktor
     * der Klasse kann diese Methode mit der vereinfachten async/await-Syntax
     * auf die Fertigstellung von Hintergrundaktivitäten warten, ohne dabei
     * mit den zugrunde liegenden Promise-Objekten direkt hantieren zu müssen.
     */
    async init() {
        try {
            await this.backend.init();
            this.router.start();
        } catch (ex) {
            this.showException(ex);
        }
    }

    /**
     * Übersichtsseite anzeigen. Wird vom Single Page Router aufgerufen.
     */
    async _gotoListPlayer() {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageList} = await import("./page-list-player/page-list-player.js");

            let page = new PageList(this);
            await page.init();
            this._showPage(page, "list-player");
        } catch (ex) {
            this.showException(ex);
        }
    }

    async _gotoListTracks() {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageList} = await import("./page-list-tracks/page-list-tracks.js");

            let page = new PageList(this);
            await page.init();
            this._showPage(page, "list-tracks");
        } catch (ex) {
            this.showException(ex);
        }
    }

    async _gotoListHighscores() {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageList} = await import("./page-list-highscores/page-list-highscores.js");

            let page = new PageList(this);
            await page.init();
            this._showPage(page, "list-highscores");
        } catch (ex) {
            this.showException(ex);
        }
    }

    async _gotoPlayerEdit(id) {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageEdit} = await import("./page-edit-player/page-edit-player.js");

            let page = new PageEdit(this, id);
            await page.init();
            this._showPage(page, "edit-player");
        } catch (ex) {
            this.showException(ex);
        }
    }
    async _gotoTrackEdit(id) {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageEdit} = await import("./page-edit-track/page-edit-track.js");

            let page = new PageEdit(this, id);
            await page.init();
            this._showPage(page, "edit-track");
        } catch (ex) {
            this.showException(ex);
        }
    }
    async _gotoHighscoreEdit(id) {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageEdit} = await import("./page-edit-highscore/page-edit-highscore.js");

            let page = new PageEdit(this, id);
            await page.init();
            this._showPage(page, "edit-highscore");
        } catch (ex) {
            this.showException(ex);
        }
    }

    async _gotoHighscoreByTrack(track_title) {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageEdit} = await import("./page-list-highscores-by-track/page-list-highscores-by-track.js");

            let page = new PageEdit(this, track_title);
            await page.init();
            this._showPage(page, "track-highscore");
        } catch (ex) {
            this.showException(ex);
        }
    }

    async _gotoHighscoreByPlayer(name) {
        try {
            // Dynamischer Import, vgl. https://javascript.info/modules-dynamic-imports
            let {default: PageEdit} = await import("./page-list-highscores-by-player/page-list-highscores-by-player.js");

            let page = new PageEdit(this, name);
            await page.init();
            this._showPage(page, "track-highscore");
        } catch (ex) {
            this.showException(ex);
        }
    }

    /**
     * Interne Methode zum Umschalten der sichtbaren Seite.
     *
     * @param  {Page} page Objekt der anzuzeigenden Seiten
     * @param  {String} name Name zur Hervorhebung der Seite im Menü
     */
    _showPage(page, name) {
        // Fenstertitel aktualisieren
        document.title = `${this._documentTitle} – ${page.title}`;

        // Stylesheet der Seite einfügen
        this._pageCssElement.innerHTML = page.css;

        // Aktuelle Seite im Kopfbereich hervorheben
        this._menuElement.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        this._menuElement.querySelectorAll(`li[data-page-name="${name}"]`).forEach(li => li.classList.add("active"));

        // Sichtbaren Hauptinhalt austauschen
        this._bodyElement.querySelector("main")?.remove();
        this._bodyElement.append(page.mainElement)

        //Footer anbauen
        let footer = this._bodyElement.querySelector("footer")
        footer.remove
        this._bodyElement.append(footer)
    }

    /**
     * Hilfsmethode zur Anzeige eines Ausnahmefehlers. Der Fehler wird in der
     * Konsole protokolliert und als Popupmeldung angezeigt.
     *
     * @param {Object} ex Abgefangene Ausnahme
     */
    showException(ex) {
        console.error(ex);

        if (ex.message) {
            alert(ex.message)
        } else {
            alert(ex.toString());
        }
    }
}

/**
 * Anwendung starten
 */
window.addEventListener("load", async () => {
    let app = new App();
    await app.init();
});
