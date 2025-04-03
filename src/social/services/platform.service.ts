import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '../enums/platform.enum';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import * as OAuth from 'oauth-1.0a';
import { createHmac } from 'crypto';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  constructor(private prisma: PrismaService) {}

  async postToPlatform(platform: Platform, content: string, mediaUrl?: string) {
    try {
      const credentials = await this.getCredentials(platform);
      
      switch (platform) {
        case Platform.FACEBOOK:
          return await this.postToFacebook(content, credentials, mediaUrl);
        case Platform.TWITTER:
          return await this.postToTwitter(content, credentials, /* mediaUrl */);
        case Platform.LINKEDIN:
          return await this.postToLinkedIn(content, credentials, mediaUrl);
        case Platform.INSTAGRAM:
          return await this.postToInstagram(content, credentials, mediaUrl);
        case Platform.THREADS:
          return await this.postToThreads(content, credentials, mediaUrl);
        case Platform.TIKTOK:
          return await this.postToTikTok(content, credentials, mediaUrl);
        case Platform.GOOGLE:
          return await this.postToGoogle(content, credentials, mediaUrl);
        case Platform.PINTEREST:
          return await this.postToPinterest(content, credentials, mediaUrl);
        case Platform.YOUTUBE:
          return await this.postToYouTube(content, credentials, mediaUrl);
        case Platform.SNAPCHAT:
          return await this.postToSnapchat(content, credentials, mediaUrl);
        case Platform.BLUESKY:
          return await this.postToBluesky(content, credentials, mediaUrl);
        case Platform.TRUTH:
          return await this.postToTruth(content, credentials, mediaUrl);
        case Platform.CLAPPER:
          return await this.postToClapper(content, credentials, mediaUrl);
        default:
          throw new Error(`Platform ${platform} not implemented`);
      }
    } catch (error) {
      this.logger.error(`Failed to post to ${platform}: ${error.message}`);
      throw error;
    }
  }

  private async getCredentials(platform: Platform) {
    const credentials = await this.prisma.platformCredential.findFirst({
      where: { platform }
    });
    if (!credentials) {
      throw new Error(`No credentials found for ${platform}`);
    }
    
    // Parse the credentialsData JSON string if it exists
    if (credentials.credentialsData && typeof credentials.credentialsData === 'string') {
      try {
        credentials.credentialsData = JSON.parse(credentials.credentialsData);
      } catch (error) {
        this.logger.error(`Failed to parse credentialsData for ${platform}: ${error.message}`);
        credentials.credentialsData = {};
      }
    } else if (!credentials.credentialsData) {
      credentials.credentialsData = {};
    }
    
    // Validate platform-specific required credentials
    this.validatePlatformCredentials(platform, credentials);
    
    return credentials;
  }
  
  private validatePlatformCredentials(platform: Platform, credentials: any) {
    // Extract credentials from the JSON field as a flat structure
    const credentialsData = credentials.credentialsData || {};
    
    switch (platform) {
      case Platform.TWITTER:
        if (!credentialsData.consumerKey || !credentialsData.consumerSecret || 
            !credentials.accessToken || !credentialsData.tokenSecret) {
          throw new Error(`Missing required Twitter credentials. Required: consumerKey, consumerSecret, accessToken, tokenSecret`);
        }
        break;
      case Platform.LINKEDIN:
        if (!credentials.accessToken || !credentialsData.userId) {
          throw new Error(`Missing required LinkedIn credentials. Required: accessToken, userId`);
        }
        break;
      case Platform.FACEBOOK:
      case Platform.INSTAGRAM:
      case Platform.THREADS:
        if (!credentials.accessToken) {
          throw new Error(`Missing required ${platform} credentials. Required: accessToken`);
        }
        break;
      case Platform.PINTEREST:
        if (!credentials.accessToken || !credentialsData.boardId) {
          throw new Error(`Missing required Pinterest credentials. Required: accessToken, boardId`);
        }
        break;
      // Add other platforms with specific requirements
      default:
        if (!credentials.accessToken) {
          throw new Error(`Missing required ${platform} credentials. Required: accessToken`);
        }
    }
  }

  private async postToFacebook(content: string, credentials: any, mediaUrl?: string) {
    const url = `https://graph.facebook.com/v18.0/me/feed`;
    const data = {
      message: content,
      ...(mediaUrl && { link: mediaUrl }),
      access_token: credentials.accessToken,
    };
    return axios.post(url, data);
  }

  private async postToTwitter(content: string, credentials: any) {
    const credentialsData = credentials.credentialsData || {};
    
    const client = new TwitterApi({
      appKey: credentialsData.consumerKey,
      appSecret: credentialsData.consumerSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentialsData.tokenSecret,
    });

    try {
      const response = await client.v2.tweet(content);
      this.logger.debug('Tweet posted:', response);
      
      // Return structured response with platform-specific ID
      return {
        success: true,
        platformPostId: response.data.id,
        data: response.data
      };
    } catch (error) {
      this.logger.error('Error posting tweet:', error);
      throw error;
    }
  }


  private async postToLinkedIn(content: string, credentials: any, mediaUrl?: string) {
    try {
      const credentialsData = credentials.credentialsData || {};
      
      // Use the userId from credentials data
      const author = `urn:li:person:${credentialsData.userId}`;
      
      this.logger.debug(`LinkedIn post author: ${author}`);
      
      const url = 'https://api.linkedin.com/v2/ugcPosts';
      
      const data = {
        author: author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      };
      
      // Add media if provided
      // if (mediaUrl) {
      //   data.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      //   data.specificContent['com.linkedin.ugc.ShareContent'].media = [
      //     {
      //       status: 'READY',
      //       description: { text: content },
      //       originalUrl: mediaUrl
      //     }
      //   ];
      // }
      
      this.logger.debug('LinkedIn request payload:', JSON.stringify(data, null, 2));
      
      const response = await axios.post(url, data, {
        headers: { 
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      this.logger.debug('LinkedIn post response:', response.data);
      
      return {
        success: true,
        platformPostId: (response.data as { id: string }).id,
        data: response.data
      };
    } catch (error) {
      this.logger.error('LinkedIn API error details:', error.response?.data || error.message);
      if (error.response?.data) {
        this.logger.error('LinkedIn error status:', error.response.status);
        this.logger.error('LinkedIn error headers:', error.response.headers);
      }
      throw error;
    }
  }
  

  private async postToInstagram(content: string, credentials: any, mediaUrl?: string) {
    // First create container
    const containerUrl = `https://graph.facebook.com/v18.0/me/media`;
    const containerData = {
      image_url: mediaUrl,
      caption: content,
      access_token: credentials.accessToken,
    };
    const container = await axios.post(containerUrl, containerData);
    
    // Then publish
    const publishUrl = `https://graph.facebook.com/v18.0/me/media_publish`;
    const publishData = {
      creation_id: (container.data as { id: string }).id,
      access_token: credentials.accessToken,
    };
    return axios.post(publishUrl, publishData);
  }

  private async postToThreads(content: string, credentials: any, mediaUrl?: string) {
    // Threads API is not publicly available yet, using Instagram's API as they're connected
    return this.postToInstagram(content, credentials, mediaUrl);
  }

  private async postToTikTok(content: string, credentials: any, mediaUrl?: string) {
    const url = 'https://open.tiktokapis.com/v2/post/publish/video/init/';
    const data = {
      post_info: {
        title: content,
        privacy_level: 'PUBLIC'
      }
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToGoogle(content: string, credentials: any, mediaUrl?: string) {
    const url = 'https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/posts';
    const data = {
      summary: content,
      callToAction: { actionType: 'LEARN_MORE', url: mediaUrl }
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToPinterest(content: string, credentials: any, mediaUrl?: string) {
    const url = 'https://api.pinterest.com/v5/pins';
    const data = {
      title: content,
      media_source: { source_type: 'image_url', url: mediaUrl },
      board_id: credentials.boardId
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToYouTube(content: string, credentials: any, mediaUrl?: string) {
    const url = 'https://www.googleapis.com/youtube/v3/videos';
    const data = {
      snippet: {
        title: content,
        description: content,
        tags: [],
        categoryId: '22'
      },
      status: { privacyStatus: 'public' }
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToSnapchat(content: string, credentials: any, mediaUrl?: string) {
    const url = 'https://adsapi.snapchat.com/v1/media';
    const data = {
      media: mediaUrl,
      type: 'IMAGE',
      name: content
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToBluesky(content: string, credentials: any, mediaUrl?: string) {
    const url = 'https://bsky.social/xrpc/com.atproto.repo.createRecord';
    const data = {
      collection: 'app.bsky.feed.post',
      record: {
        text: content,
        createdAt: new Date().toISOString()
      }
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToTruth(content: string, credentials: any, mediaUrl?: string) {
    // Truth Social's API endpoint (if available)
    const url = 'https://truthsocial.com/api/v1/statuses';
    const data = {
      status: content,
      media_ids: mediaUrl ? [mediaUrl] : []
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  private async postToClapper(content: string, credentials: any, mediaUrl?: string) {
    // Clapper's API endpoint (if available)
    const url = 'https://api.clapper.com/v1/posts';
    const data = {
      content,
      mediaUrl,
      visibility: 'public'
    };
    return axios.post(url, data, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` }
    });
  }

  async updatePost(platform: Platform, postId: string, content: string, mediaUrl?: string) {
    try {
      const credentials = await this.getCredentials(platform);
      
      switch (platform) {
        case Platform.FACEBOOK:
          return await this.updateFacebookPost(postId, content, credentials, mediaUrl);
        case Platform.TWITTER:
          return await this.updateTwitterPost(postId, content, credentials);
        case Platform.LINKEDIN:
          return await this.updateLinkedInPost(postId, content, credentials, mediaUrl);
        // Add other platforms as needed
        default:
          throw new Error(`Update not implemented for ${platform}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update post on ${platform}: ${error.message}`);
      throw error;
    }
  }

  async deletePost(platform: Platform, postId: string) {
    try {
      const credentials = await this.getCredentials(platform);
      
      switch (platform) {
        case Platform.FACEBOOK:
          return await this.deleteFacebookPost(postId, credentials);
        case Platform.TWITTER:
          return await this.deleteTwitterPost(postId, credentials);
        case Platform.LINKEDIN:
          return await this.deleteLinkedInPost(postId, credentials);
        // Add other platforms as needed
        default:
          throw new Error(`Delete not implemented for ${platform}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete post from ${platform}: ${error.message}`);
      throw error;
    }
  }

  private async updateFacebookPost(postId: string, content: string, credentials: any, mediaUrl?: string) {
    const url = `https://graph.facebook.com/v18.0/${postId}`;
    const data = {
      message: content,
      ...(mediaUrl && { link: mediaUrl }),
      access_token: credentials.accessToken,
    };
    return axios.post(url, data);
  }

  private async deleteFacebookPost(postId: string, credentials: any) {
    const url = `https://graph.facebook.com/v18.0/${postId}`;
    return axios.delete(url, {
      params: { access_token: credentials.accessToken }
    });
  }

  private async updateLinkedInPost(postId: string, content: string, credentials: any, mediaUrl?: string) {
    try {
      // LinkedIn doesn't support direct updates to posts
      // We need to delete the old post and create a new one
      await this.deleteLinkedInPost(postId, credentials);
      
      // Create a new post with the updated content
      const newPost = await this.postToLinkedIn(content, credentials, mediaUrl);
      
      this.logger.debug('LinkedIn post updated (deleted and recreated):', newPost);
      
      return {
        success: true,
        platformPostId: newPost.platformPostId,
        data: newPost.data
      };
    } catch (error) {
      this.logger.error('Error updating LinkedIn post:', error);
      throw error;
    }
  }

  private async deleteLinkedInPost(postId: string, credentials: any) {
    try {
      // LinkedIn post IDs are typically in URN format
      // If the postId doesn't start with 'urn:li:share:', prepend it
      const formattedPostId = postId.startsWith('urn:li:') 
        ? postId 
        : `urn:li:share:${postId}`;
      console.log(">>> ")
      this.logger.debug(`Attempting to delete LinkedIn post with ID: ${formattedPostId}`);
      
      const url = `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(formattedPostId)}`;
      
      const response = await axios.delete(url, {
        headers: { 
          Authorization: `Bearer ${credentials.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      this.logger.debug('LinkedIn post deletion response:', response.status);
      
      return {
        success: true,
        data: { status: response.status }
      };
    } catch (error) {
      this.logger.error(`Error deleting LinkedIn post ${postId}:`, error.response?.data || error.message);
      if (error.response?.status === 404) {
        // If the post is already deleted or doesn't exist, consider it a success
        return {
          success: true,
          data: { status: 'Post not found or already deleted' }
        };
      }
      throw error;
    }
  }

  private async updateTwitterPost(postId: string, content: string, credentials: any) {
    const credentialsData = credentials.credentialsData || {};
    
    const client = new TwitterApi({
      appKey: credentialsData.consumerKey,
      appSecret: credentialsData.consumerSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentialsData.tokenSecret,
    });

    try {
      // Note: Twitter API v2 doesn't support updating tweets
      // We'll need to delete and create a new one
      const deleteResult = await client.v2.deleteTweet(postId);
      this.logger.debug('Tweet deleted:', deleteResult);
      
      const newTweet = await client.v2.tweet(content);
      this.logger.debug('New tweet created:', newTweet);
      
      return {
        success: true,
        platformPostId: newTweet.data.id,
        data: newTweet.data
      };
    } catch (error) {
      this.logger.error('Error updating tweet:', error);
      throw error;
    }
  }

  private async deleteTwitterPost(postId: string, credentials: any) {
    const credentialsData = credentials.credentialsData || {};
    
    const client = new TwitterApi({
      appKey: credentialsData.consumerKey,
      appSecret: credentialsData.consumerSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentialsData.tokenSecret,
    });

    try {
      const result = await client.v2.deleteTweet(postId);
      this.logger.debug('Tweet deletion result:', result);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting tweet ${postId}:`, error);
      throw error;
    }
  }
}