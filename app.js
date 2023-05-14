const { App } = require("@slack/bolt");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const PROMPTS = require("./prompts.js");

require("dotenv").config();
const dbName = "test-db.json";

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.APP_TOKEN,
});

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

app.shortcut("add_task", async ({ shortcut, ack, client }) => {
	try {
		await ack();
		console.log("Click detected");
		const userId = shortcut.user.id;
		const channel = shortcut.channel.id;
		const ts = shortcut.message.thread_ts;

		const result = await client.conversations.replies({
			channel,
			ts,
		});

		const conversationObject = result.messages.map((message) => {
			return {
				user: message.user,
				message: message.text,
			};
		});

		const taskName = await getTaskName(userId, conversationObject);
		console.log("Task Name: ", taskName);
		addTaskToDatabase(cleanTaskName(taskName), conversationObject);

		const prompt = generatePromptFromTasks(userId);
		const taskObject = await prioritizeTasks(prompt);

		console.log(cleanTaskObject(taskObject));
	} catch (error) {
		console.error(error);
	}
});

app.shortcut("show_all_tasks", async ({ shortcut, ack, client }) => {
	try {
		await ack();
		console.log("Click detected");
		const userId = shortcut.user.id;

		console.log("Show");

		const prompt = generatePromptFromTasks(userId);
		const taskObject = await prioritizeTasks(prompt);

		console.log(cleanTaskObject(taskObject));
	} catch (error) {
		console.error(error);
	}
});

async function getTaskName(userId, conversationObject) {
	console.log("Getting Task Name");
	const openai = new OpenAIApi(configuration);

	let prompt = "";
	prompt = PROMPTS.get_task_name.replace("{{ENTER PROMPT HERE}}", JSON.stringify(conversationObject));
	prompt = prompt.replace("{{USER_ID}}", userId);

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
		temperature: 0,
	});

	return completion.data.choices[0].message.content;
}

function cleanTaskName(str) {
	console.log("Cleaning Task Name");
	const regex = /"([^"]*)"/;
	const match = regex.exec(str);

	return match ? match[1] : "";
}

function addTaskToDatabase(taskName, conversationObject) {
	const newTask = {
		taskName: taskName,
		conversationObject: JSON.stringify(conversationObject),
	};

	fs.readFile(dbName, function (err, data) {
		const json = JSON.parse(data);
		json.push(newTask);
		console.log(json);
		fs.writeFile(dbName, JSON.stringify(json), function (err) {
			if (err) throw err;
			console.log("Successfully saved to db.json!");
		});
	});
}

function generatePromptFromTasks(userId) {
	let prompt = "";
	const data = fs.readFileSync(dbName);
	const json = JSON.parse(data);
	prompt = PROMPTS.prioritize_tasks.replace("{{ENTER TASK LIST HERE}}", JSON.stringify(json));
	prompt = prompt.replace("{{USER_ID}}", userId);
	return prompt;
}

async function prioritizeTasks(prompt) {
	const openai = new OpenAIApi(configuration);

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user",
				content: prompt,
			},
		],
		temperature: 0,
	});

	return completion.data.choices[0].message.content;
}

function cleanTaskObject(str) {
	const firstIndex = str.indexOf("[");
	const lastIndex = str.lastIndexOf("]");
	const subStr = str.substring(firstIndex, lastIndex + 1);
	console.log(subStr);
}

(async () => {
	if (!fs.existsSync(dbName)) {
		fs.writeFileSync(dbName, "");
	}

	const port = 3000;
	// Start your app
	await app.start(process.env.PORT || port);
	console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
