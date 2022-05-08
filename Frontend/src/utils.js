import swal from "sweetalert";

/**
 * Methode um die Listeneinträge (je nach eingeloggtem User) hinzuzufügen
 */
export async function _updateList(app) {
    let _dataLoggedStudent = await app.backend.fetch("GET", "/student?logged=y");
    console.log("UPDATING NAVIGATION BAR");

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
 * Schaut ob es eingeloggte Nutzer gibt. Falls dem nicht so ist wird der Nutzer zum Login
 * geschickt. So wird verhindert, dass die Seite List und Edit ohne Login aufgrerufen werden
 * @param {*} data Datensatz mit allen Studenten die eingeloggt sein könnten
 * @returns 
 */
export function checkForLogin(data) {
    if(data == null) {
        location.hash = "#/login/";
        return false;
    } else {
        return true;
    }
}
/**
* Logout Button Funktion
* Überschreiben des "Logged" Feldes des eingeloggten Studenten mit "n" (no)
*/
export async function _logout(app) {
    swal({
        title: "Hinweis",
        text: "Möchten sie sich ausloggen?",
        icon: "info",
        buttons: ["Schließen", "Ja"]
    })
    .then(async (yes) => {
        if (yes) {
            console.log("LOGGING OUT")
            let _dataLoggedStudent = await app.backend.fetch("GET", "/student?logged=y");
            let _datasetLoggedStudent = _dataLoggedStudent[0];

                let stringID = "/student/" + _datasetLoggedStudent._id;
                _datasetLoggedStudent.logged = "n";

            try {
                await app.backend.fetch("PUT", stringID, {body: _datasetLoggedStudent});
            } catch (ex) {
                swal({
                    title: "Fehler",
                    text: "Beim Logout ist ein Fehler mit dem Server aufgetreten. Bitte versuchen Sie es erneut.",
                    icon: "error",
                });
                console.log(ex);
                return;
             }
            console.log("=================");
            location.hash = "#/login/";
        } else {
            return;
        };
    });
}

