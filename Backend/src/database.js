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
        this.database = this.client.db("studentsocial");

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
        let students = this.database.collection("students");
        let users = this.database.collection("users")
        let addresses = this.database.collection("addresses");
        let cusers = this.database.collection("cusers");

        if (await students.estimatedDocumentCount() === 0) {
            students.insertMany([
                {
                    matrikel_nr: "1000000",
                    first_name: "Max",
                    last_name: "Mustermann",
                    birthday: "19.01.2000",
                    course: "Software Engineering",
                    course_id: "WWI20B4"
                },
                {
                    matrikel_nr: "1000001",
                    first_name: "Maike",
                    last_name: "Musterfrau",
                    birthday: "19.01.1998",
                    course: "Data Science",
                    course_id: "WWI20B2"
                },
            ]);

            users.insertMany([
                {
                    matrikel_nr: "1000000",
                    email: "max.mustermann@dhbw.de",
                    password: "ABC123"
                },
                {
                    matrikel_nr: "1000001",
                    email: "maike.musterfrau@dhbw.de",
                    password: "ABC123"
                }
            ]);

            addresses.insertMany([
                {
                    first_name: "Max",
                    last_name: "Mustermann",
                    phone: "1123456",
                    email: "test@beispiel.de",
                },
                {
                    first_name: "Erika",
                    last_name: "Musterfrau",
                    phone: "1123456",
                    email: "test@beispiel.de",
                },
            ]);
            
            cusers.insertMany([
                {
                    matrikel_nr: "1000000",
                    first_name: "Max",
                    last_name: "Mustermann",
                    birthday: "19.01.2000",
                    course: "Software Engineering",
                    course_id: "WWI20B4",
                    email: "max.mustermann@dhbw.de",
                    password: "ABC123"
                }
            ]);
        }
    };
};

export default new DatabaseFactory();
