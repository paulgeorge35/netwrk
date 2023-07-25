import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import axios from 'axios';
import { env } from '@/env.mjs';
const Message = z.object({
  role: z.string(),
  content: z.string(),
});

const Choice = z.object({
  index: z.number(),
  message: Message,
  finish_reason: z.string(),
});

const Usage = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});

const openAiResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(Choice),
  usage: Usage,
});

export const openAIRouter = createTRPCRouter({
  query: publicProcedure
    .input(
      z.object({
        text: z.string(),
        prompt: z
          .enum(['SUMMARY', 'SPELLING'])
          .default('SUMMARY')
          .transform((value) => {
            switch (value) {
              case 'SUMMARY':
                return 'Summarize the following text in a concise and informative way: ';
              case 'SPELLING':
                return 'Correct the following spelling mistakes: ';
              default:
                return 'Summarize the following text in a concise and informative way: ';
            }
          }),
      })
    )
    .output(z.string())
    .query(async ({ input }) => {
      const { text, prompt } = input;
      if (text === '') return text;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      };

      const data = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `${prompt}: ${text}`,
          },
        ],
      });

      const options = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers,
        data,
      };

      try {
        const response = await axios.request(options);

        return (
          openAiResponseSchema.parse(response.data).choices[0]?.message
            .content ?? text
        );
      } catch (error) {
        console.log(error);
        return text;
      }
    }),
});
