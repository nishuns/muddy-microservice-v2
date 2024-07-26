// src/services/openai.js
import * as OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI.OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// UPLOAD FILE:
export const openaiUploadFile = async (streamData, purpose) => {
  const createdFile = await openai.files.create({
    file: streamData,
    purpose: purpose,
  });

  return createdFile;
};

// Create vector store
export const createVectorStore = async (vectorConfig) => {
  const vecConfig = vectorConfig || {};
  const vectorStore = await openai.beta.vectorStores.create({
    name: `rag-store-${uuidv4()}`,
    ...vecConfig,
  });

  return vectorStore;
};

// Create thread
export const createThread = async (threadConfig) => {
  const threadConf = threadConfig || {};

  const thread = await openai.beta.threads.create({
    ...threadConf,
  });

  return thread;
};

// Update vector store ID to thread
export const attachVectorStoresIntoThread = async (threadId, vectorIds) => {
  const threadVectorUpdate = await openai.beta.threads.update(threadId, {
    tool_resources: { file_search: { vector_store_ids: [...vectorIds] } },
  });

  return threadVectorUpdate;
};

export const deleteThread = async (threadId) => {
  try {
    const thread = await openai.beta.threads.retrieve(threadId);
    let response;
    if (thread && thread.id) {
      response = await openai.beta.threads.del(threadId);
    } else {
      response = 'thread not found';
    }
    return response;
  } catch (error) {
    console.log('xvf', 'thread id', error.message);
    return 'thread not found';
  }
};

// Delete assistant
export const deleteAssistant = async (assistantIds) => {
  const deletedAssistants = Promise.all(assistantIds.map((assistantId) => openai.beta.assistants.del(assistantId)));
  return deletedAssistants;
};

// Delete vector store
export const deleteVectorStore = async (vectorStoreId) => {
  try {
    const vectorStoreFiles = await openai.beta.vectorStores.files.list(vectorStoreId);
    let deletedFiles = [];
    if (vectorStoreFiles.data && vectorStoreFiles.data.length > 0) {
      console.log('xvf', vectorStoreFiles);
      deletedFiles = await Promise.all(
        vectorStoreFiles.data.map((vectorStoreFile) => openai.beta.vectorStores.files.del(vectorStoreId, vectorStoreFile))
      );
    }
    const deletedVectorStore = await openai.beta.vectorStores.del(vectorStoreId);
    return { deletedVectorStore, deletedFiles };
  } catch (error) {
    console.log('ERROR', 'VECTOR STORE => ', error.message);
  }
};

// Upload file to vector store
export const uploadFileToVectorStore = async (storeId, fileIds) => {
  const updatedVectorFile = await openai.beta.vectorStores.fileBatches.create(storeId, {
    file_ids: [...fileIds],
  });

  return updatedVectorFile;
};

const graphAssistant = async () => {
  const myAssistant = await openai.beta.assistants.create({
    instructions:
      'Your job is to provide optimal answer by looking in mentioned doc/data in available thread. whether its from graph data, attatched vector data, or messages so far',
    name: 'SmartGraphAssistant',
    tools: [{ type: 'file_search' }],
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-instruct',
  });

  console.log(myAssistant);
};

export const createMessage = async (threadId, userPrompt) => {
  try {
    console.log('xvf', threadId, userPrompt);
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userPrompt,
    });
  } catch (error) {
    console.log('ERROR', 'MESSAGE DID NOT CREATE');
  }
};

// graphAssistant();
export const createRunUsingThreadAndAssistantIdStream = async (threadId, assistantId, getOutputText, onEnd) => {
  const run = openai.beta.threads.runs
    .stream(threadId, {
      assistant_id: assistantId,
    })
    .on('textDelta', (textDelta) => {
      getOutputText(`${textDelta.value}`);
    })
    .on('end', () => {
      onEnd();
    })
    .on('error', (err) => {
      throw new Error(err.message);
    });
  return run;
};
