import { INodeProperties } from 'n8n-workflow';

export const videoAnalyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List tracked videos with analytics',
				action: 'List tracked videos with analytics',
				routing: {
					request: {
						method: 'GET',
						url: '/videos',
						qs: {
							page: '={{$parameter.returnAll ? ($pageCount || 0) + 1 : $parameter.page}}',
							perPage: '={{$parameter.returnAll ? 100 : $parameter.limit}}',
						},
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
							{
								type: 'setKeyValue',
								properties: {
									pageCount: '={{$response.body.pageCount}}',
									totalRows: '={{$response.body.totalRows}}',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get specific video metrics',
				action: 'Get specific video metrics',
				routing: {
					request: {
						method: 'GET',
						url: '=/videos/{{$parameter.platform}}/{{$parameter.platformVideoId}}',
					},
				},
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get video history metrics',
				action: 'Get video history metrics',
				routing: {
					request: {
						method: 'GET',
						url: '=/videos/{{$parameter.platform}}/{{$parameter.platformVideoId}}/history',
					},
				},
			},
			{
				name: 'Get Activity',
				value: 'getActivity',
				description: 'Get video activity timeline',
				action: 'Get video activity timeline',
				routing: {
					request: {
						method: 'GET',
						url: '/videos/activity',
					},
				},
			},
			{
				name: 'Export',
				value: 'export',
				description: 'Export videos to CSV',
				action: 'Export videos to CSV',
				routing: {
					request: {
						method: 'POST',
						url: '/videos/export',
					},
				},
			},
		],
		default: 'getAll',
	},
];

export const videoAnalyticsFields: INodeProperties[] = [
	// ----------------------------------------
	//      videoAnalytics: get, getHistory
	// ----------------------------------------
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'options',
		options: [
			{
				name: 'Instagram',
				value: 'instagram',
			},
			{
				name: 'TikTok',
				value: 'tiktok',
			},
			{
				name: 'YouTube',
				value: 'youtube',
			},
		],
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['get', 'getHistory'],
			},
		},
		default: 'tiktok',
		required: true,
		description: 'Social media platform',
	},
	{
		displayName: 'Video',
		name: 'platformVideoId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['get', 'getHistory'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a video...',
				typeOptions: {
					searchListMethod: 'videoSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'Enter platform-specific video ID',
			},
		],
		description: 'The video to get analytics for',
		extractValue: {
			type: 'regex',
			regex: '^[a-zA-Z0-9-_]+$',
		},
	},

	// ----------------------------------------
	//      videoAnalytics: getAll, getActivity, export
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getAll', 'getActivity'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getAll', 'getActivity'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getAll', 'getActivity', 'export'],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search by video title or description',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
				},
			},
			{
				displayName: 'Platforms',
				name: 'platforms',
				type: 'multiOptions',
				options: [
					{
						name: 'Instagram',
						value: 'instagram',
					},
					{
						name: 'TikTok',
						value: 'tiktok',
					},
					{
						name: 'YouTube',
						value: 'youtube',
					},
				],
				default: [],
				description: 'Filter by platforms',
				routing: {
					send: {
						type: 'query',
						property: 'platforms',
					},
				},
			},
			{
				displayName: 'Projects',
				name: 'projects',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: [],
				description: 'Filter by projects (select multiple)',
				routing: {
					send: {
						type: 'query',
						property: 'projects',
					},
				},
			},
			{
				displayName: 'Date Range From',
				name: 'dateRangeFrom',
				type: 'dateTime',
				default: '',
				description: 'Start date (YYYY-MM-DD)',
				routing: {
					send: {
						type: 'query',
						property: 'dateRange[from]',
						value: '={{$value.split("T")[0]}}',
					},
				},
			},
			{
				displayName: 'Date Range To',
				name: 'dateRangeTo',
				type: 'dateTime',
				default: '',
				description: 'End date (YYYY-MM-DD)',
				routing: {
					send: {
						type: 'query',
						property: 'dateRange[to]',
						value: '={{$value.split("T")[0]}}',
					},
				},
			},
		],
	},
];