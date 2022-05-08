"use strict";

import swal from "sweetalert";
import Page from "../page.js";
import HtmlTemplate from "./page-edit.html";
import { _updateList, checkForLogin, _logout } from "../utils.js";

/**
 * Klasse PageEdit: Stellt die Seite zum Anlegen oder Bearbeiten einer Adresse
 * zur Verfügung.
 */
export default class PageEdit extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     * @param {Integer} editId ID des bearbeiteten Datensatzes
     */
    constructor(app, editId) {
        super(app, HtmlTemplate);
        // Datensatz
        this._datasetLoggedStudent = null;

        // Eingabefelder
        this._pro = null;
        this._fName = null;
        this._lName = null;
        this._mNum = null;
        this._fak = null;
        this._kurs = null;
        this._dir = null;
        this._num = null;
        this._about = null;
        this._email = null;
        this._p = null;
        this._pr = null;

        // Button
        this._editButton = null;
        this._delButton = null;
    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     *
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        await _updateList(this._app);
        this._title = "Bearbeiten";

        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        this._datasetLoggedStudent = _dataLoggedStudent[0];

        let boolean = checkForLogin(this._datasetLoggedStudent);

        if (boolean){
            this._updateID = this._datasetLoggedStudent._id;

            this.updateFormInputs();
            
            let logout = document.querySelector("#logout-btn");
            logout.addEventListener("click", async () => await _logout(this._app));

            this._delButton = this._mainElement.querySelector("#del");
            this._delButton.addEventListener("click", async () => await this._delete())

            this._editButton = this._mainElement.querySelector("#edit");
            this._editButton.addEventListener("click", () => this._enableEditAndSave(this._datasetLoggedStudent));
        }
    }

    async _enableEditAndSave() {
        let inputFields = this._mainElement.querySelectorAll(".input");

        if (this._editButton.value == "edit") {
            this._editButton.classList.remove("btn-primary");
            this._editButton.classList.add("btn-outline-primary");

            this._editButton.innerText= "Speichern"
            this._editButton.value = "save";

            for (let i in inputFields) {
                inputFields[i].disabled = 0;
            }

            return;
        } else {
            swal({
                title: "Hinweis",
                text: "Sind Sie sicher das SIe ihre Daten speichern möchten?",
                icon: "info",
                buttons: ["Schließen", "Ja"]
            })
            .then(async (yes) => {
                if (yes) {
                    // Eingabewerte Setzen
                    this._datasetLoggedStudent.pronoun      = this._pro.value;
                    this._datasetLoggedStudent.first_name   = this._fName.value.trim();
                    this._datasetLoggedStudent.last_name    = this._lName.value.trim();
                    this._datasetLoggedStudent.fakultaet    = this._fak.value;
                    this._datasetLoggedStudent.course       = this._kurs.value;
                    this._datasetLoggedStudent.direction    = this._dir.value.trim();
                    this._datasetLoggedStudent.course_id    = this._num.value.trim();
                    
                    // About Text überprüfen
                    let aboutText = this._about.value.trim();
                    if (aboutText.length > 25){
                        swal({
                            title: "Achtung",
                            text: "Der eingegebene Text ist Länger als 25 Zeichen!",
                            icon: "warning",
                        });
                        return;
                    }
                    this._datasetLoggedStudent.about        = aboutText;

                    // Passwort überprüfen
                    let p = this._p.value.trim();
                    let pr = this._pr.value.trim();
                    // Passwort zu kurz
                    if (p.length < 8) {
                        swal({
                            title: "Achtung",
                            text: "Das eingegebene Passwort hat weniger als 8 zeichen",
                            icon: "warning",
                        });
                        return; 
                    }

                    // Passwort stimmt nicht überein
                    if (p != pr) {
                        swal({
                            title: "Achtung",
                            text: "Das eingegebene Passwort stimmt nicht überein!",
                            icon: "warning",
                        });
                        return;
                    }
                    this._datasetLoggedStudent.password      = p;

                    // Updaten
                    let postUrl = "/student/" + this._updateID;
                    try {
                        await this._app.backend.fetch("PUT", postUrl, {body: this._datasetLoggedStudent});
                    } catch (ex) {
                        swal({
                            title: "Fehler",
                            text: "Bei der Anfrage mit dem Server gab es Probleme. Wenden Sie sich an den Support oder versuchen Sie es später noch einmal.",
                            icon: "error",
                        });
                        console.log(ex);
                        return;
                    }

                    // Button zurücksetzen
                    this._editButton.innerHTML = "Bearbeiten"
                    this._editButton.value = "edit";

                    // Felder deaktivieren
                    for (let i in inputFields) {
                        inputFields[i].disabled = 1;
                    };

                    this.updateFormInputs();
                } else {
                    this._editButton.classList.remove("btn-outline-primary");
                    this._editButton.classList.add("btn-primary");
                    
                    this._editButton.innerHTML = "Bearbeiten"
                    this._editButton.value = "edit";

                    for (let i in inputFields) {
                        inputFields[i].disabled = 1;
                    };
                };
            });
        }
    }

    /**
     * Methode zum Löschen des Nutzers anhand der ID
     */
    async _delete() {
        swal({
            title: "Hinweis",
            text: "Account löschen?",
            icon: "error",
            buttons: ["Schließen", "Ja"]
        })
        .then(async (yes) => {
            if (yes) {
            console.log("DELETING USER");

            let stringID = "/student/" + this._updateID;

            try {
                await this._app.backend.fetch("DELETE", stringID);
            } catch (ex) {
                console.log("Fehler wegen leerem JSOn (Gateway Problem");
            }

            console.log("=================");
            location.hash = "#/login/";
            } else {
                return;
            };
        });
    }

    /**
     * Methode um die angezeigten Werte zu ersetzen
     */
    updateFormInputs() {
        console.log("UPDATING VALUES - EDIT");
        // Values setzen
        this._pro = this._mainElement.querySelector("#pronoun");
        this._pro.value = this._datasetLoggedStudent.pronoun;


        this._fName = this._mainElement.querySelector("#firstName");
        this._fName.value = this._datasetLoggedStudent.first_name;

        this._lName = this._mainElement.querySelector("#lastName");
        this._lName.value = this._datasetLoggedStudent.last_name;

        this._mNum = this._mainElement.querySelector("#matrikelNr");
        this._mNum.value = this._datasetLoggedStudent.matrikel_nr;

        this._fak = this._mainElement.querySelector("#fak");
        this._fak.value = this._datasetLoggedStudent.fakultaet;

        this._kurs = this._mainElement.querySelector("#kurs");
        this._kurs.value = this._datasetLoggedStudent.course;

        this._dir = this._mainElement.querySelector("#dir");
        this._dir.value = this._datasetLoggedStudent.direction;

        this._num = this._mainElement.querySelector("#num");
        this._num.value = this._datasetLoggedStudent.course_id;

        this._about = this._mainElement.querySelector("#about");
        this._about.value = this._datasetLoggedStudent.about;

        this._email = this._mainElement.querySelector("#email");
        this._email.value = this._datasetLoggedStudent.email;

        this._p = this._mainElement.querySelector("#p");
        this._pr = this._mainElement.querySelector("#pr");
        console.log("==================");
    }
};
