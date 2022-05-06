"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Fachliche Behandlung von allem, was mit Adressen zu tun hat.
 */
export default class UserService {
    constructor() {
        this._users = DatabaseFactory.database.collection("users");
    }

    /**
     * Adressen suchen
     */
    async search(query) {
        let cursor = this._users.find(query, {
            sort: {
                matrikel_nr: 1
            }
        });

        return cursor.toArray();
    }

    /**
     * Neue Adresse speichern
     */
    async create(user) {
        user = user || {};

        let newUser = {
            matrikel_nr:    user.matrikel_nr    || "",
            email:          user.email          || "",
            password:       user.password       || "",
        };

        let result = await this._users.insertOne(newUser);
        return await this._users.findOne({_id: result.insertedId});
    }

    /**
     * Einzelne Adresse anhand ihrer ID lesen
     */
    async read(id) {
        return await this._users.findOne({_id: new ObjectId(id)});
    }

    /**
     * Einzelne Adresse aktualisieren / überschreiben
     */
    async update(id, user) {
        let oldUser = await this._users.findOne({_id: new ObjectId(id)});
        if (!oldUser) return;

        let updateDoc = {
            $set: {
                // Felder, die geändert werden sollen
            },
        };

        if (user.matrikel_nr)   updateDoc.$set.matrikel_nr  = user.matrikel_nr;
        if (user.email)         updateDoc.$set.email        = user.email;
        if (user.password)      updateDoc.$set.password     = user.password;

        let result = await this._users.updateOne({_id: new ObjectId(id)}, updateDoc);
        return await this._users.findOne({_id: new ObjectId(id)});
    }

    /**
     * Einzelne Adresse löschen
     */
    async delete(id) {
        let result = await this._users.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
};
