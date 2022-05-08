"use strict";

import Page from "../page.js";
import HtmlTemplate from "./login.html";
import swal from 'sweetalert';
import { _updateList } from "../utils.js";

/**
 * Klasse PageList: Stellt die Listenübersicht zur Verfügung
 */
export default class Register extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     */
    constructor(app) {
        super(app, HtmlTemplate);

        // Falls Liste leer ist
        this._emptyMessageElement = null;

        // Datensätze für Student
        this._dataset_student = null;
        this._dataLoggedStudent = null;

        // Eingabefelder
        this._inputEmail = null,
        this._inputPassword = null;
    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        this._title = "Login";
        await _updateList(this._app);

        // Inputfelder bekommen
        this._inputEmail = this._mainElement.querySelector("#email");
        this._inputPassword = this._mainElement.querySelector("#password");

        // ActionListener registrieren
        let saveButton = this._mainElement.querySelector(".btn.auth-btn");
        saveButton.addEventListener("click", () => this._login());

        let toRegLink = this._mainElement.querySelector(".toRegister");
        toRegLink.addEventListener("click", () => this.toRegister());
    }

    /**
     * Login  Button der bei richtigen Daten das Feld "logged" in Student mit "y" (yes) überschreibt
     */
    async _login() {
        // Felder sind leer
        if (!this._inputEmail.value.trim() || !this._inputPassword.value.trim()) {
            swal({
                title: "Achtung",
                text: "Bitte geben Sie E-Mail und/oder Passwort ein!",
                icon: "warning",
            });
            return;
        }

        let emailUser = this._inputEmail.value.trim();
        emailUser = emailUser.toLowerCase();

        // Email prüfen
        // Email Format
        let regExp = new RegExp("^[a-zA-Z0-9._%+-]+@dh-karlsruhe\.de$");
        if (!regExp.test(emailUser)) {
            swal({
                title: "Achtung",
                text: "Die eingegebene E-Mail entspricht nicht dem Format.\nAchten Sie darauf, dass sie der erhaltenen E-Mail der DHBW entspricht.\nnachname.vorname@dh-karlsruhe.de",
                icon: "warning",
            });
            return;
        }
        
        // User erhalten
        let getStringStudent = '/student?email=' + encodeURIComponent(emailUser);
        let data_student = await this._app.backend.fetch("GET", getStringStudent);
        this._dataset_student = data_student[0];

        // Falls die E-Mail nicht vorhanden ist
        if (!this._dataset_student) {
            swal({
                title: "Achtung",
                text: "Die eingegebene E-Mail nicht registriert.\nBitte überprüfen sie die E-Mail oder registrieren Sie sich.",
                 icon: "error",
            });
            return;
        }

        // Falls das Passwort nicht mit dem Datensatz übereinstimmt
        let p = this._inputPassword.value.trim();
        if (p != this._dataset_student.password) {
            swal({
                title: "Achtung",
                text: "Bitte prüfen Sie E-Mail oder Passwort.",
                icon: "warning",
            });
            return;
        }
        
        // Logged des Datensatzes auf "y" setzen und in der Datenbank über PUT speichern
        this._dataset_student.logged = "y";
        let stringID = "/student/" + this._dataset_student._id;

        try {
            await this._app.backend.fetch("PUT", stringID, {body: this._dataset_student});
        } catch (ex) {
            swal({
                title: "Fehler",
                text: "Bei der Anfrage mit dem Server gab es Probleme. Wenden Sie sich an den Support oder versuchen Sie es später noch einmal.",
                icon: "error",
            });
            console.log(ex);
            return;
        }
        
        // Beim Klick des Logins zur Startseite
        try {
            location.hash = "#/";
        } catch {
            swal({
                title: "Fehler",
                text: "Beim Laden der Startseite gab es einen Fehler. Bitte veruschen sie es erneut",
                icon: "error",
            });
            console.log(ex);
            return;
        }

    }
    
    /**
     * Link zur Registrier Seite
     */
    toRegister() {
        location.hash = "#/register/";
    }
};
