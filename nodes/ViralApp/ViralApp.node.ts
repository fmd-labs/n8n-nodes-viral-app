import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	NodeOperationError,
	VersionedNodeType,
} from 'n8n-workflow';

import { viralAppApiRequest } from './GenericFunctions';
import { resolveBaseUrl } from './baseUrl';
import { operationHandlers } from './operations';

import { trackedAccountsOperations, trackedAccountsFields } from './descriptions/TrackedAccounts';
import {
	trackedIndividualVideosOperations,
	trackedIndividualVideosFields,
} from './descriptions/TrackedIndividualVideos';
import {
	accountAnalyticsOperations,
	accountAnalyticsFields,
} from './descriptions/AccountAnalytics';
import { videoAnalyticsOperations, videoAnalyticsFields } from './descriptions/VideoAnalytics';
import {
	generalAnalyticsOperations,
	generalAnalyticsFields,
} from './descriptions/GeneralAnalytics';
import { projectsOperations, projectsFields } from './descriptions/Projects';
import { integrationsOperations, integrationsFields } from './descriptions/Integrations';

class ViralAppV1 implements INodeType {
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
		requestDefaults: {
			baseURL: resolveBaseUrl(),
			json: true,
		},
		hints: [
			{
				message:
					'Large datasets may take time to process. Consider using filters to reduce response size.',
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
						name: 'Account Data',
						value: 'accountAnalytics',
						description: 'Analytics for tracked accounts',
					},
					{
						name: 'General Data',
						value: 'generalAnalytics',
						description: 'General analytics and overview',
					},
					{
						name: 'Integration',
						value: 'integrations',
						description: 'Third-party integrations',
					},
					{
						name: 'Project',
						value: 'projects',
						description: 'Project management',
					},
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
						name: 'Video Data',
						value: 'videoAnalytics',
						description: 'Analytics for tracked videos',
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

			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'accountAnalytics',
							'trackedAccounts',
							'trackedIndividualVideos',
							'projects',
							'integrations',
							'videoAnalytics',
							'generalAnalytics',
						],
						operation: [
							'getAll',
							'getApps',
							'getKpis',
							'getTopVideos',
							'getTopAccounts',
							'getInteractionMetrics',
						],
					},
				},
				options: [
					{
						displayName: 'Simplify Output',
						name: 'simplifyOutput',
						type: 'boolean',
						default: false,
						description:
							'Whether to return a simplified version of the response instead of the raw data',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async accountSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				return fetchListSearch.call(
					this,
					'/accounts',
					{ search: filter },
					(account) => ({
						name: `${account.username} (${PLATFORM_DISPLAY[account.platform as string] || account.platform})`,
						value: account.id as string,
						description: `${account.followerCount || 0} followers`,
					}),
					paginationToken,
				);
			},

			async projectSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				return fetchListSearch.call(
					this,
					'/projects',
					{ name: filter },
					(project) => ({
						name: project.name as string,
						value: project.id as string,
					}),
					paginationToken,
				);
			},

			async trackedAccountSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const selectedPlatform = this.getCurrentNodeParameter('platform') as string | undefined;

				const baseQuery: IDataObject = {};
				if (selectedPlatform) {
					baseQuery.platforms = [selectedPlatform];
				}

				if (filter) {
					baseQuery.search = filter;
				}

				return fetchListSearch.call(
					this,
					'/accounts',
					baseQuery,
					(account) => ({
						name: `${account.username} (${PLATFORM_DISPLAY[account.platform as string] || account.platform})`,
						value: account.id as string,
					}),
					paginationToken,
				);
			},

			async videoSearch(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const selectedPlatform = this.getCurrentNodeParameter('platform') as string | undefined;
				const platform =
					typeof selectedPlatform === 'string' && selectedPlatform.trim().length > 0
						? selectedPlatform.trim().toLowerCase()
						: undefined;

				if (!platform) {
					return { results: [], paginationToken: undefined };
				}

				const selectedOrgAccount = this.getCurrentNodeParameter('orgAccountId') as
					| string
					| IDataObject
					| undefined;

				const orgAccountId = extractLocatorId(selectedOrgAccount);

				const baseQuery: IDataObject = {
					platforms: [platform],
				};

				if (orgAccountId) {
					baseQuery.accounts = [orgAccountId];
				}

				return fetchListSearch.call(
					this,
					'/videos',
					baseQuery,
					(video) => {
						const videoId = getVideoId(video);
						if (!videoId) {
							return null;
						}
						return {
							name: buildVideoDisplayName(video, videoId),
							value: videoId,
						};
					},
					paginationToken,
					(video) => videoMatchesFilter(video, filter),
				);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				const resourceHandlers = operationHandlers[resource];
				if (!resourceHandlers) {
					throw new NodeOperationError(this.getNode(), `Unsupported resource "${resource}".`, {
						description: 'Review the node documentation for supported resources.',
					});
				}

				const handler = resourceHandlers[operation];
				if (!handler) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation "${operation}" for resource "${resource}".`,
					);
				}

				const result = await handler.call(this, itemIndex);
				const normalized = normalizeResult(result);

				if (normalized.length === 0) {
					returnData.push({
						json: { success: true },
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				for (const entry of normalized) {
					if (!entry.pairedItem) {
						entry.pairedItem = { item: itemIndex };
					}
					returnData.push(entry);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
							resource: this.getNodeParameter('resource', itemIndex, ''),
							operation: this.getNodeParameter('operation', itemIndex, ''),
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

export class ViralApp extends VersionedNodeType {
	constructor() {
		const node = new ViralAppV1();
		super(
			{
				1: node,
			},
			node.description,
		);
	}
}

const PLATFORM_DISPLAY: { [key: string]: string } = {
	tiktok: 'TikTok',
	instagram: 'Instagram',
	youtube: 'YouTube',
};

async function fetchListSearch(
	this: ILoadOptionsFunctions,
	endpoint: string,
	baseQuery: IDataObject,
	mapFn: (item: IDataObject) => { name: string; value: string; description?: string } | null,
	paginationToken?: string,
	filterFn?: (item: IDataObject) => boolean,
): Promise<INodeListSearchResult> {
	const page = paginationToken ? parseInt(paginationToken, 10) : 1;
	const perPage = 100;

	const query = {
		...baseQuery,
		page,
		perPage,
	};

	const response = await viralAppApiRequest.call(this, 'GET', endpoint, {}, query);
	const data = Array.isArray(response?.data) ? (response.data as IDataObject[]) : [];
	const filtered = filterFn ? data.filter(filterFn) : data;

	const results = filtered
		.map(mapFn)
		.filter((entry): entry is { name: string; value: string; description?: string } => entry !== null);

	return {
		results,
		paginationToken: response.pageCount > page ? (page + 1).toString() : undefined,
	};
}

function extractLocatorId(value: string | IDataObject | undefined): string | undefined {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed || undefined;
	}

	if (value && typeof value === 'object' && 'value' in value && typeof (value as IDataObject).value === 'string') {
		const trimmed = ((value as IDataObject).value as string).trim();
		return trimmed || undefined;
	}

	return undefined;
}

function videoMatchesFilter(video: IDataObject, filter?: string): boolean {
	const filterText = filter?.toLowerCase().trim();
	if (!filterText) return true;

	const id = typeof video.platformVideoId === 'string' ? video.platformVideoId.toLowerCase() : '';
	const title = typeof video.title === 'string' ? video.title.toLowerCase() : '';
	const account = typeof video.accountUsername === 'string' ? video.accountUsername.toLowerCase() : '';

	return id.includes(filterText) || title.includes(filterText) || account.includes(filterText);
}

function getVideoId(video: IDataObject): string | undefined {
	const rawId = video.platformVideoId;

	if (typeof rawId === 'string') {
		const trimmed = rawId.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	if (typeof rawId === 'number') {
		return rawId.toString();
	}

	return undefined;
}

function buildVideoDisplayName(video: IDataObject, videoId: string): string {
	const title = typeof video.title === 'string' ? video.title.trim() : '';
	const account = typeof video.accountUsername === 'string' ? video.accountUsername.trim() : '';

	const primary = title ? `${title} (${videoId})` : videoId;
	return account ? `${primary} · ${account}` : primary;
}

function normalizeEntry(entry: unknown): IDataObject {
	if (typeof entry === 'object' && entry !== null) {
		return entry as IDataObject;
	}

	if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
		return { value: entry };
	}

	if (entry === null || entry === undefined) {
		return { value: entry ?? null };
	}

	return { value: JSON.stringify(entry) };
}

function isExecutionData(entry: unknown): entry is INodeExecutionData {
	return (
		typeof entry === 'object' &&
		entry !== null &&
		('json' in (entry as IDataObject) || 'binary' in (entry as IDataObject))
	);
}

function normalizeResult(result: unknown): INodeExecutionData[] {
	if (result === undefined || result === null) {
		return [];
	}

	if (Array.isArray(result)) {
		if (result.every(isExecutionData)) {
			return (result as INodeExecutionData[]).map((entry) => ({
				json: entry.json ?? {},
				binary: entry.binary,
				pairedItem: entry.pairedItem,
			}));
		}

		return (result as unknown[]).map((entry) => ({
			json: normalizeEntry(entry),
		}));
	}

	if (isExecutionData(result)) {
		return [
			{
				json: result.json ?? {},
				binary: result.binary,
				pairedItem: result.pairedItem,
			},
		];
	}

	return [
		{
			json: normalizeEntry(result),
		},
	];
}
