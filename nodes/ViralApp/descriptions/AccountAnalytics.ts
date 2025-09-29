import { INodeProperties } from 'n8n-workflow';

export const accountAnalyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['accountAnalytics'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many accounts with analytics',
				action: 'List all accounts with analytics',
				routing: {
					request: {
						method: 'GET',
						url: '/accounts',
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
				name: 'Export',
				value: 'export',
				description: 'Export accounts to CSV',
				action: 'Export accounts to CSV',
				routing: {
					request: {
						method: 'POST',
						url: '/accounts/export',
					},
				},
			},
		],
		default: 'getAll',
	},
];

export const accountAnalyticsFields: INodeProperties[] = [
	// ----------------------------------------
	//      accountAnalytics: getAll
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['accountAnalytics'],
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
				resource: ['accountAnalytics'],
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
				resource: ['accountAnalytics'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search by account username',
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
				description: 'Filter by social media platforms',
				routing: {
					send: {
						type: 'query',
						property: 'platforms',
					},
				},
			},
			{
				displayName: 'Account Names or IDs',
				name: 'accounts',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: [],
				description: 'Filter by specific accounts. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'query',
						property: 'accounts',
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
				description: 'Filter by projects (select multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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
				default: '={{$today.minus({days: 14}).toFormat("yyyy-MM-dd")}}',
				description: 'Start date for analytics data (YYYY-MM-DD)',
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
				description: 'End date for analytics data (YYYY-MM-DD)',
				routing: {
					send: {
						type: 'query',
						property: 'dateRange[to]',
						value: '={{$value.split("T")[0]}}',
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
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Engagement Rate',
						value: 'engagementRate',
					},
					{
						name: 'Follower Count',
						value: 'followerCount',
					},
					{
						name: 'Published At',
						value: 'publishedAt',
					},
					{
						name: 'Total Views',
						value: 'totalViews',
					},
					{
						name: 'View Count',
						value: 'viewCount',
					},
					{
						name: 'Virality Rate',
						value: 'viralityRate',
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
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['accountAnalytics'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},

	// ----------------------------------------
	//      accountAnalytics: export
	// ----------------------------------------
	{
		displayName: 'Export Filters',
		name: 'exportBody',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['accountAnalytics'],
				operation: ['export'],
			},
			hide: {
				filters: [''],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search by account username',
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
				displayName: 'Account Names or IDs',
				name: 'accounts',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: [],
				description: 'Filter by specific accounts',
			},
			{
				displayName: 'Project Names or IDs',
				name: 'projects',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: [],
				description: 'Filter by specific projects',
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
		],
		routing: {
			send: {
				type: 'body',
				property: '={{Object.assign({}, $value, $value.dateRange?.range ? {dateRange: {from: $value.dateRange.range[0].from.split("T")[0], to: $value.dateRange.range[0].to.split("T")[0]}} : {})}}',
			},
		},
	},

];