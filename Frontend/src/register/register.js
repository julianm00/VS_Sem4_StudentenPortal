"use strict";

import Page from "../page.js";
import HtmlTemplate from "./register.html";

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

        this._toLog = null;

        this._dataset_student = {
            first_name: "",
            last_name: "",
            matrikel_nr: "",
            birthday: "",
            course: "",
            course_id: "",
            email: "",
            password: ""
        }

        this._inputMatrikelNr = null;
        this._inputEmail = null,
        this._inputPassword = null;
        this._inputPasswordRepeat = null;
        this._inputFirstName = null;
        this._inputLastName = null;
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
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        await this._updateList();
        this._title = "Register";

        this._inputMatrikelNr       = this._mainElement.querySelector("#matrikelNr");
        this._inputEmail            = this._mainElement.querySelector("#email");
        this._inputPassword         = this._mainElement.querySelector("#password");
        this._inputPasswordRepeat   = this._mainElement.querySelector("#passwordRepeat");
        this._inputFirstName        = this._mainElement.querySelector("#firstName");
        this._inputLastName         = this._mainElement.querySelector("#lastName");

        /*
        let saveButton = this._mainElement.querySelector(".btn.auth-btn");
        saveButton.addEventListener("click", () => this._register());

        let toLogLink = this._mainElement.querySelector(".toLogin");
        toLogLink.addEventListener("click", () => this.toLogin()); */
    }

    async _register() {
        // Student
        this._dataset_student.first_name    = this._inputFirstName.value.trim();
        this._dataset_student.last_name     = this._inputLastName.value.trim();
        this._dataset_student.matrikel_nr   = this._inputMatrikelNr.value.trim();
        this._dataset_student.email         = this._inputEmail.value.trim();
        let p                               = this._inputPassword.value.trim();
        let pr                              = this._inputPasswordRepeat.value.trim();

        this._dataset_student.password      = p;

        try {
            await this._app.backend.fetch("POST", '/student', {body: this._dataset_student});
        } catch (ex) {
            alert(ex);
            return;
        }

        location.hash = "#/login/";
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

    toLogin() {
        location.hash = "#/login/";
    }
};
