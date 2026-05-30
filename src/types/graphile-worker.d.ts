declare global {
  namespace GraphileWorker {
    interface Tasks {
      "ingest-document": {
        documentId: string;
        userId: string;
      };
    }
  }
}

export {};
