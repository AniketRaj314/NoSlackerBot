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
    
    Based on the example above, can you return the string with task name {{USER_ID}} has to do based on the following array of conversation (do note that a task can be self assigned in the conversation):
    
    {{ENTER PROMPT HERE}}`,

	prioritize_tasks: `This is an array of tasks a user needs to perform:

    1. taskName has the name of the Task
    2. conversationObject is a conversation made between others and our user
    
    The conversationObject will help you understand the urgency and size of the task that needs to be done.
    
    Could you rearrange the order of the array below and print the exact array so that the most important task needs to complete comes first?
    
    {{ENTER TASK LIST HERE}}`,
};

module.exports = PROMPTS;
