const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = path.join(__dirname, "covid19India.db");
const intitializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
intitializeDBAndServer();

//API 1 : Returns a list of all states in the state table
app.get("/states", async (request, response) => {
  const getAllSatesQuery = `SELECT * FROM state;`;
  const statesDetails = await db.all(getAllSatesQuery);
  response.send(
    statesDetails.map((eachState) => {
      return {
        stateId: `${eachState.state_id}`,
        stateName: `${eachState.state_name}`,
        population: `${eachState.population}`,
      };
    })
  );
  console.log("returned all states details");
});
