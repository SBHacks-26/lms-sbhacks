import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    clientPromise = client.connect();
  }
  const connectedClient = await clientPromise;
  return { client: connectedClient, db: connectedClient.db('lms') };
}
