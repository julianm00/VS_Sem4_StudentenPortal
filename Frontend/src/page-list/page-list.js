"use strict";

import swal from "sweetalert";
import Page from "../page.js";
import HtmlTemplate from "./page-list.html";

/**
 * Klasse PageList: Stellt die Listenübersicht zur Verfügung
 */
export default class PageList extends Page {
    /**
     * Konstruktor.
     *
     * @param {App} app Instanz der App-Klasse
     */
    constructor(app) {
        super(app, HtmlTemplate);

        this._emptyMessageElement = null;

        this._fakSel = null;
        this._kursSel = null;
        this._dirSel = null;
        this._numSel = null;

        this._templateStudentDiv = null;
        this._saveContent = null
    }

    /**
     * HTML-Inhalt und anzuzeigende Daten laden.
     */
    async init() {
        console.log("INITIALISING PAGE - LIST");
        // HTML-Inhalt nachladen
        await super.init();
        this._title = "Übersicht";
        await this._updateList();

        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        let _datasetLoggedStudent = _dataLoggedStudent[0];

        // Tempplate speichern
        this._templateStudentDiv = this._mainElement.querySelector(".student-entry");
        
        // Studenten anzeigen
        let data_student = await this._showStudents("");

        // Dropdownmenu bekommen
        this.updateSelector(data_student, "#kurs", "course");
        this.updateSelector(data_student, "#fak", "fakultaet");
        this.updateSelector(data_student, "#richtung", "direction");
        this.updateSelector(data_student, "#nummer", "course_id");

        // Actionlistener registrieren
        let logout = document.querySelector("#logout-btn");
        logout.addEventListener("click", () => this._logout());

        let filter = this._mainElement.querySelector("#filter");
        filter.addEventListener("click", () => this.showMenu());

        this._fakSel = this._mainElement.querySelector("#fak");
        this._fakSel.addEventListener("change", () => this._updateStudentsFak());
        
        this._kursSel = this._mainElement.querySelector("#kurs");
        this._kursSel.addEventListener("change", () => this._updateStudentsKurs());

        this._dirSel = this._mainElement.querySelector("#richtung");
        this._dirSel.addEventListener("change", () => this._updateStudentsDir());

        this._numSel = this._mainElement.querySelector("#nummer");
        this._numSel.addEventListener("change", () => this._updateStudentsNum());

        // Alert falls Reminder aktiv ist (Noch nie auf Edit Seite gewesen)
        if (_datasetLoggedStudent) {
            if(_datasetLoggedStudent.reminder == "y") {
                swal({
                    title: "Reminder",
                    text: "Sie haben noch nich alle Ihre Daten festgelegt!\nFüllen Sie die Daten bitte, sodass ihre Komolitonen Sie finden können.",
                    icon: "info",
                    buttons: {
                        cancel: "Schließen",
                        rem: "Nicht mehr erinnern",
                        go: "Los gehts!"
                    }
                })
                .then((async value =>  {    
                    switch(value) {
                        case "cancel":
                            break;
                        case "rem":
                            let stringID = "/student/" + _datasetLoggedStudent._id;
                            _datasetLoggedStudent.reminder = "n";
                            await this._app.backend.fetch("PUT", stringID, {body: _datasetLoggedStudent});
                            break;
                        case "go":
                            location.hash = "#/edit/";
                        return;
                    }

            }));
            }
        }
        console.log("==================");
    }

    /**
     * Methode zum anzeigen der Studenten mit der ausgewählten Fakultät
     */
    async _updateStudentsFak() {
        let getValue;

        this._dirSel.value = "";
        this._numSel.value = "";
        this._kursSel.value = "";

        let divStudentElement = this._mainElement.querySelector(".students");
        divStudentElement.innerHTML = "";

        if (this._fakSel.value == "") {
            await this._showStudents("");
            return;
        } else {
            getValue = "&fakultaet=" + encodeURIComponent(this._fakSel.value);
            await this._showStudents(getValue);
        }
    }

    /**
     * Methode zum anzeigen der Studenten mit der ausgewählten Kursnummer
     */
    async _updateStudentsNum() {
        let getValue;

        this._dirSel.value = "";
        this._fakSel.value = "";
        this._kursSel.value = "";

        let divStudentElement = this._mainElement.querySelector(".students");
        divStudentElement.innerHTML = "";

        if (this._numSel.value == "") {
            await this._showStudents("");
            return;
        } else {
            getValue = "&course_id=" + encodeURIComponent(this._numSel.value);
            await this._showStudents(getValue);
        }
    }

    /**
     * Methode zum anzeigen der Studenten mit der ausgewählten Studienrichtung
     */
    async _updateStudentsDir() {
        let getValue;

        this._numSel.value = "";
        this._fakSel.value = "";
        this._kursSel.value = "";

        let divStudentElement = this._mainElement.querySelector(".students");
        divStudentElement.innerHTML = "";

        if (this._dirSel.value == "") {
            await this._showStudents("");
            return;
        } else {
            getValue = "&direction=" + encodeURIComponent(this._dirSel.value);
            await this._showStudents(getValue);
        }
    }

    /**
     * Methode zum anzeigen der Studenten mit dem ausgewählten Studiengang
     */
    async _updateStudentsKurs() {
        let getValue;

        this._numSel.value = "";
        this._fakSel.value = "";
        this._dirSel.value = "";

        let divStudentElement = this._mainElement.querySelector(".students");
        divStudentElement.innerHTML = "";

        if (this._kursSel.value == "") {
            await this._showStudents("");
            return;
        } else {
            getValue = "&course=" + encodeURIComponent(this._kursSel.value);
            await this._showStudents(getValue);
        }
    }

    /**
     * Methode zum aktualisieren der angezeigten Studenten
     * @param {*} val Query-Parameter des ausgewählten Filters
     */
    async _showStudents(val) {
        console.log("UPDATING STUDENT LIST");
        let getString = "/student?logged=n" + val;
        let data_student = await this._app.backend.fetch("GET", getString);

        if(!data_student.length) {
            swal({
                title: "Hoppla",
                text: "Scheinbar gibt es noch keine anderen Studenten hier im Portal!\nLade deine Freunde an der DHBW gerne ein!",
                icon: "info",
            });
        }
        
        let divStudentElement = this._mainElement.querySelector(".students");
        let templateStudentDivHtml = this._templateStudentDiv.outerHTML;
        this._templateStudentDiv.remove();

        for(let index in data_student) {
            let dataset_student = data_student[index];
            let htmlStudent = templateStudentDivHtml;

            let pronoun     = dataset_student.pronoun;
            let first_name  = dataset_student.first_name;
            let last_name   = dataset_student.last_name;
            let birthday    = dataset_student.birthday;
            let course      = dataset_student.course;
            let course_id   = dataset_student.course_id;
            let about       = dataset_student.about;

            htmlStudent = htmlStudent.replace("$PRONOUN$", pronoun);
            htmlStudent = htmlStudent.replace("$FIRST_NAME$", first_name);
            htmlStudent = htmlStudent.replace("$LAST_NAME$", last_name);
            htmlStudent = htmlStudent.replace("$BIRTHDAY$", birthday);
            htmlStudent = htmlStudent.replace("$COURSE$", course);
            htmlStudent = htmlStudent.replace("$COURSE_ID$", course_id);
            htmlStudent = htmlStudent.replace("$ABOUT$", about);

            let dummyStudentElement = document.createElement("div");
            dummyStudentElement.innerHTML = htmlStudent;
            let liStudentElement = dummyStudentElement.firstElementChild;
            liStudentElement.remove();
            divStudentElement.appendChild(liStudentElement);
        }

        console.log("==================");
        return data_student;
    }

    /**
     * Methode um die Listeneinträge (je nach eingeloggtem User) hinzuzufügen
     */
    async _updateList() {
        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        console.log("UPDATING NAVIGATION BAR - LIST");

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
     * Logout Button Funktion
     * Überschreiben des "Logged" Feldes des eingeloggten Studenten mit "n" (no)
     */
    async _logout() {
        console.log("LOGGING OUT")
        let _dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        let _datasetLoggedStudent = _dataLoggedStudent[0];

        let stringID = "/student/" + _datasetLoggedStudent._id;
        _datasetLoggedStudent.logged = "n";

        try {
            await this._app.backend.fetch("PUT", stringID, {body: _datasetLoggedStudent});
        } catch (ex) {
            swal({
                title: "Fehler",
                text: "Bei der Anfrage mit dem Server gab es Probleme. Wenden Sie sich an den Support oder versuchen Sie es später noch einmal.",
                icon: "error",
            });
            console.log(ex);
            return;
        }
        console.log("=================");
        location.hash = "#/login/";
    }

    /**
     * Anzeigen des Menus auf dem Mobilgerät durch Button Klick
     */
    showMenu() {
        let filterMenu = this._mainElement.querySelector(".selectors");
        if (filterMenu.classList.contains("hidden")) {
            filterMenu.classList.remove("hidden");
        } else {
            filterMenu.classList.add("hidden");
        }
    }

    /**
     * Befüllen der Dropdown-Menus mit eindeutigen werten
     * @param {*} data Daten eines Collection (aller Studenten)
     * @param {*} selectID ID des Selects
     * @param {*} option Feld in der Collection
     */
    updateSelector(data, selectID, option) {
        let array = []; 
        let uniques = []
        for(let index in data) {
            let dataset_student = data[index];
            array.push(dataset_student[option])
            uniques = [...new Set(array)]
            uniques.sort();
        }

        let select = this._mainElement.querySelector(selectID);
        for (let index in uniques) {
            let option = new Option(uniques[index], uniques[index]);
            select.add(option);
        } 
    }
};
