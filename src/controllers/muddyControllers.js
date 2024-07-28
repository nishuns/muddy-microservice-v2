// src/controllers/muddyControllers.js
import {
  createThread,
  createMessage,
  createRunUsingThreadAndAssistantIdStream,
  createTranslation,
  createTTSStream
} from '../services/openai.js';
import fs from 'fs';

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

export const speechToText = async (req, res) => {
  try {

    const filePath = req.file.path;

    const transcript = await createTranslation(filePath);

    fs.unlinkSync(filePath); // Remove the file after processing

    res.send(transcript);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const ttsStream = async (req, res) => {
  const { input, voice = 'alloy' } = req.body;
  try {
    const stream = await createTTSStream(input, voice);
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
};