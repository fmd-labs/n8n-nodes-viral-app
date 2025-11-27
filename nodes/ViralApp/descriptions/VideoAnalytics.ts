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
				name: 'Download',
				value: 'download',
				description: 'Download the video file',
				action: 'Download video',
			},
			{
				name: 'Exclude',
				value: 'exclude',
				description: 'Exclude videos from analytics',
				action: 'Exclude videos from analytics',
			},
			{
				name: 'Export',
				value: 'export',
				description: 'Export videos to CSV',
				action: 'Export videos to CSV',
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
				name: 'Get Activity',
				value: 'getActivity',
				description: 'Get video activity timeline',
				action: 'Get video activity timeline',
			},
			{
				name: 'Get Excluded',
				value: 'getExcluded',
				description: 'List excluded videos',
				action: 'List excluded videos',
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
				name: 'Restore Excluded',
				value: 'restoreExcluded',
				description: 'Restore previously excluded videos',
				action: 'Restore excluded videos',
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
				operation: ['get', 'getHistory', 'download'],
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
		typeOptions: {
			loadOptionsDependsOn: ['platform'],
		},
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['get', 'getHistory', 'download'],
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
	},

	// ----------------------------------------
	//      videoAnalytics: getAll, export
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getAll'],
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
				operation: ['getAll'],
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
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Account Names or IDs',
				name: 'accounts',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: [],
				description:
					'Filter by specific accounts. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'query',
						property: 'accounts',
					},
				},
			},
			{
				displayName: 'Account Username',
				name: 'accountUsername',
				type: 'string',
				default: '',
				description: 'Account username on the platform',
				routing: {
					send: {
						type: 'query',
						property: 'accountUsername',
					},
				},
			},
			{
				displayName: 'Content Types',
				name: 'contentTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Video',
						value: 'video',
					},
					{
						name: 'Slideshow',
						value: 'slideshow',
					},
				],
				default: [],
				description: 'Filter by content types',
				routing: {
					send: {
						type: 'query',
						property: 'contentTypes',
					},
				},
			},
			{
				displayName: 'Date Range From',
				name: 'dateRangeFrom',
				type: 'dateTime',
				default: '={{$today.minus({days: 14}).toFormat("yyyy-MM-dd")}}',
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
				default: '={{$today.toFormat("yyyy-MM-dd")}}',
				description: 'End date (YYYY-MM-DD)',
				routing: {
					send: {
						type: 'query',
						property: 'dateRange[to]',
						value: '={{$value.split("T")[0]}}',
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
				displayName: 'Project Names or IDs',
				name: 'projects',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: [],
				description:
					'Filter by projects (select multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'query',
						property: 'projects',
					},
				},
			},
			{
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Account Username',
						value: 'accountUsername',
					},
					{
						name: 'Bookmark Count',
						value: 'bookmarkCount',
					},
					{
						name: 'Comment Count',
						value: 'commentCount',
					},
					{
						name: 'Duration Seconds',
						value: 'durationSeconds',
					},
					{
						name: 'Engagement Rate',
						value: 'engagementRate',
					},
					{
						name: 'Like Count',
						value: 'likeCount',
					},
					{
						name: 'Load At',
						value: 'loadAt',
					},
					{
						name: 'Platform',
						value: 'platform',
					},
					{
						name: 'Published At',
						value: 'publishedAt',
					},
					{
						name: 'Share Count',
						value: 'shareCount',
					},
					{
						name: 'View Count',
						value: 'viewCount',
					},
				],
				default: 'publishedAt',
				description: 'Column to sort by',
				routing: {
					send: {
						type: 'query',
						property: 'sortCol',
					},
				},
			},
			{
				displayName: 'Sort Direction',
				name: 'sortDir',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				default: 'desc',
				routing: {
					send: {
						type: 'query',
						property: 'sortDir',
					},
				},
			},
		],
	},
	{
		displayName: 'Expand Related',
		name: 'expand',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				name: 'Projects',
				value: 'projects',
				description: 'Return full project objects for the projects property instead of IDs',
			},
		],
		default: [],
		description:
			'Select related resources to expand in the response (Stripe-style expand). Leave empty to return IDs only.',
		hint: 'Expanded responses include nested objects and increase payload size.',
	},

	// ----------------------------------------
	//      videoAnalytics: getExcluded
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getExcluded'],
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
				operation: ['getExcluded'],
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
				operation: ['getExcluded'],
			},
		},
		options: [
			{
				displayName: 'Account Names or IDs',
				name: 'accounts',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: [],
				description:
					'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: {
					send: {
						type: 'query',
						property: 'accounts',
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
				description: 'Filter by social media platforms',
				routing: {
					send: {
						type: 'query',
						property: 'platforms',
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search by video ID or account username',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
				},
			},
			{
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Published At',
						value: 'publishedAt',
					},
					{
						name: 'View Count',
						value: 'viewCount',
					},
					{
						name: 'Engagement Rate',
						value: 'engagementRate',
					},
				],
				default: 'publishedAt',
				description: 'Column to sort by',
				routing: {
					send: {
						type: 'query',
						property: 'sortCol',
					},
				},
			},
			{
				displayName: 'Sort Direction',
				name: 'sortDir',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				default: 'desc',
				description: 'Direction to sort the results',
				routing: {
					send: {
						type: 'query',
						property: 'sortDir',
					},
				},
			},
		],
	},

	// ----------------------------------------
	//      videoAnalytics: exclude
	// ----------------------------------------
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['exclude'],
			},
		},
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
		default: 'tiktok',
		required: true,
		description: 'Social media platform',
	},
	{
		displayName: 'Org Account',
		name: 'orgAccountId',
		type: 'resourceLocator',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['exclude'],
			},
		},
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Organization account ID (orgacc_...)',
		typeOptions: {
			loadOptionsDependsOn: ['platform'],
		},
		extractValue: {
			type: 'regex',
			regex: '^orgacc_[A-Za-z0-9]+',
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'trackedAccountSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'orgacc_123',
			},
		],
	},
	{
		displayName: 'Video',
		name: 'platformVideoId',
		type: 'resourceLocator',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['exclude'],
			},
		},
		default: { mode: 'list', value: '' },
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['platform', 'orgAccountId'],
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
		description: 'Video to exclude from analytics',
	},

	// ----------------------------------------
	//      videoAnalytics: restoreExcluded
	// ----------------------------------------
	{
		displayName: 'Excluded Video ID',
		name: 'excludedVideoId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['restoreExcluded'],
			},
		},
		default: '',
		required: true,
		description: 'Excluded video ID (excv_abc123)',
		placeholder: 'excv_abc123',
	},
	// ----------------------------------------
	//      videoAnalytics: getActivity
	// ----------------------------------------
	{
		displayName: 'Filters',
		name: 'activityFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['getActivity'],
			},
		},
		options: [
			{
				displayName: 'Account Names or IDs',
				name: 'accounts',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: [],
				description:
					'Filter by specific accounts. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Content Types',
				name: 'contentTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Video',
						value: 'video',
					},
					{
						name: 'Slideshow',
						value: 'slideshow',
					},
				],
				default: [],
				description: 'Filter by content types',
			},
			{
				displayName: 'Days',
				name: 'days',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 365,
				},
				default: 365,
				description: 'Number of days to look back for activity data (1-365 days)',
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
			},
			{
				displayName: 'Project Names or IDs',
				name: 'projects',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: [],
				description:
					'Filter by projects (select multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},

	// ----------------------------------------
	//      videoAnalytics: export
	// ----------------------------------------
	{
		displayName: 'Export Filters',
		name: 'exportBody',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['videoAnalytics'],
				operation: ['export'],
			},
		},
		options: [
			{
				displayName: 'Account Names or IDs',
				name: 'accounts',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: [],
				description:
					'Filter by specific accounts. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Account Username',
				name: 'accountUsername',
				type: 'string',
				default: '',
				description: 'Account username on the platform',
			},
			{
				displayName: 'Content Types',
				name: 'contentTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Video',
						value: 'video',
					},
					{
						name: 'Slideshow',
						value: 'slideshow',
					},
				],
				default: [],
				description: 'Filter by content types',
			},
			{
				displayName: 'Date Range',
				name: 'dateRange',
				type: 'fixedCollection',
				default: {},
				options: [
					{
						displayName: 'Date Range',
						name: 'range',
						values: [
							{
								displayName: 'From',
								name: 'from',
								type: 'dateTime',
								default: '={{$today.minus({days: 14}).toFormat("yyyy-MM-dd")}}',
								required: true,
								description: 'Start date (YYYY-MM-DD)',
							},
							{
								displayName: 'To',
								name: 'to',
								type: 'dateTime',
								default: '={{$today.toFormat("yyyy-MM-dd")}}',
								required: true,
								description: 'End date (YYYY-MM-DD)',
							},
						],
					},
				],
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
				description: 'Filter by social media platforms',
			},
			{
				displayName: 'Project Names or IDs',
				name: 'projects',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: [],
				description:
					'Filter by projects (select multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Account Username',
						value: 'accountUsername',
					},
					{
						name: 'Bookmark Count',
						value: 'bookmarkCount',
					},
					{
						name: 'Comment Count',
						value: 'commentCount',
					},
					{
						name: 'Duration Seconds',
						value: 'durationSeconds',
					},
					{
						name: 'Engagement Rate',
						value: 'engagementRate',
					},
					{
						name: 'Like Count',
						value: 'likeCount',
					},
					{
						name: 'Load At',
						value: 'loadAt',
					},
					{
						name: 'Platform',
						value: 'platform',
					},
					{
						name: 'Published At',
						value: 'publishedAt',
					},
					{
						name: 'Share Count',
						value: 'shareCount',
					},
					{
						name: 'View Count',
						value: 'viewCount',
					},
				],
				default: 'publishedAt',
				description: 'Column to sort by',
			},
			{
				displayName: 'Sort Direction',
				name: 'sortDir',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				default: 'desc',
			},
		],
	},
];
