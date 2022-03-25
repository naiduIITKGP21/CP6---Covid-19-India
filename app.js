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
        stateId: eachState.state_id,
        stateName: eachState.state_name,
        population: eachState.population,
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

//API 4: Returns a district based on the district ID
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const districtDetails = await db.get(getDistrictQuery);
  console.log(districtDetails);
  const {
    district_id,
    district_name,
    state_id,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  response.send({
    districtId: district_id,
    districtName: district_name,
    stateId: state_id,
    cases: cases,
    cured: cured,
    active: active,
    deaths: deaths,
  });
  console.log(`Returns a district based on the district ID ${district_id}`);
});

//API 5: Deletes a district from the district table based on the district ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
  console.log(
    `Deletes a district from the district table based on the district ID ${districtId}`
  );
});

//API 6: Updates the details of a specific district based on the district ID
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `UPDATE district
SET 
district_name = '${districtName}',
state_id = ${stateId},
cases = ${cases}, 
cured = ${cured},
active =  ${active} , 
deaths =  ${deaths}
WHERE district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
  console.log(request.body);
  console.log(`District(district_id ${districtId}) Details Updated`);
});

//API 7: Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = ` SELECT 
SUM(cases) AS total_cases, 
SUM(cured) AS cured,
SUM(active) AS active,
SUM(deaths) AS deaths
FROM district WHERE state_id = ${stateId};`;

  const stats = await db.get(getStatsQuery);
  console.log(stats);
  response.send({
    totalCases: stats.total_cases,
    totalCured: stats.cured,
    totalActive: stats.active,
    totalDeaths: stats.deaths,
  });
  console.log(`Returns the statistics of state_id ${stateId}`);
});

//API 8: Returns an object containing the state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `SELECT state_name FROM district 
INNER JOIN state ON district.state_id = state.state_id
WHERE district_id = ${districtId};`;
  const stateName = await db.get(getStateNameQuery);
  console.log(stateName);
  response.send({
    stateName: stateName.state_name,
  });
  console.log(
    `Returned state name of a district based on the district ID ${districtId}`
  );
});

module.exports = app;
