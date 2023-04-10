const { App } = require("@slack/bolt");
const { Configuration, OpenAIApi } = require("openai");
const PROMPTS = require("./prompts.js");

require("dotenv").config();

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

		// console.log(conversationObject);
		const taskName = await getTaskName(conversationObject);
		console.log(cleanTaskName(taskName));
	} catch (error) {
		console.error(error);
	}
});

(async () => {
	const port = 3000;
	// Start your app
	await app.start(process.env.PORT || port);
	console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();

async function getTaskName(conversationObject) {
	const openai = new OpenAIApi(configuration);
	// const completion = await openai.ChatCompletion.create({
	// 	model: "gpt-3.5-turbo",
	// 	prompt: PROMPTS.get_task_name.replace("{{ENTER PROMPT HERE}}", conversationObject),
	// 	temperature: 0.6,
	// });

	const completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user",
				content: PROMPTS.get_task_name.replace("{{ENTER PROMPT HERE}}", JSON.stringify(conversationObject)),
			},
		],
	});

	return completion.data.choices[0].message.content;
}

function cleanTaskName(str) {
	const regex = /"([^"]*)"/;
	const match = regex.exec(str);

	return match ? match[1] : "";
}
