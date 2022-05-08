"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

export default class StudentService {
    constructor() {
        this._students = DatabaseFactory.database.collection("students");
    }

    /**
     * Studenten suchen
     */
    async search(query) {
        let cursor = this._students.find(query, {
            sort: {
                matrikel_nr: 1
            }
        });

        return cursor.toArray();
    }

    /**
     * Student anlegen
     */
    async create(student) {
        student = student || {};

        let newStudent = {
            matrikel_nr:student.matrikel_nr || "",
            pronoun:    student.pronoun     || "-",
            first_name: student.first_name  || "",
            last_name:  student.last_name   || "",
            birthday:   student.birthday    || "-",
            fakultaet:  student.fakultaet   || "-",
            course:     student.course      || "-",
            direction:  student.direction   || "-",
            course_id:  student.course      || "-",
            email:      student.email       || "",
            password:   student.password    || "",
            logged:     student.logged      || "n",
            reminder:   student.reminder    || "y",
            abooutme:   student.aboout      || ""
        }

        let result = await this._students.insertOne(newStudent);
        return await this._students.findOne({_id: result.insertedId});
    }

    /**
     * Einzelne Student suchen
     */
    async read(id) {
        return await this._students.findOne({_id: new ObjectId(id)});
    }

    /**
     * Einzelnen Student updaten
     */
    async update(id, student) {
        let oldStudent = await this._students.findOne({_id : new ObjectId(id)});
        if (!oldStudent) return;

        let updateDoc = {
            $set: {

            },
        };

        if (student.matrikel_nr)    updateDoc.$set.matrikel_nr  = student.matrikel_nr;
        if (student.pronoun)        updateDoc.$set.pronoun      = student.pronoun;
        if (student.first_name)     updateDoc.$set.first_name   = student.first_name;
        if (student.last_name)      updateDoc.$set.last_name    = student.last_name;
        if (student.birthday)       updateDoc.$set.birthday     = student.birthday;
        if (student.fakultaet)      updateDoc.$set.fakultaet    = student.fakultaet;
        if (student.course)         updateDoc.$set.course       = student.course;
        if (student.direction)      updateDoc.$set.direction    = student.direction;
        if (student.course_id)      updateDoc.$set.course_id    = student.course_id;
        if (student.email)          updateDoc.$set.email        = student.email;
        if (student.password)       updateDoc.$set.password     = student.password;
        if (student.aboout)         updateDoc.$set.aboout       = student.aboout;
        if (student.logged)         updateDoc.$set.logged       = student.logged;
        if (student.reminder)       updateDoc.$set.reminder     = student.reminder;
    
        await this._students.updateOne({_id: new ObjectId(id)}, updateDoc);
        return await this._students.findOne({_id: new ObjectId(id)});
    }

    /**
     * Einzelnen Student löschen
     */
    async delete(id) {
        let result = await this._students.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}