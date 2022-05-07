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

        this._dataLoggedStudent = null;
        this._dataLoggedStudentDataset = null;

        this._templateStudentDiv = null;
        this._saveContent = null
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
        this._title = "Übersicht";

        if(!this._dataLoggedStudent) {
            location.hash = "#/login/";
            return;
        }

        this._templateStudentDiv = this._mainElement.querySelector(".student-entry");
        let data_student = await this._showStudents("");

        this.updateSelector(data_student, "#kurs", "course");
        this.updateSelector(data_student, "#fak", "fakultaet");
        this.updateSelector(data_student, "#richtung", "direction");
        this.updateSelector(data_student, "#nummer", "course_id");

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

        if(this._dataLoggedStudentDataset.reminder == "y") {
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
                        let stringID = "/student/" + this._dataLoggedStudentDataset._id;
                        this._dataLoggedStudentDataset.reminder = "n";
                        await this._app.backend.fetch("PUT", stringID, {body: this._dataLoggedStudentDataset});
                        break;
                    case "go":
                        location.hash = "#/edit/";
                    return;
                }

        }));
        }

    }
    
    async _updateList() {
        this._dataLoggedStudent = await this._app.backend.fetch("GET", "/student?logged=y");
        this._dataLoggedStudentDataset = this._dataLoggedStudent[0];

        document.querySelector("#lin1").classList.add("hidden");
        document.querySelector("#lin2").classList.add("hidden");
        document.querySelector("#lin3").classList.add("hidden");

        document.querySelector("#lout1").classList.add("hidden");
        document.querySelector("#lout2").classList.add("hidden");

        if (!this._dataLoggedStudent) {
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

    async _logout() {
        let stringID = "/student/" + this._dataLoggedStudentDataset._id;
        this._dataLoggedStudentDataset.logged = "n";

        await this._app.backend.fetch("PUT", stringID, {body: this._dataLoggedStudentDataset});

        location.hash = "#/login/";
    }

    async _updateStudentsFak() {
        let getValue;

        this._dirSel.value = "";
        this._numSel.value = "";
        this._kursSel.value = "";

        let divStudentElement = this._mainElement.querySelector(".students");
        divStudentElement.innerHTML = "";

        if (this._fakSel.value == "") {
            console.log("Test");
            await this._showStudents("");
            return;
        } else {
            getValue = "&fakultaet=" + encodeURIComponent(this._fakSel.value);
            await this._showStudents(getValue);
        }
    }

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

    async _showStudents(val) {
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

            let first_name  = dataset_student.first_name;
            let last_name   = dataset_student.last_name;
            let birthday    = dataset_student.birthday;
            let course      = dataset_student.course;
            let course_id   = dataset_student.course_id;

            htmlStudent = htmlStudent.replace("$FIRST_NAME$", first_name);
            htmlStudent = htmlStudent.replace("$LAST_NAME$", last_name);
            htmlStudent = htmlStudent.replace("$BIRTHDAY$", birthday);
            htmlStudent = htmlStudent.replace("$COURSE$", course);
            htmlStudent = htmlStudent.replace("$COURSE_ID$", course_id);

            let dummyStudentElement = document.createElement("div");
            dummyStudentElement.innerHTML = htmlStudent;
            let liStudentElement = dummyStudentElement.firstElementChild;
            liStudentElement.remove();
            divStudentElement.appendChild(liStudentElement);
        }

        return data_student;
    }

    showMenu() {
        let filterMenu = this._mainElement.querySelector(".selectors");
        if (filterMenu.classList.contains("hidden")) {
            filterMenu.classList.remove("hidden");
        } else {
            filterMenu.classList.add("hidden");
        }

    }

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
