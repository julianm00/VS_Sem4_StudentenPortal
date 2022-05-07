"use strict";

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
        this._permMessageElement = null;

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
        let data_logged = await this._app.backend.fetch("GET", "/student?logged=y");
        // HTML-Inhalt nachladen
        await super.init();
        await this._updateList();
        this._title = "Übersicht";

        console.log(data_logged);
        if(!data_logged.length) {
            location.hash = "#/login/";
            return;
        }

        let data_student = await this._app.backend.fetch("GET", "/student?logged=n");
        console.log(data_student);

        this._emptyMessageElement = this._mainElement.querySelector(".empty-placeholder");
        this._permMessageElement = this._mainElement.querySelector(".perm-placeholder");

        if(data_student.length) {
            this._emptyMessageElement.classList.add("hidden");
        }

        let olStudentElement = this._mainElement.querySelector("ol");

        let templateStudentElement = this._mainElement.querySelector(".list-student-entry");
        let templateStudentHtml = templateStudentElement.outerHTML;
        templateStudentElement.remove();

        for(let index in data_student) {
            let dataset_student = data_student[index];
            let htmlStudent = templateStudentHtml;

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

            if(data_logged.length) {
                let dummyStudentElement = document.createElement("div");
                dummyStudentElement.innerHTML = htmlStudent;
                let liStudentElement = dummyStudentElement.firstElementChild;
                liStudentElement.remove();
                olStudentElement.appendChild(liStudentElement);
            }

        }

        let logout = document.querySelector("#logout-btn");
        logout.addEventListener("click", () => this._logout());
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

    async _logout() {
        let data_student = await this._app.backend.fetch("GET", "/student?logged=y");
        let dataset_student = data_student[0];

        let stringID = "/student/" + dataset_student._id;
        dataset_student.logged = "n";

        await this._app.backend.fetch("PUT", stringID, {body: dataset_student});

        location.hash = "#/login/";
    }
};
