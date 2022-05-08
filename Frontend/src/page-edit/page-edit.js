"use strict";

import Page from "../page.js";
import HtmlTemplate from "./page-edit.html";

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

        // Bearbeiteter Datensatz
        this._editId = editId;

        this._dataset;

        this._dataLoggedStudent = null;
        this._datasetLoggedStudent = null;
        
        // Anzeigefelder
        this._firstNameDisplay = null;
        // Eingabefelder
        this._firstNameInput = null;
        this._lastNameInput  = null;
        this._phoneInput     = null;
        this._emailInput     = null;
    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     *
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();

        await this._updateList();

        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        let _datasetLoggedStudent = _dataLoggedStudent[0];

        if(!_dataLoggedStudent) {
            location.hash = "#/login/";
            return;
        }

        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$FN$", _datasetLoggedStudent.first_name);
        html = html.replace("$LN$", _datasetLoggedStudent.last_name);
        html = html.replace("$BD$", _datasetLoggedStudent.birthday);
        html = html.replace("$FAK$", _datasetLoggedStudent.fakultaet);
        html = html.replace("$DIR$", _datasetLoggedStudent.course);
        html = html.replace("$C_ID$", _datasetLoggedStudent.course_id);
        html = html.replace("$EMAIL$", _datasetLoggedStudent.email);
        
        this._mainElement.innerHTML = html;

        let editButton1 = this._mainElement.querySelector("#edit1");
        editButton1.addEventListener("click", () => this._enableEdit1());

        let saveButton1 = this._mainElement.querySelector("#save1");
        saveButton1.addEventListener("click", () => this._saveData1());

        let editButton2 = this._mainElement.querySelector("#edit2");
        editButton2.addEventListener("click", () => this._enableEdit2());

        let saveButton2 = this._mainElement.querySelector("#save2");
        saveButton2.addEventListener("click", () => this._saveData2());

        // Eingabefelder zur späteren Verwendung merken
        this._firstNameInput = this._mainElement.querySelector("input.first_name");
        this._lastNameInput  = this._mainElement.querySelector("input.last_name");
        this._phoneInput     = this._mainElement.querySelector("input.phone");
        this._emailInput     = this._mainElement.querySelector("input.email");
    }

    /**
     * Speichert den aktuell bearbeiteten Datensatz und kehrt dann wieder
     * in die Listenübersicht zurück.
     */
    async _saveAndExit() {
        // Eingegebene Werte prüfen
        this._dataset._id        = this._editId;
        this._dataset.first_name = this._firstNameInput.value.trim();
        this._dataset.last_name  = this._lastNameInput.value.trim();
        this._dataset.phone      = this._phoneInput.value.trim();
        this._dataset.email      = this._emailInput.value.trim();

        if (!this._dataset.first_name) {
            alert("Geben Sie erst einen Vornamen ein.");
            return;
        }

        if (!this._dataset.last_name) {
            alert("Geben Sie erst einen Nachnamen ein.");
            return;
        }

        // Datensatz speichern
        try {
            if (this._editId) {
                await this._app.backend.fetch("PUT", this._url, {body: this._dataset});
            } else {
                await this._app.backend.fetch("POST", this._url, {body: this._dataset});
            }
        } catch (ex) {
            this._app.showException(ex);
            return;
        }

        // Zurück zur Übersicht
        location.hash = "#/";
    }

    async _enableEdit1() {
        this._mainElement.querySelector("#user-edit").classList.remove("hidden");
        this._mainElement.querySelector("#user").classList.add("hidden");
    }

    async _saveData1() {
        this._mainElement.querySelector("#user-edit").classList.add("hidden");
        this._mainElement.querySelector("#user").classList.remove("hidden");
    }

    async _enableEdit2() {
        this._mainElement.querySelector("#security-edit").classList.remove("hidden");
        this._mainElement.querySelector("#security").classList.add("hidden");
    }

    async _saveData2() {
        this._mainElement.querySelector("#security-edit").classList.add("hidden");
        this._mainElement.querySelector("#security").classList.remove("hidden");
    }

    async _updateList() {
        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        console.log("UPDATING NAVIGATION BAR - EDIT");

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
};
