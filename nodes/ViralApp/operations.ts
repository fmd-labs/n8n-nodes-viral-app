import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { cleanEmpty, viralAppApiRequest, viralAppApiRequestAllItems } from './GenericFunctions';

type OperationResult =
	| IDataObject
	| IDataObject[]
	| INodeExecutionData
	| INodeExecutionData[]
	| void;

type OperationHandler = (this: IExecuteFunctions, itemIndex: number) => Promise<OperationResult>;

type HandlerMap = Record<string, OperationHandler>;

export const operationHandlers: Record<string, HandlerMap> = {
	accountAnalytics: {
		getAll: accountAnalyticsGetAll,
		export: accountAnalyticsExport,
	},
	generalAnalytics: {
		getKpis: generalAnalyticsGetKpis,
		getTopVideos: generalAnalyticsGetTopVideos,
		getTopAccounts: generalAnalyticsGetTopAccounts,
		getInteractionMetrics: generalAnalyticsGetInteractionMetrics,
		exportDailyGains: generalAnalyticsExportDailyGains,
	},
	integrations: {
		getApps: integrationsGetApps,
	},
	projects: {
		getAll: projectsGetAll,
		create: projectsCreate,
		update: projectsUpdate,
		delete: projectsDelete,
		addAccount: projectsAddAccount,
		removeAccount: projectsRemoveAccount,
	},
	trackedAccounts: {
		getAll: trackedAccountsGetAll,
		add: trackedAccountsAdd,
		getCount: trackedAccountsGetCount,
		refresh: trackedAccountsRefresh,
		updateMaxVideos: trackedAccountsUpdateMaxVideos,
		updateHashtags: trackedAccountsUpdateHashtags,
		updateProjectHashtags: trackedAccountsUpdateProjectHashtags,
	},
	trackedIndividualVideos: {
		getAll: trackedIndividualVideosGetAll,
		add: trackedIndividualVideosAdd,
		refresh: trackedIndividualVideosRefresh,
	},
	videoAnalytics: {
		getAll: videoAnalyticsGetAll,
		get: videoAnalyticsGet,
		download: videoAnalyticsDownload,
		getHistory: videoAnalyticsGetHistory,
		getActivity: videoAnalyticsGetActivity,
		export: videoAnalyticsExport,
		getExcluded: videoAnalyticsGetExcluded,
		exclude: videoAnalyticsExclude,
		restoreExcluded: videoAnalyticsRestoreExcluded,
	},
};

const DEFAULT_EXPORT_LOOKBACK_DAYS = 14;

function ensureArray<T>(value: unknown): T[] {
	if (Array.isArray(value)) {
		return value as T[];
	}
	return [];
}

function toDateOnly(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}
	return value.split('T')[0];
}

function formatDateOnly(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function toId(value: unknown): string | undefined {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed || undefined;
	}

	if (typeof value === 'number') {
		return value.toString();
	}

	if (typeof value === 'object' && value !== null) {
		const candidate = (value as IDataObject).value ?? (value as IDataObject).id ?? (value as IDataObject).name;
		if (typeof candidate === 'string') {
			const trimmed = candidate.trim();
			return trimmed || undefined;
		}
	}

	return undefined;
}

function toIdArray(raw: unknown): string[] | undefined {
	if (raw === undefined || raw === null) {
		return undefined;
	}

	const values = Array.isArray(raw) ? raw : [raw];
	const ids = values
		.map((entry) => toId(entry))
		.filter((entry): entry is string => !!entry);

	return ids.length ? ids : undefined;
}

function getDefaultExportDateRange(): IDataObject {
	const end = new Date();
	const start = new Date(end);
	start.setDate(end.getDate() - DEFAULT_EXPORT_LOOKBACK_DAYS);

	return {
		from: formatDateOnly(start),
		to: formatDateOnly(end),
	};
}

function extractFixedDateRange(collection: IDataObject | undefined): IDataObject | undefined {
	if (!collection) {
		return undefined;
	}

	const ranges = ensureArray<IDataObject>(collection.range);
	if (ranges.length === 0) {
		return undefined;
	}

	const range = ranges[0];
	const from = toDateOnly(range.from);
	const to = toDateOnly(range.to);

	if (!from || !to) {
		return undefined;
	}

	return { from, to };
}

function parseHashtags(value: unknown): string[] | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	const tags = value
		.split(',')
		.map((tag) => tag.trim())
		.filter((tag) => tag !== '');

	return tags.length ? tags : undefined;
}

function getSimplifyFlag(this: IExecuteFunctions, itemIndex: number): boolean {
	return this.getNodeParameter('options.simplifyOutput', itemIndex, false) as boolean;
}

function simplifyAccountAnalytics(item: IDataObject): IDataObject {
	return {
		id: item.id,
		username: item.username,
		platform: item.platform,
		followerCount: item.followerCount,
		totalVideos: item.totalVideos,
		totalViews: item.totalViews,
		avgViews: item.avgViews,
		engagementRate: item.engagementRate,
		viralityRate: item.viralityRate,
		createdAt: item.createdAt,
	};
}

function simplifyTrackedAccount(item: IDataObject): IDataObject {
	return {
		id: item.id,
		username: item.username,
		platform: item.platform,
		status: item.status,
		maxVideos: item.maxVideos,
		lastSyncedAt: item.lastSyncedAt,
		createdAt: item.createdAt,
		videoCount: item.videoCount,
	};
}

function simplifyTrackedVideo(item: IDataObject): IDataObject {
	return {
		id: item.id,
		platformVideoId: item.platformVideoId,
		platform: item.platform,
		status: item.status,
		lastSyncedAt: item.lastSyncedAt,
		createdAt: item.createdAt,
		viewCount: item.viewCount,
		engagementRate: item.engagementRate,
	};
}

function simplifyProject(item: IDataObject): IDataObject {
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		logo: item.logo,
		trackedAccountsCount: Array.isArray(item.trackedAccounts)
			? (item.trackedAccounts as IDataObject[]).length
			: item.trackedAccountsCount,
		createdAt: item.createdAt,
	};
}

async function toBinaryExport(
	this: IExecuteFunctions,
	response: IDataObject,
	defaultFileName: string,
): Promise<INodeExecutionData[]> {
	const downloadUrl = response.downloadUrl as string | undefined;
	if (!downloadUrl) {
		return [
			{
				json: response,
			},
		];
	}

	const fileName = (response.fileName as string) || defaultFileName;
	const responseMime = (response.contentType as string) || (response.mimeType as string);

	const fileBuffer = await this.helpers.httpRequest({
		method: 'GET',
		url: downloadUrl,
		json: false,
		encoding: 'arraybuffer',
	});

	const rawData = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer as ArrayBuffer);

	const binary = await this.helpers.prepareBinaryData(rawData, fileName);
	binary.mimeType = responseMime || 'text/csv';

	return [
		{
			json: cleanEmpty({
				fileName,
				downloadUrl,
				expiresAt: response.expiresAt,
				rowCount: response.rowCount,
			}),
			binary: {
				data: binary,
			},
		},
	];
}

function resolveVideoSelection(
	this: IExecuteFunctions,
	itemIndex: number,
): { platform: string; videoId: string } {
	const rawSelection = this.getNodeParameter('platformVideoId', itemIndex, undefined, {
		extractValue: false,
	}) as string | IDataObject | undefined;

	let selection = '';

	if (typeof rawSelection === 'string') {
		selection = rawSelection.trim();
	} else if (rawSelection && typeof rawSelection === 'object') {
		const value = (rawSelection.value ?? rawSelection.id ?? rawSelection.name) as
			| string
			| undefined;
		if (value) {
			selection = value.trim();
		}
	}

	const platformParam = this.getNodeParameter('platform', itemIndex) as string;

	let derivedPlatform: string | undefined;
	let videoId = selection;

	if (selection.includes(':')) {
		const [platformPart, idPart] = selection.split(':', 2);
		if (platformPart) {
			derivedPlatform = platformPart.toLowerCase();
		}
		if (idPart) {
			videoId = idPart;
		}
	}

	if (!videoId) {
		throw new NodeOperationError(this.getNode(), 'Video ID is required.');
	}

	const platform = derivedPlatform || platformParam;

	if (!platform) {
		throw new NodeOperationError(this.getNode(), 'Platform is required.');
	}

	return {
		platform,
		videoId,
	};
}

async function toBinaryDownload(
	this: IExecuteFunctions,
	response: IDataObject,
	defaultFileName: string,
	mimeFallback = 'application/octet-stream',
): Promise<INodeExecutionData[]> {
	const downloadUrl = response.downloadUrl as string | undefined;
	if (!downloadUrl) {
		return [
			{
				json: response,
			},
		];
	}

	const fileName = (response.fileName as string) || defaultFileName;
	const responseMime = (response.contentType as string) || (response.mimeType as string);

	const fileBuffer = await this.helpers.httpRequest({
		method: 'GET',
		url: downloadUrl,
		json: false,
		encoding: 'arraybuffer',
	});

	const rawData = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer as ArrayBuffer);
	const mimeType = responseMime || mimeFallback;

	const binary = await this.helpers.prepareBinaryData(rawData, fileName);
	if (mimeType) {
		binary.mimeType = mimeType;
	}

	return [
		{
			json: cleanEmpty({
				fileName,
				downloadUrl,
				expiresAt: response.expiresAt,
				consumedExtraCredit: response.consumedExtraCredit,
			}),
			binary: {
				data: binary,
			},
		},
	];
}

function applyDateRangeFilter(
	this: IExecuteFunctions,
	query: IDataObject,
	fromValue: unknown,
	toValue: unknown,
): void {
	const from = toDateOnly(fromValue);
	const to = toDateOnly(toValue);

	if ((from && !to) || (!from && to)) {
		throw new NodeOperationError(
			this.getNode(),
			'Either provide both Date Range From and Date Range To, or leave both empty.',
		);
	}

	if (from && to) {
		const fromDate = new Date(from);
		const toDate = new Date(to);

		if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
			throw new NodeOperationError(this.getNode(), 'Invalid date range provided.');
		}

		if (fromDate > toDate) {
			throw new NodeOperationError(
				this.getNode(),
				'Date Range From must be on or before Date Range To.',
			);
		}

		query['dateRange[from]'] = from;
		query['dateRange[to]'] = to;
	}
}

function simplifyApp(item: IDataObject): IDataObject {
	return {
		id: item.id,
		title: item.title,
		provider: item.provider,
		lastSeenAt: item.lastSeenAt,
		nextSyncAt: item.nextSyncAt,
		createdAt: item.createdAt,
	};
}

function getLimit(this: IExecuteFunctions, itemIndex: number): number {
	const limit = this.getNodeParameter('limit', itemIndex) as number;
	return Math.max(Math.min(limit, 100), 1);
}

async function fetchCollection(
	this: IExecuteFunctions,
	endpoint: string,
	itemIndex: number,
	query: IDataObject,
	simplifyFn?: (item: IDataObject) => IDataObject,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
	let items: IDataObject[];

	if (returnAll) {
		items = await viralAppApiRequestAllItems.call(this, 'GET', endpoint, {}, query);
	} else {
		const limit = getLimit.call(this, itemIndex);
		const response = await viralAppApiRequest.call(
			this,
			'GET',
			endpoint,
			{},
			{ ...query, page: 1, perPage: limit },
		);
		const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
		items = (data as IDataObject[]).slice(0, limit);
	}

	if (!Array.isArray(items)) {
		items = [];
	}

	return simplifyFn ? items.map(simplifyFn) : items;
}

async function accountAnalyticsGetAll(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query: IDataObject = cleanEmpty({
		search: filters.search,
		platforms: filters.platforms,
		accounts: toIdArray(filters.accounts),
		projects: toIdArray(filters.projects),
		contentTypes: filters.contentTypes,
	});

	applyDateRangeFilter.call(this, query, filters.dateRangeFrom, filters.dateRangeTo);

	if (filters.sortCol) {
		query.sortCol = filters.sortCol;
	}

	if (filters.sortDir) {
		query.sortDir = filters.sortDir;
	}

	return fetchCollection.call(this, '/accounts', itemIndex, query, simplify ? simplifyAccountAnalytics : undefined);
}

async function accountAnalyticsExport(this: IExecuteFunctions, itemIndex: number) {
	const exportBody = (this.getNodeParameter('exportBody', itemIndex, {}) as IDataObject) || {};
	const payload: IDataObject = {};

	if (exportBody.search) {
		payload.search = exportBody.search;
	}

	payload.platforms = toIdArray(exportBody.platforms);
	payload.accounts = toIdArray(exportBody.accounts);
	payload.projects = toIdArray(exportBody.projects);

	if (Array.isArray(exportBody.contentTypes) && exportBody.contentTypes.length) {
		payload.contentTypes = exportBody.contentTypes;
	}

	if (exportBody.dateRange && typeof exportBody.dateRange === 'object') {
		const range = extractFixedDateRange(exportBody.dateRange as IDataObject);
		if (range) {
			payload.dateRange = range;
		}
	}

	if (!payload.dateRange) {
		payload.dateRange = getDefaultExportDateRange();
	}

	const response = (await viralAppApiRequest.call(
		this,
		'POST',
		'/accounts/export',
		payload,
	)) as IDataObject;

	return toBinaryExport.call(this, response, 'accounts-export.csv');
}

async function trackedAccountsGetAll(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const simplify = getSimplifyFlag.call(this, itemIndex);
	const usernameFilter = filters.username as string | undefined;

	const query: IDataObject = cleanEmpty({
		username: usernameFilter,
		search: usernameFilter,
		platforms: filters.platforms,
		projects: toIdArray(filters.projects),
		sortCol: filters.sortCol,
		sortDir: filters.sortDir,
	});

	return fetchCollection.call(
		this,
		'/accounts/tracked',
		itemIndex,
		query,
		simplify ? simplifyTrackedAccount : undefined,
	);
}

async function trackedAccountsAdd(this: IExecuteFunctions, itemIndex: number) {
	const accountsCollection = this.getNodeParameter(
		'accounts.account',
		itemIndex,
		[],
	) as IDataObject[];
	if (!Array.isArray(accountsCollection) || accountsCollection.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one account must be provided.');
	}

	const accounts = accountsCollection.map((raw) => {
		const payload: IDataObject = {
			platform: raw.platform,
			username: raw.username,
			max_videos: raw.max_videos,
		};

		return cleanEmpty(payload);
	});

	return viralAppApiRequest.call(this, 'POST', '/accounts/tracked', { accounts });
}

async function trackedAccountsGetCount(this: IExecuteFunctions, _itemIndex: number) {
	const response = await viralAppApiRequest.call(this, 'GET', '/accounts/tracked/count');
	if (typeof response === 'number') {
		return { count: response };
	}
	if (response?.count !== undefined) {
		return { count: response.count };
	}
	return { count: response };
}

async function trackedAccountsRefresh(this: IExecuteFunctions, itemIndex: number) {
	const accountsCollection = this.getNodeParameter(
		'accounts.account',
		itemIndex,
		[],
	) as IDataObject[];
	if (!Array.isArray(accountsCollection) || accountsCollection.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one account must be provided.');
	}

	const items = accountsCollection.map((account) => ({
		platform: account.platform as string,
		id: account.accountId as string,
	}));

	return viralAppApiRequest.call(this, 'POST', '/accounts/tracked/refresh', { items });
}

async function trackedAccountsUpdateMaxVideos(this: IExecuteFunctions, itemIndex: number) {
	const accountId = this.getNodeParameter('accountId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const maxVideos = this.getNodeParameter('maxVideos', itemIndex) as number;
	return viralAppApiRequest.call(this, 'PUT', `/accounts/tracked/${accountId}/max-videos`, {
		newMaxVideos: maxVideos,
	});
}

async function trackedAccountsUpdateHashtags(this: IExecuteFunctions, itemIndex: number) {
	const accountId = this.getNodeParameter('accountId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const hashtags = parseHashtags(this.getNodeParameter('hashtags', itemIndex));
	return viralAppApiRequest.call(this, 'PUT', `/accounts/tracked/${accountId}/hashtags`, {
		hashtagsFilter: hashtags ?? [],
	});
}

async function trackedAccountsUpdateProjectHashtags(this: IExecuteFunctions, itemIndex: number) {
	const accountId = this.getNodeParameter('accountId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const entries = this.getNodeParameter(
		'projectHashtags.projectHashtag',
		itemIndex,
		[],
	) as IDataObject[];

	if (!Array.isArray(entries) || entries.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Provide at least one project hashtag entry.');
	}

	const projectHashtags = entries.map((entry, index) => {
		const rawProject = entry.projectId;
		let projectId: string | undefined;

		if (typeof rawProject === 'string') {
			projectId = rawProject;
		} else if (rawProject && typeof rawProject === 'object') {
			const candidate =
				(rawProject as IDataObject).value ??
				(rawProject as IDataObject).id ??
				(rawProject as IDataObject).name;
			if (typeof candidate === 'string') {
				projectId = candidate;
			}
		}

		if (!projectId) {
			throw new NodeOperationError(this.getNode(), `Project is required for entry #${index + 1}.`);
		}

		const hashtags = parseHashtags(entry.hashtags);

		return {
			projectId,
			hashtagsFilter: hashtags ?? [],
		};
	});

	return viralAppApiRequest.call(this, 'PUT', `/accounts/tracked/${accountId}/project-hashtags`, {
		projectHashtags,
	});
}

async function trackedIndividualVideosGetAll(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query: IDataObject = cleanEmpty({
		search: filters.search,
		platforms: filters.platforms,
		sortCol: filters.sortCol,
		sortDir: filters.sortDir,
	});

	return fetchCollection.call(
		this,
		'/videos/tracked',
		itemIndex,
		query,
		simplify ? simplifyTrackedVideo : undefined,
	);
}

async function trackedIndividualVideosAdd(this: IExecuteFunctions, itemIndex: number) {
	const videosCollection = this.getNodeParameter('videos.video', itemIndex, []) as IDataObject[];
	if (!Array.isArray(videosCollection) || videosCollection.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one video must be provided.');
	}

	return viralAppApiRequest.call(this, 'POST', '/videos/tracked', {
		videos: videosCollection.map((video) =>
			cleanEmpty({
				platform: video.platform,
				videoId: video.videoId,
			}),
		),
	});
}

async function trackedIndividualVideosRefresh(this: IExecuteFunctions, itemIndex: number) {
	const videosCollection = this.getNodeParameter('videos.video', itemIndex, []) as IDataObject[];
	if (!Array.isArray(videosCollection) || videosCollection.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one video must be provided.');
	}

	const items = videosCollection.map((video) => ({
		platform: video.platform as string,
		id: video.videoId as string,
	}));

	return viralAppApiRequest.call(this, 'POST', '/videos/tracked/refresh', { items });
}

async function projectsGetAll(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query: IDataObject = cleanEmpty({
		search: filters.name,
	});

	return fetchCollection.call(
		this,
		'/projects',
		itemIndex,
		query,
		simplify ? simplifyProject : undefined,
	);
}

async function projectsCreate(this: IExecuteFunctions, itemIndex: number) {
	const name = this.getNodeParameter('name', itemIndex) as string;
	const additional =
		(this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject) || {};
	return viralAppApiRequest.call(this, 'POST', '/projects', cleanEmpty({ name, ...additional }));
}

async function projectsUpdate(this: IExecuteFunctions, itemIndex: number) {
	const projectId = this.getNodeParameter('projectId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const updateFields = (this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject) || {};
	return viralAppApiRequest.call(this, 'PUT', `/projects/${projectId}`, cleanEmpty(updateFields));
}

async function projectsDelete(this: IExecuteFunctions, itemIndex: number) {
	const projectId = this.getNodeParameter('projectId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	await viralAppApiRequest.call(this, 'DELETE', `/projects/${projectId}`);
	return { deleted: true };
}

async function projectsAddAccount(this: IExecuteFunctions, itemIndex: number) {
	const projectId = this.getNodeParameter('projectId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const accountId = this.getNodeParameter('accountId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	return viralAppApiRequest.call(this, 'POST', `/projects/${projectId}/accounts/${accountId}`);
}

async function projectsRemoveAccount(this: IExecuteFunctions, itemIndex: number) {
	const projectId = this.getNodeParameter('projectId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const accountId = this.getNodeParameter('accountId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	await viralAppApiRequest.call(this, 'DELETE', `/projects/${projectId}/accounts/${accountId}`);
	return { deleted: true };
}

async function integrationsGetApps(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query: IDataObject = cleanEmpty({
		provider: filters.provider,
		search: filters.search,
		sortCol: filters.sortCol,
		sortDir: filters.sortDir,
	});

	return fetchCollection.call(this, '/apps', itemIndex, query, simplify ? simplifyApp : undefined);
}

async function videoAnalyticsGetAll(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const expand = (this.getNodeParameter('expand', itemIndex, []) as string[]) || [];
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query: IDataObject = cleanEmpty({
		search: filters.search,
		platforms: filters.platforms,
		projects: toIdArray(filters.projects),
		accounts: toIdArray(filters.accounts),
		sortCol: filters.sortCol,
		sortDir: filters.sortDir,
		contentTypes: filters.contentTypes,
		expand: expand,
	});

	applyDateRangeFilter.call(this, query, filters.dateRangeFrom, filters.dateRangeTo);

	const items = await fetchCollection.call(this, '/videos', itemIndex, query);

	if (simplify) {
		return items.map((item) => ({
			id: item.id,
			platformVideoId: item.platformVideoId,
			platform: item.platform,
			title: item.title,
			accountUsername: item.accountUsername,
			viewCount: item.viewCount,
			likeCount: item.likeCount,
			commentCount: item.commentCount,
			shareCount: item.shareCount,
			publishedAt: item.publishedAt,
		}));
	}

	return items;
}

async function videoAnalyticsGet(this: IExecuteFunctions, itemIndex: number) {
	const { platform, videoId } = resolveVideoSelection.call(this, itemIndex);
	return viralAppApiRequest.call(this, 'GET', `/videos/${platform}/${videoId}`);
}

async function videoAnalyticsDownload(this: IExecuteFunctions, itemIndex: number) {
	const { platform, videoId } = resolveVideoSelection.call(this, itemIndex);
	const response = (await viralAppApiRequest.call(
		this,
		'GET',
		`/videos/${platform}/${videoId}/download`,
	)) as IDataObject;

	const defaultFileName = `${platform}-${videoId}.mp4`;
	return toBinaryDownload.call(this, response, defaultFileName, 'video/mp4');
}

async function videoAnalyticsGetHistory(this: IExecuteFunctions, itemIndex: number) {
	const { platform, videoId } = resolveVideoSelection.call(this, itemIndex);
	return viralAppApiRequest.call(this, 'GET', `/videos/${platform}/${videoId}/history`);
}

async function videoAnalyticsGetActivity(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('activityFilters', itemIndex, {}) as IDataObject) || {};
	const query: IDataObject = cleanEmpty({
		days: filters.days,
		platforms: filters.platforms,
		accounts: filters.accounts,
		projects: filters.projects,
	});
	return viralAppApiRequest.call(this, 'GET', '/videos/activity', {}, query);
}

async function videoAnalyticsExport(this: IExecuteFunctions, itemIndex: number) {
	const exportBody = (this.getNodeParameter('exportBody', itemIndex, {}) as IDataObject) || {};
	const payload: IDataObject = {};

	if (exportBody.accountUsername) {
		payload.accountUsername = exportBody.accountUsername;
	}

	payload.platforms = toIdArray(exportBody.platforms);
	payload.accounts = toIdArray(exportBody.accounts);
	payload.projects = toIdArray(exportBody.projects);

	if (Array.isArray(exportBody.contentTypes) && exportBody.contentTypes.length) {
		payload.contentTypes = exportBody.contentTypes;
	}

	if (exportBody.dateRange && typeof exportBody.dateRange === 'object') {
		const range = extractFixedDateRange(exportBody.dateRange as IDataObject);
		if (range) {
			payload.dateRange = range;
		}
	}

	if (!payload.dateRange) {
		payload.dateRange = getDefaultExportDateRange();
	}

	if (exportBody.sortCol) {
		payload.sortCol = exportBody.sortCol;
	}

	if (exportBody.sortDir) {
		payload.sortDir = exportBody.sortDir;
	}

	const response = (await viralAppApiRequest.call(
		this,
		'POST',
		'/videos/export',
		payload,
	)) as IDataObject;

	return toBinaryExport.call(this, response, 'videos-export.csv');
}

async function videoAnalyticsGetExcluded(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query: IDataObject = cleanEmpty({
		search: filters.search,
		platforms: filters.platforms,
		accounts: toIdArray(filters.accounts),
		sortCol: filters.sortCol,
		sortDir: filters.sortDir,
	});

	const items = await fetchCollection.call(this, '/videos/excluded', itemIndex, query);

	if (!simplify) {
		return items;
	}

	return items.map((item) =>
		cleanEmpty({
			id: item.id,
			orgAccountId: item.orgAccountId,
			platform: item.platform,
			platformAccountId: item.platformAccountId,
			platformVideoId: item.platformVideoId,
			username: item.username,
			accountDisplayName: item.accountDisplayName,
			createdAt: item.createdAt,
			actorType: item.actorType,
		}),
	);
}

async function videoAnalyticsExclude(this: IExecuteFunctions, itemIndex: number) {
	const platform = this.getNodeParameter('platform', itemIndex) as string;
	const orgAccountId = this.getNodeParameter('orgAccountId', itemIndex, undefined, {
		extractValue: true,
	}) as string;
	const platformVideoIdRaw = this.getNodeParameter('platformVideoId', itemIndex) as
		| string
		| IDataObject;

	const extractVideoId = (value: unknown): string | undefined => {
		if (typeof value === 'string') {
			return value.trim() || undefined;
		}
		if (typeof value === 'object' && value !== null) {
			const modeValue = (value as IDataObject).value;
			if (typeof modeValue === 'string') {
				return modeValue.trim() || undefined;
			}
		}
		return undefined;
	};

	const platformVideoId = extractVideoId(platformVideoIdRaw);

	if (!platformVideoId) {
		throw new NodeOperationError(this.getNode(), 'Platform Video ID is required.');
	}

	let platformAccountId: string | undefined = undefined;

	// Resolve platformAccountId from video details
	const videoDetails = (await viralAppApiRequest.call(
		this,
		'GET',
		`/videos/${platform}/${platformVideoId}`,
	)) as IDataObject;

	if (typeof videoDetails.platformAccountId === 'string') {
		platformAccountId = videoDetails.platformAccountId;
	}

	if (!platformAccountId) {
		throw new NodeOperationError(
			this.getNode(),
			'Platform Account ID could not be inferred from the selected video.',
		);
	}

	return viralAppApiRequest.call(this, 'POST', '/videos/excluded', {
		entries: [
			cleanEmpty({
				orgAccountId,
				platform,
				platformAccountId,
				platformVideoId,
			}),
		],
	});
}

async function videoAnalyticsRestoreExcluded(this: IExecuteFunctions, itemIndex: number) {
	const excludedId = (this.getNodeParameter('excludedVideoId', itemIndex) as string).trim();

	if (!excludedId) {
		throw new NodeOperationError(this.getNode(), 'Excluded video ID is required.');
	}

	const payload = { ids: [excludedId] };

	// Send both as body and as query to satisfy validation and infrastructure that strip DELETE bodies.
	const response = await viralAppApiRequest.call(
		this,
		'DELETE',
		'/videos/excluded',
		payload,
		payload,
	);

	// Normalize a simple shape for the UI
	return {
		deleted: (response as IDataObject)?.deleted ?? response,
	};
}

function buildGeneralFilters(filters: IDataObject): IDataObject {
	const query: IDataObject = cleanEmpty({
		platforms: filters.platforms,
		projects: toIdArray(filters.projects),
		accounts: toIdArray(filters.accounts),
		contentTypes: filters.contentTypes,
		limit: filters.limit,
		metric: filters.metric,
		onlyPublished: filters.onlyPublished,
	});

	return query;
}

async function generalAnalyticsGetKpis(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const fromRaw = this.getNodeParameter('dateRangeFrom', itemIndex) as string;
	const toRaw = this.getNodeParameter('dateRangeTo', itemIndex) as string;

	const query = buildGeneralFilters(filters);
	applyDateRangeFilter.call(this, query, fromRaw, toRaw);

	const simplify = getSimplifyFlag.call(this, itemIndex);
	const response = await viralAppApiRequest.call(this, 'GET', '/analytics/kpis', {}, query);

	if (!simplify) {
		return response;
	}

	return {
		videoCount: response.videoCount,
		viewCount: response.viewCount,
		likeCount: response.likeCount,
		commentCount: response.commentCount,
		shareCount: response.shareCount,
		engagementRate: response.engagementRate,
	};
}

async function generalAnalyticsGetTopVideos(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const fromRaw = this.getNodeParameter('dateRangeFrom', itemIndex) as string;
	const toRaw = this.getNodeParameter('dateRangeTo', itemIndex) as string;
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query = buildGeneralFilters(filters);
	applyDateRangeFilter.call(this, query, fromRaw, toRaw);

	const response = await viralAppApiRequest.call(this, 'GET', '/analytics/top-videos', {}, query);

	const items = Array.isArray(response) ? response : (response?.data ?? response);

	if (!simplify || !Array.isArray(items)) {
		return items;
	}

	return (items as IDataObject[]).map((item) => ({
		id: item.id,
		platform: item.platform,
		accountUsername: item.accountUsername,
		caption: item.caption,
		viewCount: item.viewCount,
		likeCount: item.likeCount,
		engagementRate: item.engagementRate,
		publishedAt: item.publishedAt,
	}));
}

async function generalAnalyticsGetTopAccounts(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const fromRaw = this.getNodeParameter('dateRangeFrom', itemIndex) as string;
	const toRaw = this.getNodeParameter('dateRangeTo', itemIndex) as string;
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query = buildGeneralFilters(filters);
	applyDateRangeFilter.call(this, query, fromRaw, toRaw);

	const response = await viralAppApiRequest.call(this, 'GET', '/analytics/top-accounts', {}, query);
	const items = Array.isArray(response) ? response : (response?.data ?? response);

	if (!simplify || !Array.isArray(items)) {
		return items;
	}

	return (items as IDataObject[]).map((item) => ({
		id: item.id,
		platform: item.platform,
		username: item.username,
		followerCount: item.followerCount,
		totalVideos: item.totalVideos,
		totalViews: item.totalViews,
		engagementRate: item.engagementRate,
	}));
}

async function generalAnalyticsGetInteractionMetrics(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const fromRaw = this.getNodeParameter('dateRangeFrom', itemIndex) as string;
	const toRaw = this.getNodeParameter('dateRangeTo', itemIndex) as string;
	const simplify = getSimplifyFlag.call(this, itemIndex);

	const query = buildGeneralFilters(filters);
	applyDateRangeFilter.call(this, query, fromRaw, toRaw);

	const response = await viralAppApiRequest.call(
		this,
		'GET',
		'/analytics/interaction-metrics',
		{},
		query,
	);

	if (!simplify) {
		return response;
	}

	const dailyMetrics = ensureArray<IDataObject>(response?.dailyMetrics);
	return dailyMetrics.map((item) => ({
		date: item.date,
		views: item.views,
		likes: item.likes,
		comments: item.comments,
		shares: item.shares,
		bookmarks: item.bookmarks,
	}));
}

async function generalAnalyticsExportDailyGains(this: IExecuteFunctions, itemIndex: number) {
	const filters = (this.getNodeParameter('filters', itemIndex, {}) as IDataObject) || {};
	const fromRaw = this.getNodeParameter('dateRangeFrom', itemIndex) as string;
	const toRaw = this.getNodeParameter('dateRangeTo', itemIndex) as string;
	const from = toDateOnly(fromRaw);
	const to = toDateOnly(toRaw);

	if ((from && !to) || (!from && to)) {
		throw new NodeOperationError(
			this.getNode(),
			'Either provide both Date Range From and Date Range To, or leave both empty.',
		);
	}

	const body = buildGeneralFilters(filters);
	if (from && to) {
		body.dateRange = { from, to };
	}

	const response = (await viralAppApiRequest.call(
		this,
		'POST',
		'/analytics/video-daily-gains/export',
		body,
	)) as IDataObject;

	return toBinaryExport.call(this, response, 'video-daily-gains.csv');
}
