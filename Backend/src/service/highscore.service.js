"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Playern. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Adressen werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class HighscoreService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._highscores = DatabaseFactory.database.collection("highscore");
    }

    /**
     * Player suchen. Unterstützt wird lediglich eine ganz einfache Suche,
     * bei der einzelne Felder auf exakte Übereinstimmung geprüft werden.
     * Zwar unterstützt MongoDB prinzipiell beliebig komplexe Suchanfragen.
     * Um das Beispiel klein zu halten, wird dies hier aber nicht unterstützt.
     *
     * @param {Object} query Optionale Suchparameter
     * @return {Promise} Liste der gefundenen Player
     */
    async search(query) {
        let cursor = this._highscores.find(query, {
            sort: {
                name: 1,
                track: 1,
                time: 1
            }
        });

        return cursor.toArray();
    }

    /**
     * Speichern eines neuen Players.
     *
     * @param {Object} highscore Zu speichernde Plyerdaten
     * @return {Promise} Gespeicherte Playerdaten
     */
    async create(highscore) {
        highscore = highscore || {};

        let newHighscore = {
            name: highscore.name || "",
            track:  highscore.track  || "",
            time:  highscore.time  || "",
        };

        let result = await this._highscores.insertOne(newHighscore);
        return await this._highscores.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen einer vorhandenen Adresse anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Adresse
     * @return {Promise} Gefundene Adressdaten
     */
    async read(id) {
        let result = await this._highscores.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung einer Adresse, durch Überschreiben einzelner Felder
     * oder des gesamten Adressobjekts (ohne die ID).
     *
     * @param {String} id ID der gesuchten Adresse
     * @param {[type]} track Zu speichernde Adressdaten
     * @return {Promise} Gespeicherte Adressdaten oder undefined
     */
    async update(id, track) {
        let oldHighscore = await this._highscores.findOne({_id: new ObjectId(id)});
        if (!oldHighscore) return;

        let updateDoc = {
            $set: {},
        }

        if (highscore.name) updateDoc.$set.name = highscore.name;
        if (highscore.track)  updateDoc.$set.track  = highscore.track;
        if (highscore.time) updateDoc.$set.time = highscore.time


        await this._highscores.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._highscores.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen einer Adresse anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Adresse
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._track.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}