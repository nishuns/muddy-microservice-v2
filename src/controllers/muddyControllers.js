// src/controllers/muddyControllers.js
import {
  createThread,
  createMessage,
  createRunUsingThreadAndAssistantIdStream,
} from '../services/openai.js';

export const createThreadController = async (req, res) => {
  try {
    const thread = await createThread();
    res.status(200).json(thread);
  } catch (error) {
    console.log('xvf', error);
    res.status(500).json({ error: error.message });
  }
};

export const addInstructionController = async (req, res) => {
  try {
    const { threadId, userPrompt } = req.body;
    await createMessage(threadId, userPrompt);
    res.status(200).json({ message: 'Instruction added to thread' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const streamController = async (req, res) => {
  try {
    const { threadId, prompt } = req.body;

    if (prompt) {
      await createMessage(threadId, prompt);
    }
    const assistantId = process.env.ASSISTANT_ID;

    const getOutputText = (text) => {
      res.write(text);
    };

    const onEnd = () => {
      res.end();
    };

    await createRunUsingThreadAndAssistantIdStream(threadId, assistantId, getOutputText, onEnd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
