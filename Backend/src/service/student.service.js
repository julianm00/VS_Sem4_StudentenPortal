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
            first_name: student.first_name  || "",
            last_name:  student.last_name   || "",
            birthday:   student.birthday    || "",
            course:     student.course      || "",
            course_id:  student.course      || "",
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
     * Student updaten
     */
    async update(id) {
        let oldStudent = await this._students.findOne({_id : new ObjectId(id)});
        if (!oldStudent) return;

        let updateDoc = {
            $set: {

            },
        };

        if (student.matrikel_nr)    updateDoc.$set.matrikel_nr  = student.matrikel_nr;
        if (student.first_name)     updateDoc.$set.first_name   = student.first_name;
        if (student.last_name)      updateDoc.$set.last_name    = student.last_name;
        if (student.birthday)       updateDoc.$set.birthday     = student.birthday;
        if (student.course)         updateDoc.$set.course       = student.course;
        if (student.course_id)      updateDoc.$set.course_id    = student.course_id;

        await this._students.updateOne({_id: new ObjectId(id)}, updateDoc);
        return await this._students.findOne({_id: new ObjectId(id)});
    }

    /**
     * Student löschen
     */
    async delete(id) {
        let result = await this._students.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}