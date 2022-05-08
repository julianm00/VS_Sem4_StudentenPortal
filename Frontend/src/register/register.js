"use strict";

import Page from "../page.js";
import HtmlTemplate from "./register.html";
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

        // Datensatz des zu erstellenden Studenten
        this._dataset_student = {
            first_name: "",
            last_name: "",
            matrikel_nr: "",
            email: "",
            password: ""
        }

        // Inputfelder der Registrierseite
        this._inputMatrikelNr = null;
        this._inputEmail = null,
        this._inputPassword = null;
        this._inputPasswordRepeat = null;
        this._inputFirstName = null;
        this._inputLastName = null;
    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     */
    async init() {
        // HTML-Inhalt nachladen
        await super.init();
        this._updateList();
        this._title = "Register";

        // Inputfelder bekommen
        this._inputFirstName        = this._mainElement.querySelector("#firstName");
        this._inputLastName         = this._mainElement.querySelector("#lastName");
        this._inputMatrikelNr       = this._mainElement.querySelector("#matrikelNr");
        this._inputEmail            = this._mainElement.querySelector("#email");
        this._inputPassword         = this._mainElement.querySelector("#password");
        this._inputPasswordRepeat   = this._mainElement.querySelector("#passwordRepeat")

        // Actionlistener registrieren
        let saveButton = this._mainElement.querySelector(".btn.auth-btn");
        saveButton.addEventListener("click", () => this._register());

        let toLogLink = this._mainElement.querySelector(".toLogin");
        toLogLink.addEventListener("click", () => this.toLogin());
    }

    /**
     * Regestrieren eines Nutzers in der Datenbank
     * 
     * Dazu werden zunächst die Inhalte der Felder ausgelesen
     * Falls diese nicht alle befüllt sind wird eine Warnung ausgeworfen
     * Falls die Matrikelnummer schon vergeben ist wird ein Fehler geworfen
     * Falls die Email nicht dem Format nachname.vorname@dh-karlruhe.de entspricht wird ebenfalls ein Fehler geworfen
     * Falls die Email schon registriert wird wird ebenfalls ein Fehler geworfen.
     * Falls das Passwort nicht übereinstimmt wird ein Fehler geworfen
     */
    async _register() {
        
        this._dataset_student.first_name    = this._inputFirstName.value.trim();
        this._dataset_student.last_name     = this._inputLastName.value.trim();
        this._dataset_student.matrikel_nr   = this._inputMatrikelNr.value.trim();
        this._dataset_student.email         = this._inputEmail.value.trim();
        let p                               = this._inputPassword.value.trim();
        let pr                              = this._inputPasswordRepeat.value.trim();
        
        // Pflichtfelder überprüfen
        if (!this._dataset_student.first_name || !this._dataset_student.last_name || !this._dataset_student.matrikel_nr || !this._dataset_student.email || !p || !pr) {
            swal({
                title: "Achtung",
                text: "Bitte befüllen sie die Pflichtfelder!",
                icon: "warning",
            });
            return;
        };

        // Matrikelnummer 7 Zeichen
        if (this._dataset_student.matrikel_nr.length != 7) {
            swal({
                title: "Achtung",
                text: "Die eingegebene Matrikelnummer hat ein fehlerhaftes Format",
                icon: "warning",
            });
            return;
        };

        // Matrikelnummer schon registriert
        let data_allStudents = await this._app.backend.fetch("GET", "/student");
        let matrikelNrDoppelt = false;
        for (let index in data_allStudents) {
            let student_dataset = data_allStudents[index];
            if (this._dataset_student.matrikel_nr == student_dataset.matrikel_nr) {
                matrikelNrDoppelt = true;
            }
        };
        if (matrikelNrDoppelt) {
            swal({
                title: "Achtung",
                text: "Die eingegebene Matrikelnummer ist schon registriert.\nBitte überprüfen sie die Nummer oder wenden Sie sich and die DHBW.",
                icon: "error",
            });
            return;
        };

        // Email Format
        this._dataset_student.email = this._dataset_student.email.toLowerCase();
        let regExp = new RegExp("^[a-zA-Z0-9._%+-]+@dh-karlsruhe\.de$");
        if (!regExp.test(this._dataset_student.email)) {
            swal({
                title: "Achtung",
                text: "Die eingegebene E-Mail entspricht nicht dem Format.\nAchten Sie darauf, dass sie der erhaltenen E-Mail der DHBW entspricht.\nnachname.vorname@dh-karlsruhe.de",
                icon: "warning",
            });
            return;
        }
        
        // Email vorhanden
        let emailDoppelt = false;
        for (let index in data_allStudents) {
            let student_dataset = data_allStudents[index];
            if (this._dataset_student.email == student_dataset.email) {
                emailDoppelt = true;
            }
        }
        if (emailDoppelt) {
            swal({
                title: "Achtung",
                text: "Die eingegebene E-Mail ist schon registriert.\nBitte überprüfen sie die E-Mail oder wenden Sie sich and die DHBW.",
                icon: "error",
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
        this._dataset_student.password      = p;

        try {
            await this._app.backend.fetch("POST", '/student', {body: this._dataset_student});
        } catch (ex) {
            swal({
                title: "Fehler",
                text: "Bei der Anfrage mit dem Server gab es Probleme. Wenden Sie sich an den Support oder versuchen Sie es später noch einmal.",
                icon: "error",
            });
            console.log(ex);
            return;
        }

        swal({
            title: "Registriert!",
            text: "Du kannst dich jetzt anmelden.",
            icon: "success",
            buttons: ["Schließen", "Los gehts!"]
            })
            .then((login) => {
            if (login) {
                location.hash = "#/login/";
            } else {
                this._inputFirstName.value = "";
                this._inputLastName.value = "";
                this._inputMatrikelNr.value = "";
                this._inputEmail.value = "";
                this._inputPassword.value = "";
                this._inputPasswordRepeat.value = "";
            }
        });
    }

    /**
     * Methode um die Listeneinträge (je nach eingeloggtem User) hinzuzufügen
     */
    async _updateList() {
        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        console.log("UPDATING NAVIGATION BAR - REGISTER");

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

    /**
     * Registrier Button Methode zum Login
     */
    toLogin() {
        location.hash = "#/login/";
    }
};
