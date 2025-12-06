import { Client, Account } from "node-appwrite";

// ADMIN CLIENT (for signup/login only)
export function getAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return new Account(client);
}

export function getUserClient(sessionSecret: string) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!);

  client.setSession(sessionSecret);

  return { account: new Account(client) };
}

