import { TwitterApi } from 'twitter-api-v2';
import { logger } from '@/lib/logger';

export class TwitterClient {
    private client: TwitterApi | null = null;

    constructor() {
        const appKey = process.env.TWITTER_API_KEY;
        const appSecret = process.env.TWITTER_API_SECRET;
        const accessToken = process.env.TWITTER_ACCESS_TOKEN;
        const accessSecret = process.env.TWITTER_ACCESS_SECRET;

        if (appKey && appSecret && accessToken && accessSecret) {
            this.client = new TwitterApi({
                appKey,
                appSecret,
                accessToken,
                accessSecret,
            });
        } else {
            // This is expected during build or if user hasn't configured it yet
            // We verify this in postTweet before attempting action
        }
    }

    async postTweet(text: string): Promise<string | null> {
        if (!this.client) {
            logger.warn('Twitter client not configured. Skipping tweet.');
            return null;
        }

        try {
            const { data: createdTweet } = await this.client.v2.tweet(text);
            logger.log('SYSTEM', `Tweet posted successfully: ${createdTweet.id}`);
            return `https://twitter.com/user/status/${createdTweet.id}`;
        } catch (error) {
            logger.error('Failed to post tweet:', error);
            // Return null so we don't break the main publish flow
            return null;
        }
    }
}

export const twitterClient = new TwitterClient();
