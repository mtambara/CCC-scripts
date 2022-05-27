require('dotenv').config();
const JiraApi = require('jira-client');
const {google} = require('googleapis');

const jira = new JiraApi({
	protocol: 'https',
	host: 'issues.liferay.com',
	username: `${process.env.JIRA_USER}`,
	password: `${process.env.JIRA_PASSWORD}`,
	apiVersion: '2',
	strictSSL: true
});

const spreadsheetId='1vrMv55hxrhfdP6Jwzj6P4II07iILAQhuRyudNbtnL30';

const LCUTickets = "(project=LCU and (status in (open,ideas)))";
const LCETickets = "(project=LCE and (status in (open,deferred)))";
const LCDTickets = "(project=LCD and (status=open))";
const LRSUPPORTTickets= "((project=LRSUPPORT) and (status=open))"
const LRDOCSTickets= "((project=LRDOCS) and (status=open))"
const SRETickets= "((project=SRE) and (status=open))"

const queries = [LCUTickets, LCETickets, LCDTickets, LRSUPPORTTickets, LRDOCSTickets, SRETickets];

const issueLink = "(issueLinkType != NULL)";

async function main() {
	const results = await fetchTickets();

	const tickets = [];

	results.forEach(result => tickets.push(processTickets(result)));

	writeTickets(tickets);
}

async function fetchTickets() {
	const promises = [];

	queries.forEach(query => promises.push(jira.searchJira(`${query} and ${issueLink}`, {maxResults:2000})));

	return Promise.all(promises);
}
function processTickets(results) {
	if (results ===undefined) {
		return "";
	}

	const list = [];
		for (const [key, issue] of Object.entries(results.issues)) {

		var count = 0;
		for (const [key, link] of Object.entries(issue.fields.issuelinks)) {
			if (link.inwardIssue === undefined) {
				continue;
			}

			if (link.inwardIssue.key.startsWith("LCH")) {
				count++;
			}
		}

		if (count > 0) {
			list.push({"key": issue.key, count});
		}

		}

	list.sort((a, b) => (a.count < b.count) ? 1 : -1);

	return {name: results.issues[0].fields.project.key, tickets: list};

}

async function writeTickets(projects) {
	const auth = new google.auth.GoogleAuth({
		keyFile: `${process.env.GSHEETS_CREDENTIAL_PATH}`,
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	});

	const sheets = google.sheets({version: 'v4', auth});

	await sheets.spreadsheets.values.clear;
	await sheets.spreadsheets.values.clear({
		spreadsheetId,
		range: 'Links-Open'
	});

	let col = 'A';
	
	for (const project of projects) {
		let res = await sheets.spreadsheets.values.append({
			spreadsheetId,
			range: `Links-Open!${col}1`,
			valueInputOption: 'USER_ENTERED',
			requestBody: {
				values: generateValueArray(project)
			}
		});

		console.log(res.data);

		col = String.fromCharCode(col.charCodeAt(0) + 2);

	}

}

function generateValueArray(obj) {
	const result = [[obj.name, "LCH Links"]];
	
	obj.tickets.forEach(element => {
		const ticket = element.key;
		const count = element.count;
		result.push([`=HYPERLINK("https://issues.liferay.com/browse/" & "${ticket}", "${ticket}")`, count]);
	});
	
	return result;
}
main()