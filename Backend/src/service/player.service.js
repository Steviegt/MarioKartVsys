"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Playern. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Player werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class PlayerService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._player = DatabaseFactory.database.collection("player");
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
        let cursor = this._player.find(query, {
            sort: {
                name: 1,
                skill_level: 1,
            }
        });

        return cursor.toArray();
    }

    /**
     * Speichern eines neuen Players.
     *
     * @param {Object} player Zu speichernde Playerdaten
     * @return {Promise} Gespeicherte Playerdaten
     */
    async create(player) {
        player = player || {};

        let newPlayer = {
            name: player.name || "",
            skill_level:  player.skill_level  || "",
        };

        let result = await this._player.insertOne(newPlayer);
        return await this._player.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen eines vorhandenen Datensätze anhand der ID.
     *
     * @param {String} id ID der gesuchten Daten
     * @return {Promise} Gefundene Daten
     */
    async read(id) {
        let result = await this._player.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung eines Datensatzes, durch Überschreiben einzelner Felder
     * oder des gesamten Datensatzes (ohne die ID).
     *
     * @param {String} id ID 
     * @param {[type]} player Zu speichernder Datensatz
     * @return {Promise} Gespeicherte Datensätze oder undefined
     */
    async update(id, player) {
        let oldPlayer = await this._player.findOne({_id: new ObjectId(id)});
        if (!oldPlayer) return;

        let updateDoc = {
            $set: {},
        }

        if (player.name) updateDoc.$set.name = player.name;
        if (player.skill_level)  updateDoc.$set.skill_level  = player.skill_level;


        await this._player.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._player.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen eines Datensatzes anhand der ID.
     *
     * @param {String} id ID 
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._player.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}