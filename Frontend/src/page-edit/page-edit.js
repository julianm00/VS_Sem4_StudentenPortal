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
     * HINWEIS: Durch die geerbte init()-Methode wird `this._mainElement` mit
     * dem <main>-Element aus der nachgeladenen HTML-Datei versorgt. Dieses
     * Element wird dann auch von der App-Klasse verwendet, um die Seite
     * anzuzeigen. Hier muss daher einfach mit dem üblichen DOM-Methoden
     * `this._mainElement` nachbearbeitet werden, um die angezeigten Inhalte
     * zu beeinflussen.
     *
     * HINWEIS: In dieser Version der App wird mit dem üblichen DOM-Methoden
     * gearbeitet, um den finalen HTML-Code der Seite zu generieren. In größeren
     * Apps würde man ggf. eine Template Engine wie z.B. Nunjucks integrieren
     * und den JavaScript-Code dadurch deutlich vereinfachen.
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        await this._updateList();

        let returnArray = await this._app.backend.fetch("GET", '/student?logged=y'); 
        this._dataset = returnArray[0];

        // Platzhalter im HTML-Code ersetzen
        let html = this._mainElement.innerHTML;
        html = html.replace("$FN$", this._dataset.first_name);
        html = html.replace("$LN$", this._dataset.last_name);
        html = html.replace("$BD$", this._dataset.birthday);
        //html = html.replace("$FAK$", this._dataset.fakultät);
        html = html.replace("$DIR$", this._dataset.course);
        html = html.replace("$C_ID$", this._dataset.course_id);
        html = html.replace("$EMAIL$", this._dataset.email);
        
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
        let data_student = await this._app.backend.fetch("GET", "/student?logged=y");

        document.querySelector("#lin1").classList.add("hidden");
        document.querySelector("#lin2").classList.add("hidden");
        document.querySelector("#lin3").classList.add("hidden");

        document.querySelector("#lout1").classList.add("hidden");
        document.querySelector("#lout2").classList.add("hidden");

        if (!data_student.length) {
            document.querySelector("#lout1").classList.remove("hidden");
            document.querySelector("#lout2").classList.remove("hidden");

        } else {
            document.querySelector("#lin1").classList.remove("hidden");
            document.querySelector("#lin2").classList.remove("hidden");
            document.querySelector("#lin3").classList.remove("hidden");

            document.querySelector("#lout1").classList.add("hidden");
            document.querySelector("#lout2").classList.add("hidden");
        }

    }
};
