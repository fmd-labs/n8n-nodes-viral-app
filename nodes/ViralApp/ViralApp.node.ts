import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';

import { viralAppApiRequest, viralAppApiRequestAllItems } from './GenericFunctions';

import { trackedAccountsOperations, trackedAccountsFields } from './descriptions/TrackedAccounts';
import { trackedIndividualVideosOperations, trackedIndividualVideosFields } from './descriptions/TrackedIndividualVideos';
import { accountAnalyticsOperations, accountAnalyticsFields } from './descriptions/AccountAnalytics';
import { videoAnalyticsOperations, videoAnalyticsFields } from './descriptions/VideoAnalytics';
import { generalAnalyticsOperations, generalAnalyticsFields } from './descriptions/GeneralAnalytics';
import { projectsOperations, projectsFields } from './descriptions/Projects';
import { integrationsOperations, integrationsFields } from './descriptions/Integrations';

export class ViralApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ViralApp',
		name: 'viralApp',
		icon: 'file:viralapp.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with ViralApp API for video analytics on TikTok, Instagram, and YouTube',
		defaults: {
			name: 'ViralApp',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'viralAppApi',
				required: true,
			},
		],
		hints: [
			{
				message: 'Large datasets may take time to process. Consider using filters to reduce response size.',
				type: 'info',
				location: 'outputPane',
				whenToDisplay: 'beforeExecution',
				displayCondition: '={{ $parameter["returnAll"] === true }}',
			},
			{
				message: 'Export operations generate download URLs valid for 5 minutes.',
				type: 'info',
				location: 'outputPane',
				whenToDisplay: 'afterExecution',
				displayCondition: '={{ $parameter["operation"] === "export" }}',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tracked Account',
						value: 'trackedAccounts',
						description: 'Manage and monitor tracked accounts',
					},
					{
						name: 'Tracked Individual Video',
						value: 'trackedIndividualVideos',
						description: 'Manage and monitor individual tracked videos',
					},
					{
						name: 'Account Analytics',
						value: 'accountAnalytics',
						description: 'Analytics for tracked accounts',
					},
					{
						name: 'Video Analytics',
						value: 'videoAnalytics',
						description: 'Analytics for tracked videos',
					},
					{
						name: 'General Analytics',
						value: 'generalAnalytics',
						description: 'General analytics and overview',
					},
					{
						name: 'Project',
						value: 'projects',
						description: 'Project management',
					},
					{
						name: 'Integration',
						value: 'integrations',
						description: 'Third-party integrations',
					},
				],
				default: 'trackedAccounts',
			},

			// Tracked Accounts
			...trackedAccountsOperations,
			...trackedAccountsFields,

			// Tracked Individual Videos
			...trackedIndividualVideosOperations,
			...trackedIndividualVideosFields,

			// Account Analytics
			...accountAnalyticsOperations,
			...accountAnalyticsFields,

			// Video Analytics
			...videoAnalyticsOperations,
			...videoAnalyticsFields,

			// General Analytics
			...generalAnalyticsOperations,
			...generalAnalyticsFields,

			// Projects
			...projectsOperations,
			...projectsFields,

			// Integrations
			...integrationsOperations,
			...integrationsFields,
		],
	};

	methods = {
		loadOptions: {
			async getProjects(this: ILoadOptionsFunctions) {
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/projects',
					{},
					{ page: 1, perPage: 100 }, // Get up to 100 projects for the dropdown
				);
				
				return response.data.map((project: IDataObject) => ({
					name: project.name as string,
					value: project.id as string,
				}));
			},

			async getAccounts(this: ILoadOptionsFunctions) {
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/accounts',
					{},
					{ page: 1, perPage: 100 }, // Get up to 100 accounts for the dropdown
				);

				// Map platform values to display names
				const platformDisplay: { [key: string]: string } = {
					tiktok: 'TikTok',
					instagram: 'Instagram',
					youtube: 'YouTube',
				};
				
				return response.data.map((account: IDataObject) => ({
					name: `${account.username} (${platformDisplay[account.platform as string] || account.platform})`,
					value: account.id as string,
					description: `${account.followerCount || 0} followers`,
				}));
			},
		},
		
		listSearch: {
			async projectSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? parseInt(paginationToken, 10) : 1;
				const perPage = 20; // Reasonable page size for search
				
				const query: IDataObject = {
					page,
					perPage,
				};
				
				// Add search filter if provided
				if (filter) {
					query.name = filter;
				}
				
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/projects',
					{},
					query,
				);
				
				return {
					results: response.data.map((project: IDataObject) => ({
						name: project.name as string,
						value: project.id as string,
						// Optional: add description if available
						// description: project.description as string,
					})),
					paginationToken: response.pageCount > page ? (page + 1).toString() : undefined,
				};
			},
			
			async trackedAccountSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? parseInt(paginationToken, 10) : 1;
				const perPage = 20; // Reasonable page size for search
				
				const query: IDataObject = {
					page,
					perPage,
				};
				
				// Add username filter if provided
				if (filter) {
					query.username = filter;
				}
				
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/accounts/tracked',
					{},
					query,
				);
				
				// Map platform values to display names
				const platformDisplay: { [key: string]: string } = {
					tiktok: 'TikTok',
					instagram: 'Instagram',
					youtube: 'YouTube',
				};
				
				return {
					results: response.data.map((account: IDataObject) => ({
						name: `${account.username} (${platformDisplay[account.platform as string] || account.platform})`,
						value: account.id as string,
					})),
					paginationToken: response.pageCount > page ? (page + 1).toString() : undefined,
				};
			},

			async videoSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? parseInt(paginationToken, 10) : 1;
				const perPage = 20;
				
				const query: IDataObject = {
					page,
					perPage,
				};
				
				if (filter) {
					query.search = filter;
				}
				
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/videos/tracked',
					{},
					query,
				);
				
				const platformDisplay: { [key: string]: string } = {
					tiktok: 'TikTok',
					instagram: 'Instagram',
					youtube: 'YouTube',
				};
				
				return {
					results: response.data.map((video: IDataObject) => ({
						name: `${video.platformVideoId} (${platformDisplay[video.platform as string] || video.platform})`,
						value: `${video.platform}:${video.platformVideoId}`,
					})),
					paginationToken: response.pageCount > page ? (page + 1).toString() : undefined,
				};
			},

			async accountSearchByPlatform(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? parseInt(paginationToken, 10) : 1;
				const perPage = 20;
				
				// Get the platform from the current node parameters
				const platform = this.getCurrentNodeParameter('platform') as string;
				
				const query: IDataObject = {
					page,
					perPage,
				};
				
				// Add platform filter if available
				if (platform) {
					query.platform = platform;
				}
				
				// Add username search filter if provided
				if (filter) {
					query.username = filter;
				}
				
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/accounts',
					{},
					query,
				);
				
				return {
					results: response.data.map((account: IDataObject) => ({
						name: account.username as string,
						value: account.platformAccountId as string,
						description: `Platform Account ID: ${account.platformAccountId}`,
					})),
					paginationToken: response.pageCount > page ? (page + 1).toString() : undefined,
				};
			},

			async allVideosSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? parseInt(paginationToken, 10) : 1;
				const perPage = 20;
				
				const query: IDataObject = {
					page,
					perPage,
				};
				
				// Add search filter if provided
				if (filter) {
					query.filter = filter;
				}
				
				// Get platform from current node parameters if available
				try {
					const platform = this.getCurrentNodeParameter('platform') as string;
					if (platform) {
						query.platform = platform;
					}
				} catch (error) {
					// Platform parameter might not be available in all contexts, continue without it
				}
				
				const response = await viralAppApiRequest.call(
					this,
					'GET',
					'/videos',
					{},
					query,
				);
				
				const platformDisplay: { [key: string]: string } = {
					tiktok: 'TikTok',
					instagram: 'Instagram',
					youtube: 'YouTube',
				};
				
				return {
					results: response.data.map((video: IDataObject) => ({
						name: video.title ? `${video.title} (${platformDisplay[video.platform as string] || video.platform})` : `${video.platformVideoId} (${platformDisplay[video.platform as string] || video.platform})`,
						value: video.platformVideoId as string,
						description: video.title ? `Video ID: ${video.platformVideoId}` : undefined,
					})),
					paginationToken: response.pageCount > page ? (page + 1).toString() : undefined,
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		
		for (let i = 0; i < length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData;

				// ACCOUNT ANALYTICS
				if (resource === 'accountAnalytics') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						
						if (returnAll) {
							responseData = await viralAppApiRequestAllItems.call(
								this, 'GET', '/accounts', {}, filters
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = 1; // Default page since we removed manual page field
							const response = await viralAppApiRequest.call(
								this, 'GET', '/accounts', {}, 
								{ ...filters, page, perPage: limit }
							);
							responseData = response.data;
						}
						
						// Apply simplify if requested
						if (simplify && Array.isArray(responseData)) {
							responseData = responseData.map((item: IDataObject) => ({
								id: item.id,
								username: item.username,
								platform: item.platform,
								followerCount: item.followerCount,
								totalVideos: item.totalVideos,
								totalViews: item.totalViews,
								avgViews: item.avgViews,
								engagementRate: item.engagementRate,
								viralityRate: item.viralityRate,
								createdAt: item.createdAt
							}));
						}
					} else if (operation === 'export') {
						const exportBody = this.getNodeParameter('exportBody', i, {}) as IDataObject;
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/accounts/export', exportBody
						);
					}
				}
				
				// TRACKED ACCOUNTS
				else if (resource === 'trackedAccounts') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						
						if (returnAll) {
							responseData = await viralAppApiRequestAllItems.call(
								this, 'GET', '/accounts/tracked', {}, filters
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = 1; // Default page
							const response = await viralAppApiRequest.call(
								this, 'GET', '/accounts/tracked', {}, 
								{ ...filters, page, perPage: limit }
							);
							responseData = response.data;
						}
						
						// Apply simplify if requested
						if (simplify && Array.isArray(responseData)) {
							responseData = responseData.map((item: IDataObject) => ({
								id: item.id,
								username: item.username,
								platform: item.platform,
								status: item.status,
								maxVideos: item.maxVideos,
								lastSyncedAt: item.lastSyncedAt,
								createdAt: item.createdAt,
								videoCount: item.videoCount
							}));
						}
					} else if (operation === 'add') {
						const accountsData = this.getNodeParameter('accounts', i) as IDataObject;
						// Extract the account array from the fixedCollection structure
						const accounts = accountsData.account as IDataObject[];
						
						// Process hashtags if they exist (convert comma-separated string to array)
						const processedAccounts = accounts.map(acc => {
							const account: IDataObject = {
								platform: acc.platform,
								username: acc.username,
								max_videos: acc.max_videos
							};
							
							// Handle hashtags filter if provided
							if (acc.hashtagsFilter && typeof acc.hashtagsFilter === 'string') {
								const hashtagsStr = acc.hashtagsFilter as string;
								if (hashtagsStr.trim()) {
									account.hashtagsFilter = hashtagsStr.split(',').map(h => h.trim()).filter(h => h);
								}
							}
							
							return account;
						});
						
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/accounts/tracked', { accounts: processedAccounts }
						);
					} else if (operation === 'getCount') {
						const count = await viralAppApiRequest.call(
							this, 'GET', '/accounts/tracked/count'
						);
						// Wrap the count number in an object for n8n
						responseData = { count };
					} else if (operation === 'refresh') {
						const accountsData = this.getNodeParameter('accounts', i) as IDataObject;
						// Extract the account array from the fixedCollection structure
						const accounts = accountsData.account as IDataObject[];
						
						// Build items array for API
						const items = accounts.map(account => ({
							platform: account.platform as string,
							id: account.accountId as string
						}));
						
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/accounts/tracked/refresh', { items }
						);
					} else if (operation === 'updateMaxVideos') {
						const accountId = this.getNodeParameter('accountId', i, undefined, { extractValue: true }) as string;
						const maxVideos = this.getNodeParameter('maxVideos', i) as number;
						responseData = await viralAppApiRequest.call(
							this, 'PUT', `/accounts/tracked/${accountId}/max-videos`, { newMaxVideos: maxVideos }
						);
					} else if (operation === 'updateHashtags') {
						const accountId = this.getNodeParameter('accountId', i, undefined, { extractValue: true }) as string;
						const hashtagsInput = this.getNodeParameter('hashtags', i) as string;
						// Convert comma-separated string to array and trim whitespace
						const hashtags = hashtagsInput ? hashtagsInput.split(',').map(h => h.trim()).filter(h => h) : [];
						responseData = await viralAppApiRequest.call(
							this, 'PUT', `/accounts/tracked/${accountId}/hashtags`, { hashtagsFilter: hashtags }
						);
					} else if (operation === 'updateProjectHashtags') {
						const accountId = this.getNodeParameter('accountId', i, undefined, { extractValue: true }) as string;
						const projectId = this.getNodeParameter('projectId', i, undefined, {
							extractValue: true,
						}) as string;
						const hashtagsInput = this.getNodeParameter('projectHashtags', i) as string;
						// Convert comma-separated string to array and trim whitespace
						const hashtags = hashtagsInput ? hashtagsInput.split(',').map(h => h.trim()).filter(h => h) : [];
						responseData = await viralAppApiRequest.call(
							this, 'PUT', `/accounts/tracked/${accountId}/project-hashtags`, 
							{ 
								projectHashtags: [{
									projectId,
									hashtagsFilter: hashtags
								}]
							}
						);
					}
				}
				
				// VIDEO ANALYTICS
				else if (resource === 'videoAnalytics') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						
						if (returnAll) {
							responseData = await viralAppApiRequestAllItems.call(
								this, 'GET', '/videos', {}, filters
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = 1; // Default page
							const response = await viralAppApiRequest.call(
								this, 'GET', '/videos', {}, 
								{ ...filters, page, perPage: limit }
							);
							responseData = response.data;
						}
						
						// Apply simplify if requested
						if (simplify && Array.isArray(responseData)) {
							responseData = responseData.map((item: IDataObject) => ({
								id: item.id,
								platformVideoId: item.platformVideoId,
								platform: item.platform,
								title: item.title,
								viewCount: item.viewCount,
								likeCount: item.likeCount,
								commentCount: item.commentCount,
								shareCount: item.shareCount,
								engagementRate: item.engagementRate,
								publishedAt: item.publishedAt
							}));
						}
					} else if (operation === 'get') {
						const platform = this.getNodeParameter('platform', i) as string;
						const platformVideoId = this.getNodeParameter('platformVideoId', i, undefined, { extractValue: true }) as string;
						responseData = await viralAppApiRequest.call(
							this, 'GET', `/videos/${platform}/${platformVideoId}`
						);
					} else if (operation === 'getHistory') {
						const platform = this.getNodeParameter('platform', i) as string;
						const platformVideoId = this.getNodeParameter('platformVideoId', i, undefined, { extractValue: true }) as string;
						responseData = await viralAppApiRequest.call(
							this, 'GET', `/videos/${platform}/${platformVideoId}/history`
						);
					} else if (operation === 'getActivity') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						responseData = await viralAppApiRequest.call(
							this, 'GET', '/videos/activity', {}, filters
						);
					} else if (operation === 'export') {
						const exportBody = this.getNodeParameter('exportBody', i, {}) as IDataObject;
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/videos/export', exportBody
						);
					}
				}
				
				// TRACKED INDIVIDUAL VIDEOS
				else if (resource === 'trackedIndividualVideos') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const simplify = this.getNodeParameter('simplify', i, false) as boolean;
						
						if (returnAll) {
							responseData = await viralAppApiRequestAllItems.call(
								this, 'GET', '/videos/tracked', {}, filters
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = 1; // Default page
							const response = await viralAppApiRequest.call(
								this, 'GET', '/videos/tracked', {}, 
								{ ...filters, page, perPage: limit }
							);
							responseData = response.data;
						}
						
						// Apply simplify if requested
						if (simplify && Array.isArray(responseData)) {
							responseData = responseData.map((item: IDataObject) => ({
								id: item.id,
								platformVideoId: item.platformVideoId,
								platform: item.platform,
								status: item.status,
								lastSyncedAt: item.lastSyncedAt,
								createdAt: item.createdAt,
								viewCount: item.viewCount,
								engagementRate: item.engagementRate
							}));
						}
					} else if (operation === 'add') {
						const videosData = this.getNodeParameter('videos', i) as IDataObject;
						// Extract the video array from the fixedCollection structure
						const videos = videosData.video as IDataObject[];
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/videos/tracked', { videos }
						);
					} else if (operation === 'refresh') {
						const videosData = this.getNodeParameter('videos', i) as IDataObject;
						// Extract the video array from the fixedCollection structure
						const videos = videosData.video as IDataObject[];
						
						// Build items array for API
						const items = videos.map(video => ({
							platform: video.platform as string,
							id: video.videoId as string
						}));
						
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/videos/tracked/refresh', { items }
						);
					}
				}
				
				// PROJECTS
				else if (resource === 'projects') {
					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						if (returnAll) {
							responseData = await viralAppApiRequestAllItems.call(
								this, 'GET', '/projects'
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = 1; // Default page  
							const response = await viralAppApiRequest.call(
								this, 'GET', '/projects', {}, 
								{ page, perPage: limit }
							);
							responseData = response.data;
						}
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/projects', { name, ...additionalFields }
						);
					} else if (operation === 'update') {
						const projectId = this.getNodeParameter('projectId', i, undefined, {
							extractValue: true,
						}) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
						responseData = await viralAppApiRequest.call(
							this, 'PUT', `/projects/${projectId}`, updateFields
						);
					} else if (operation === 'delete') {
						const projectId = this.getNodeParameter('projectId', i, undefined, {
							extractValue: true,
						}) as string;
						await viralAppApiRequest.call(
							this, 'DELETE', `/projects/${projectId}`
						);
						// Return standardized delete response
						responseData = { deleted: true };
					} else if (operation === 'addAccount') {
						const projectId = this.getNodeParameter('projectId', i, undefined, {
							extractValue: true,
						}) as string;
						const accountId = this.getNodeParameter('accountId', i, undefined, {
							extractValue: true,
						}) as string;
						responseData = await viralAppApiRequest.call(
							this, 'POST', `/projects/${projectId}/accounts/${accountId}`
						);
					} else if (operation === 'removeAccount') {
						const projectId = this.getNodeParameter('projectId', i, undefined, {
							extractValue: true,
						}) as string;
						const accountId = this.getNodeParameter('accountId', i, undefined, {
							extractValue: true,
						}) as string;
						responseData = await viralAppApiRequest.call(
							this, 'DELETE', `/projects/${projectId}/accounts/${accountId}`
						);
					}
				}
				
				// INTEGRATIONS
				else if (resource === 'integrations') {
					if (operation === 'getApps') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						
						if (returnAll) {
							responseData = await viralAppApiRequestAllItems.call(
								this, 'GET', '/apps'
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const page = 1; // Default page
							const response = await viralAppApiRequest.call(
								this, 'GET', '/apps', {}, 
								{ page, perPage: limit }
							);
							responseData = response.data;
						}
					}
				}
				
				// GENERAL ANALYTICS
				else if (resource === 'generalAnalytics') {
					if (operation === 'getTopVideos') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const dateRangeFrom = this.getNodeParameter('dateRangeFrom', i) as string;
						const dateRangeTo = this.getNodeParameter('dateRangeTo', i) as string;
						const queryParams = {
							...filters,
							'dateRange[from]': dateRangeFrom,
							'dateRange[to]': dateRangeTo,
						};
						responseData = await viralAppApiRequest.call(
							this, 'GET', '/analytics/top-videos', {}, queryParams
						);
					} else if (operation === 'getTopAccounts') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const dateRangeFrom = this.getNodeParameter('dateRangeFrom', i) as string;
						const dateRangeTo = this.getNodeParameter('dateRangeTo', i) as string;
						const queryParams = {
							...filters,
							'dateRange[from]': dateRangeFrom,
							'dateRange[to]': dateRangeTo,
						};
						responseData = await viralAppApiRequest.call(
							this, 'GET', '/analytics/top-accounts', {}, queryParams
						);
					} else if (operation === 'getKpis') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const dateRangeFrom = this.getNodeParameter('dateRangeFrom', i) as string;
						const dateRangeTo = this.getNodeParameter('dateRangeTo', i) as string;
						const queryParams = {
							...filters,
							'dateRange[from]': dateRangeFrom,
							'dateRange[to]': dateRangeTo,
						};
						responseData = await viralAppApiRequest.call(
							this, 'GET', '/analytics/kpis', {}, queryParams
						);
					} else if (operation === 'getInteractionMetrics') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const dateRangeFrom = this.getNodeParameter('dateRangeFrom', i) as string;
						const dateRangeTo = this.getNodeParameter('dateRangeTo', i) as string;
						const queryParams = {
							...filters,
							'dateRange[from]': dateRangeFrom,
							'dateRange[to]': dateRangeTo,
						};
						responseData = await viralAppApiRequest.call(
							this, 'GET', '/analytics/interaction-metrics', {}, queryParams
						);
					} else if (operation === 'exportDailyGains') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const dateRangeFrom = this.getNodeParameter('dateRangeFrom', i) as string;
						const dateRangeTo = this.getNodeParameter('dateRangeTo', i) as string;
						const body = {
							...filters,
							dateRange: {
								from: dateRangeFrom,
								to: dateRangeTo,
							},
						};
						responseData = await viralAppApiRequest.call(
							this, 'POST', '/analytics/video-daily-gains/export', body
						);
					}
				}
				
				// Format response data for n8n
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item: IDataObject) => ({ json: item })));
				} else if (responseData) {
					returnData.push({ json: responseData as IDataObject });
				}
				
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ 
						json: { 
							error: error.message,
							resource: this.getNodeParameter('resource', i),
							operation: this.getNodeParameter('operation', i),
						} 
					});
					continue;
				}
				throw error;
			}
		}
		
		return [returnData];
	}
}