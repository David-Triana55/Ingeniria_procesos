const axios = require("axios");

const organization = process.env.AZURE_ORG;
const project = process.env.AZURE_PROJECT;
const pat = process.env.AZURE_PAT;

const auth = Buffer.from(`:${pat}`).toString("base64");

const api = axios.create({
  baseURL: `https://dev.azure.com/${organization}`,
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json"
  }
});

async function getMyActiveBugs() {
  const wiql = {
    query: `
      SELECT
        [System.Id],
        [System.Title],
        [System.State],
        [System.AssignedTo]
      FROM WorkItems
      WHERE
        [System.WorkItemType] = 'Bug'
        AND [System.State] <> 'Closed'
      ORDER BY [System.ChangedDate] DESC
    `
  };

  // Ejecutar WIQL
  const wiqlResponse = await api.post(
    `/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=7.1`,
    wiql
  );

  const workItems = wiqlResponse.data.workItems;

  // Si no hay bugs
  if (!workItems || workItems.length === 0) {
    return [];
  }

  // Limitar a 10 bugs
  const limitedWorkItems = workItems.slice(0, 10);

  // Obtener IDs
  const ids = limitedWorkItems
    .map(w => w.id)
    .join(",");

  // Obtener detalles
  const detailsResponse = await api.get(
    `/_apis/wit/workitems?ids=${ids}&api-version=7.1`
  );

  // Transformar respuesta
  return detailsResponse.data.value.map(item => ({
    id: item.id,
    title: item.fields["System.Title"],
    state: item.fields["System.State"],
    assignedTo:
      item.fields["System.AssignedTo"]?.displayName || "Unassigned"
  }));
}

async function getBugById(id) {
  const response = await api.get(
    `/_apis/wit/workitems/${id}?api-version=7.1`
  );

  const item = response.data;

  return {
    id: item.id,
    title: item.fields["System.Title"],
    state: item.fields["System.State"],
    assignedTo:
      item.fields["System.AssignedTo"]?.displayName || "Unassigned",
    description:
      item.fields["System.Description"] || "No description",
    createdDate: item.fields["System.CreatedDate"],
    changedDate: item.fields["System.ChangedDate"],
    priority: item.fields["Microsoft.VSTS.Common.Priority"]
  };
}

module.exports = {
  getMyActiveBugs,
  getBugById
};