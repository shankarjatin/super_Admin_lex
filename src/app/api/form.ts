// pages/api/chatbot.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseClient';
import { collection, getDocs, addDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = req.body;
      await addDoc(collection(db, "chatbots"), data);
      res.status(200).json({ message: 'Chatbot configuration saved successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save the configuration', error });
    }
  } else if (req.method === 'GET') {
    try {
      const chatbotsCol = collection(db, "chatbots");
      const chatbotsSnapshot = await getDocs(chatbotsCol);
      const chatbotList = chatbotsSnapshot.docs.map(doc => doc.data());
      res.status(200).json(chatbotList);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch configurations', error });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
