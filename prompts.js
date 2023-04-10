const PROMPTS = {
	get_task_name: `I am going to give you an array which contains messages between multiple folks working together, denoted by 'user' and 'message'

    What I want you to do is traverse the array of conversations, and based on the conversation, return the name of the task I have to do.
    
    For example.
    
    Here's the array of conversations:
    [
      { user: 'U01', message: 'gm' },
      { user: 'U02, message: "What's up?" },
      {
        user: 'U01',
        message: 'Can you help test out the new Slack bot which allocates and automates task prioritisation?'
      },
      { user: 'U02', message: 'Okay cool, I will take this up' }
    ]
    
    I am U02.
    Expected Output:
    "Test the new Task Automation Slackbot"
    
    Based on the example above, can you return the string with task name has to do based on the following array of conversation:
    
    {{ENTER PROMPT HERE}}`,
};

module.exports = PROMPTS;
