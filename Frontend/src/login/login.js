"use strict";

import Page from "../page.js";
import HtmlTemplate from "./login.html";
import swal from 'sweetalert';

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
     *
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        this._title = "Login";
        await this._updateList();

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

        if (!this._dataset_student) {
            swal({
                title: "Achtung",
                text: "Die eingegebene E-Mail nicht registriert.\nBitte überprüfen sie die E-Mail oder registrieren Sie sich.",
                 icon: "error",
            });
            return;
        }

        let p = this._inputPassword.value.trim();
        if (p != this._dataset_student.password) {
            swal({
                title: "Achtung",
                text: "Bitte prüfen Sie E-Mail oder Passwort.",
                icon: "warning",
            });
            return;
        }
        
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

        location.hash = "#/";
    }

    /**
     * Methode um die Listeneinträge (je nach eingeloggtem User) hinzuzufügen
     */
    async _updateList() {
        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        console.log("UPDATING NAVIGATION BAR - LOGIN");

        document.querySelector("#lin1").classList.add("hidden");
        document.querySelector("#lin2").classList.add("hidden");
        document.querySelector("#lin3").classList.add("hidden");

        document.querySelector("#lout1").classList.add("hidden");
        document.querySelector("#lout2").classList.add("hidden");

        if (_dataLoggedStudent.length == 0) {
            console.log("IF USER LOGGED OUT")
            console.log("==================");
            document.querySelector("#lout1").classList.remove("hidden");
            document.querySelector("#lout2").classList.remove("hidden");

            document.querySelector("#lin1").classList.add("hidden");
            document.querySelector("#lin2").classList.add("hidden");
            document.querySelector("#lin3").classList.add("hidden");
            return;
        } else {
            console.log("IF USER LOGGED IN")
            console.log("=================");
            document.querySelector("#lin1").classList.remove("hidden");
            document.querySelector("#lin2").classList.remove("hidden");
            document.querySelector("#lin3").classList.remove("hidden");

            document.querySelector("#lout1").classList.add("hidden");
            document.querySelector("#lout2").classList.add("hidden");
        }

    }

    toRegister() {
        location.hash = "#/register/";
    }
};
