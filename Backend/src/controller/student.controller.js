import { wrapHandler } from "../utils.js";
import RestifyError from "restify-errors";
import StudentService from "../service/student.service.js";

/**
 * HTTP-Controller für ale Anfragen an /student/...
 */
export default class StudentController {
    /**
     * Konstruktor, hier werden HTTP-Handler Methoden registriert
     */
    constructor(server, prefix) {
        this._service = new StudentService();
        this.prefix = prefix;
        // Collection: Student (Liste von Studenten)
        server.get(prefix, wrapHandler(this, this.search));
        server.post(prefix, wrapHandler(this, this.create));

        // Ressource: Student (einzelner Datensatz)
        server.get(prefix + "/:id", wrapHandler(this, this.read));
        server.put(prefix + "/:id", wrapHandler(this, this.update));
        server.patch(prefix + "/:id", wrapHandler(this, this.update));
        server.del(prefix + "/:id", wrapHandler(this, this.delete));
    }

    /**
     * Helper für Einfügen des HATEOAS-Prinzips 
     */
    _insertHateoasLinks(result) {
        let url = `${this.prefix}/${result.id}`;

        result.links = {
            read:   {url: url, method: "GET"},
            update: {url: url, method: "PUT"},
            patch:  {url: url, method: "PATCH"},
            delete: {url: url, method: "DELETE"}
        }
    }

    /**
     * GET /student
     * Liste von Studenten liefern
     */
    async search(req, res, next) {
        // Suche in DB
        let result = await this._service.search(req.query);

        // HATEOAS-Links
        result.forEach(entity => this._insertHateoasLinks(entity))

        // Ergebnis zurückliefern
        res.sendResult(result);
        return next();
    }

    /**
     * POST /student
     * Student anlegen
     */
    async create(req, res, next) {
        // Student in DB speichern
        let result = await this._service.create(req.body);

        // HATEOAS Links
        this._insertHateoasLinks(result);

        // Ergebnis zurückliefern
        res.status(201);
        res.header("location", `${this.prefix}/${result.id}`);
        res.sendResult(result);
        return next();
    }

    /**
     * GET /student/:id
     * Lesen eines einzelnen Studentens anhand der ID
     */
    async read(req, res, next) {
        // Einzelnen Student in DB suchen
        let result = await this._service.read(req.params.id);

        // HATEOAS Links
        this._insertHateoasLinks(result);

        if (result) {
            // Gefundener Student senden
            res.sendResult(result);
        } else {
            throw new RestifyError.NotFoundError("Coundn't find a student with this ID");
        }

        return next();
    }

    /**
     * PUT /student/:id
     * POST /student/:id
     * Überschreiben eines einzelnen Studenten
     */
    async update(req, res, next) {
        // Einzelnen Student in DB aktualisieren
        let result = await this._service.update(req.params.id, req.body);

        if (result) {
            // HATEOAS Links
            this._insertHateoasLinks(result);
            
            // Gefundener Student senden
            res.sendResult(result);
        } else {
            throw new RestifyError.NotFoundError("Coundn't find a student with this ID");
        }

        return next();
    }

    /**
     * DELETE /student/:id
     * Löschen eines einzelnen Studenten
     */
    async delete(req, res, next) {
        // Adresse in der Datenbank löschen
        await this._service.delete(req.params.id);

        // Ergebnis zurückliefern
        res.status(204);
        res.sendResult({});
        return next();
    }

}