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
                    fakultaet: "Wirtschaft",
                    course: "Wirtschaftsinformatik",
                    direction: "Data Science",
                    course_id: "WWI20B4",
                    email: "max.mustermann@dh-karlsruhe.de",
                    password: "ABC123",
                    logged: "n",
                    reminder: "y"
                },
                {
                    matrikel_nr: "1000001",
                    first_name: "Maike",
                    last_name: "Musterfrau",
                    birthday: "19.01.1998",
                    fakultaet: "Wirtschaft",
                    course: "Wirtschaftsinformatik",
                    direction: "Software Engineering",
                    course_id: "WWI20B2",
                    email: "maike.musterfrau@dh-karlsruhe.de",
                    password: "ABC123",
                    logged: "n",
                    reminder: "y"
                },
                {
                    matrikel_nr: "1000002",
                    first_name: "Marlon",
                    last_name: "Mustermann",
                    birthday: "19.01.2000",
                    fakultaet: "Wirtschaft",
                    course: "Wirtschaftsinformatik",
                    direction: "Software Engineering",
                    course_id: "WWI20B2",
                    email: "marlon.musterfrau@dh-karlsruhe.de",
                    password: "ABC123",
                    logged: "n",
                    reminder: "y"
                },
                {
                    matrikel_nr: "1000003",
                    first_name: "Marie",
                    last_name: "Musterfrau",
                    birthday: "19.04.2000",
                    fakultaet: "Wirtschaft",
                    course: "Wirtschaftsinformatik",
                    direction: "Sales & Consulting",
                    course_id: "WWI20B4",
                    email: "marie.musterfrau@dh-karlsruhe.de",
                    password: "ABC123",
                    logged: "n",
                    reminder: "y"
                },
            ]);
        }
    };
};

export default new DatabaseFactory();
