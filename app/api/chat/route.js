import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const systemPrompt = `You are an Ummati Halal Food agent designed to help users find the best halal food options. 
You have access to a database of halal restaurants, including their names, addresses, towns, states, regions, types of food, and ratings. 
When a user asks for halal food recommendations, analyze their query and return the top 5 restaurants that best match their needs. 
Provide the information in an organized manner, with each restaurant's details separated by new lines (\n) for clarity.`

export async function POST(req) {
  const data = await req.json()
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })
  const index = pc.index('rag').namespace('ns1') 
  const openai = new OpenAI()

  const text = data[data.length - 1].content
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float'
  })

  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding
  })

  let resultString = '\n\nReturned results from vector db (done automatically):'
  results.matches.forEach((match) => {
    resultString += `\n
    Restaurant: ${match.metadata.name}
    Address: ${match.metadata.address}
    Town: ${match.metadata.town}
    State: ${match.metadata.state}
    Region: ${match.metadata.region}
    Type of Food: ${match.metadata.typeOfFood.join(', ')}
    Rating: ${match.metadata.rating}\n\n
    `
  })

  const lastMessage = data[data.length - 1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: 'user', content: lastMessageContent },
    ],
    model: 'gpt-4',
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream)
}
