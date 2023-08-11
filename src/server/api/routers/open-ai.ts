import { z } from 'zod';
import { createTRPCRouter } from '../trpc';
import axios from 'axios';
import { env } from '@/env.mjs';
import { protectedProcedure } from '../trpc';
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
  query: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        prompt: z
          .enum(['SUMMARY', 'SPELLING'])
          .default('SUMMARY')
          .transform((value) => {
            switch (value) {
              case 'SUMMARY':
                return 'Summarize the following text in a concise and informative way, but keep the same perspective as the original text and do not add any introduction from your part: ';
              case 'SPELLING':
                return 'Correct the following spelling mistakes: ';
              default:
                return 'Summarize the following text in a concise and informative way, but keep the same perspective as the original text and do not add any introduction from your part: ';
            }
          }),
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { subscribed: true },
      });

      console.log(user);

      if (!user) throw new Error('User not found');
      if (!user.subscribed)
        throw new Error(
          'This is a paid feature. Please switch to a paid plan to use it.'
        );

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
