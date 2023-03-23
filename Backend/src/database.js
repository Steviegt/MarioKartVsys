"use strict"

import { MongoClient } from "mongodb";

/**
 * Singleton-Klasse zum Zugriff auf das MongoDB-Datenbankobjekt, ohne dieses
 * ständig als Methodenparameter durchreichen zu müssen. Stattdessen kann
 * einfach das Singleton-Objekt dieser Klasse importiert und das Attribut
 * `mongodb` oder `database` ausgelesen werden.
 */
class DatabaseFactory {
    /**
     * Ersatz für den Konstruktor, damit aus dem Hauptprogramm heraus die
     * Verbindungs-URL der MongoDB übergeben werden kann. Hier wird dann
     * auch gleich die Verbindung hergestellt.
     *
     * @param {String} connectionUrl URL-String mit den Verbindungsdaten
     */
    async init(connectionUrl) {
        // Datenbankverbindung herstellen
        this.client = new MongoClient(connectionUrl);
        await this.client.connect();
        this.database = this.client.db("app_database");

        await this._createDemoData();
    }

    /**
     * Hilfsmethode zum Anlegen von Demodaten. Würde man so in einer
     * Produktivanwendung natürlich nicht machen, aber so sehen wir
     * wenigstens gleich ein paar Daten.
     */
    async _createDemoData() {
        //// TODO: Methode anpassen, um zur eigenen App passende Demodaten anzulegen ////
        //// oder die Methode ggf. einfach löschen und ihren Aufruf oben entfernen.  ////
        let tracks = this.database.collection("tracks");

        if (await tracks.estimatedDocumentCount() === 0) {
            tracks.insertMany([
                {
                    track_title: "Rainbow Road",
                    game_version: "Mario Kart 8 deluxe"
                },
                {
                    track_title: "Wario Stadion",
                    game_version: "Mario Kart DS"
                },
            ]);
        }

        let player = this.database.collection("player");

        if (await player.estimatedDocumentCount() === 0) {
            player.insertMany([
                {
                    name: "Xena Raquet",
                    skill_level: "Beginner"
                },
                {
                    name: "Stefan Geiselhart",
                    skill_level: "Medium"
                },{
                    name: "Vinzent von Benthen",
                    skill_level: "Pro"
                },
            ]);
        }

        let highscore = this.database.collection("highscore");

        if (await highscore.estimatedDocumentCount() === 0) {
            highscore.insertMany([
                {
                    name: "Xena Raquet",
                    track: "Rainbow Road",
                    time: "24h 00m 00s"
                },
                {
                    name: "Vinzent von Benthen",
                    track: "Rainbow Road",
                    time: "00h 00m 01s"
                },
                {
                    name: "Stefan Geiselhart",
                    track: "Wario Stadion",
                    time: "00h 02m 30s"
                },
            ]);
        }
    }
}

export default new DatabaseFactory();
