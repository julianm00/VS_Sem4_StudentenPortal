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

        this._dataset_cuser = {
            matrikel_nr: "",
            first_name: "",
            last_name: "",
            birthday: "",
            course: "",
            course_id: "",
            email: "",
            password: ""
        }


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
        // HTML-Inhalt nachladen
        await super.init();
        this._title = "Register";

        this._updateList();

        this._inputEmail = this._mainElement.querySelector("#email");
        this._inputPassword = this._mainElement.querySelector("#password");

        let saveButton = this._mainElement.querySelector(".btn.auth-btn");
        saveButton.addEventListener("click", () => this._login());

        let toRegLink = this._mainElement.querySelector(".toRegister");
        toRegLink.addEventListener("click", () => this.toRegister());
        //// TODO: Anzuzeigende Inhalte laden mit this._app.backend.fetch() ////
        //// TODO: Inhalte in die HTML-Struktur einarbeiten ////
        //// TODO: Neue Methoden für Event Handler anlegen und hier registrieren ////
    }

    async _login() {
            if (this._inputEmail.value.trim() == "" || this._inputPassword.value.trim() == "") {
                alert("Password or Email missing!");
                return;
            }
            // User erhalten
            let getStringUser = '/user?email=' + this._inputEmail.value.trim();
            let _data_user = await this._app.backend.fetch("GET", getStringUser);
            console.log(_data_user);
            
            let p = this._inputPassword.value.trim();
            if (p != _data_user[0].password) {
                alert("Wrong password!");
                return;
            }

            let getStringStudent = '/student?matrikel_nr=' + _data_user[0].matrikel_nr;
            let _data_student = await this._app.backend.fetch("GET", getStringStudent);
            console.log(getStringStudent);

            this._dataset_cuser.matrikel_nr = _data_student[0].matrikel_nr;
            this._dataset_cuser.first_name  = _data_student[0].first_name;
            this._dataset_cuser.last_name   = _data_student[0].last_name;
            this._dataset_cuser.birthday    = _data_student[0].birthday;
            this._dataset_cuser.course      = _data_student[0].course;
            this._dataset_cuser.course_id   = _data_student[0].course_id;
            this._dataset_cuser.email       = _data_user[0].email;
            this._dataset_cuser.password    = _data_user[0].password;

            console.log(this._dataset_cuser);

            let id_student = _data_student[0]._id;
            let id_user = _data_user[0]._id;
            
            let stringDelS = "/student/" + id_student;
            let stringDelU = "/user/" + id_user;

            await this._app.backend.fetch("POST", '/cuser', {body: this._dataset_cuser});
            console.log("added");
             
            try {
                await this._app.backend.fetch("DELETE", stringDelS);
            } catch (ex) {
                console.log("Fehler wegen Gateway Spezifikation, da leeres JSON");
            }

            try {
                await this._app.backend.fetch("DELETE", stringDelU);
            } catch (ex2) {
                console.log("Fehler wegen Gateway Spezifikation, da leeres JSON");
            }

            location.hash = "#/";

    }

    

    async _updateList() {
        let data_cuser = await this._app.backend.fetch("GET", "/cuser");

        document.querySelector("#lin1").classList.add("hidden");
        document.querySelector("#lin2").classList.add("hidden");
        document.querySelector("#lin3").classList.add("hidden");

        document.querySelector("#lout1").classList.add("hidden");
        document.querySelector("#lout2").classList.add("hidden");

        if (!data_cuser.length) {
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
