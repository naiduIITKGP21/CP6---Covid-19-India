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

//API 2: Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const stateDetails = await db.get(getStateQuery);
  console.log(stateDetails);
  const { state_id, state_name, population } = stateDetails;
  response.send({
    stateId: state_id,
    stateName: state_name,
    population: population,
  });
  console.log(`Returns a state based on the state ID ${state_id}`);
});

//API 3: Create a district in the district table, `district_id` is auto-incremented
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrictQuesry = `INSERT INTO district
(district_name, state_id, cases, cured, active, deaths) 
VALUES
("${districtName}", ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  await db.run(addDistrictQuesry);
  response.send("District Successfully Added");
  console.log(
    `${districtName} district(state_id ${stateId}) is seccessfully added `
  );
});
