"use strict";

import Page from "../page.js";
import HtmlTemplate from "./login.html";

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

        this._emptyMessageElement = null;
        this._toReg = null;

        this._dataset_student = null;

        this._inputEmail = null,
        this._inputPassword = null;
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
        await this._updateList();
        // HTML-Inhalt nachladen
        await super.init();
        this._title = "Login";

        this._inputEmail = this._mainElement.querySelector("#email");
        this._inputPassword = this._mainElement.querySelector("#password");

        let saveButton = this._mainElement.querySelector(".btn.auth-btn");
        saveButton.addEventListener("click", () => this._login());

        let toRegLink = this._mainElement.querySelector(".toRegister");
        toRegLink.addEventListener("click", () => this.toRegister());
    }

    async _login() {
        if (this._inputEmail.value.trim() == "" || this._inputPassword.value.trim() == "") {
            alert("Password or Email missing!");
            return;
        }
        // User erhalten
        let getStringUser = '/student?email=' + this._inputEmail.value.trim();
        let data_student = await this._app.backend.fetch("GET", getStringUser);

        this._dataset_student = data_student[0];
    
        let p = this._inputPassword.value.trim();
        if (p != this._dataset_student.password) {
            alert("Wrong password!");
            return;
        }
        
        this._dataset_student.logged = "y";
        let stringID = "/student/" + this._dataset_student._id;

        let a = await this._app.backend.fetch("PUT", stringID, {body: this._dataset_student});
        location.hash = "#/";
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

    toRegister() {
        location.hash = "#/register/";
    }
};
