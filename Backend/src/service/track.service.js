"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Tracks. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Tracks werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class TrackService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._track = DatabaseFactory.database.collection("tracks");
    }

    /**
     * Track suchen. Unterstützt wird lediglich eine ganz einfache Suche,
     * bei der einzelne Felder auf exakte Übereinstimmung geprüft werden.
     * Zwar unterstützt MongoDB prinzipiell beliebig komplexe Suchanfragen.
     * Um das Beispiel klein zu halten, wird dies hier aber nicht unterstützt.
     *
     * @param {Object} query Optionale Suchparameter
     * @return {Promise} Liste der gefundenen Player
     */
    async search(query) {
        let cursor = this._track.find(query, {
            sort: {
                track_title: 1,
                game_version: 1,
            }
        });

        return cursor.toArray();
    }

    /**
     * Speichern eines neuen Tracks.
     *
     * @param {Object} track Zu speichernde Trackdaten
     * @return {Promise} Gespeicherte Trackdaten
     */
    async create(track) {
        track = track || {};

        let newTrack = {
            track_title: track.track_title || "",
            game_version:  track.game_version  || "",
        };

        let result = await this._track.insertOne(newTrack);
        return await this._track.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen eines vorhandenen Datensatzes anhand der ID.
     *
     * @param {String} id ID 
     * @return {Promise} Gefundene Daten
     */
    async read(id) {
        let result = await this._track.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung eines Tracks, durch Überschreiben einzelner Felder
     * oder des gesamten Trackobjekts (ohne die ID).
     *
     * @param {String} id ID des gesuchten Tracks
     * @param {[type]} track Zu speichernde Trackdaten
     * @return {Promise} Gespeicherte Trackdaten oder undefined
     */
    async update(id, track) {
        let oldTrack = await this._track.findOne({_id: new ObjectId(id)});
        if (!oldTrack) return;

        let updateDoc = {
            $set: {},
        }

        if (track.track_title) updateDoc.$set.track_title = track.track_title;
        if (track.game_version)  updateDoc.$set.game_version  = track.game_version;


        await this._track.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._track.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen eines Tracks anhand der ID.
     *
     * @param {String} id ID der gesuchten Daten
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._track.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}