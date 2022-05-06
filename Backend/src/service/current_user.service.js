"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Fachliche Behandlung von allem, was mit Adressen zu tun hat.
 */
export default class CurrentUserService {
    constructor() {
        this._cusers = DatabaseFactory.database.collection("cusers");
    }

    /**
     * Adressen suchen
     */
    async search(query) {
        let cursor = this._cusers.find(query, {
            sort: {
                matrikel_nr: 1
            }
        });

        return cursor.toArray();
    }

    /**
     * Neue Adresse speichern
     */
    async create(cuser) {
        cuser = cuser || {};

        let newCUser = {
            matrikel_nr:    cuser.matrikel_nr   || "",
            first_name:     cuser.first_name    || "",
            last_name:      cuser.last_name     || "",
            birthday:       cuser.birthday      || "",
            course:         cuser.course        || "",
            course_id:      cuser.course        || "",
            email:          cuser.email         || "",
            password:       cuser.password      || "",
        };

        let result = await this._cusers.insertOne(newCUser);
        return await this._cusers.findOne({_id: result.insertedId});
    }

    /**
     * Einzelne Adresse anhand ihrer ID lesen
     */
    async read(id) {
        return await this._cusers.findOne({_id: new ObjectId(id)});
    }

    /**
     * Einzelne Adresse aktualisieren / überschreiben
     */
    async update(id, cuser) {
        let oldCUser = await this._cusers.findOne({_id: new ObjectId(id)});
        if (!oldCUser) return;

        let updateDoc = {
            $set: {
                // Felder, die geändert werden sollen
            },
        };

        if (cuser.matrikel_nr)  updateDoc.$set.matrikel_nr  = cuser.matrikel_nr;
        if (cuser.email)        updateDoc.$set.email        = cuser.email;
        if (cuser.password)     updateDoc.$set.password     = cuser.password;
        if (cuser.first_name)   updateDoc.$set.first_name   = cuser.first_name;
        if (cuser.last_name)    updateDoc.$set.last_name    = cuser.last_name;
        if (cuser.birthday)     updateDoc.$set.birthday     = cuser.birthday;
        if (cuser.course)       updateDoc.$set.course       = cuser.course;
        if (cuser.course_id)    updateDoc.$set.course_id    = cuser.course_id;

        let result = await this._cusers.updateOne({_id: new ObjectId(id)}, updateDoc);
        return await this._cusers.findOne({_id: new ObjectId(id)});
    }

    /**
     * Einzelne Adresse löschen
     */
    async delete(id) {
        let result = await this._cusers.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
};
