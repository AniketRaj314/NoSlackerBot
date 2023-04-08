const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.APP_TOKEN,
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

		const messages = result.messages.map((message) => {
			return {
				user: message.user,
				message: message.text,
			};
		});

		console.log(messages);
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
