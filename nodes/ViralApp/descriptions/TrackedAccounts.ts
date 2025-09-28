import { INodeProperties } from 'n8n-workflow';

export const trackedAccountsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many tracked accounts',
				action: 'List all tracked accounts',
				routing: {
					request: {
						method: 'GET',
						url: '/accounts/tracked',
					},
				},
			},
			{
				name: 'Add',
				value: 'add',
				description: 'Add new tracked accounts',
				action: 'Add tracked accounts',
				routing: {
					request: {
						method: 'POST',
						url: '/accounts/tracked',
					},
				},
			},
			{
				name: 'Get Count',
				value: 'getCount',
				description: 'Get count of tracked accounts',
				action: 'Get tracked accounts count',
				routing: {
					request: {
						method: 'GET',
						url: '/accounts/tracked/count',
					},
				},
			},
			{
				name: 'Refresh',
				value: 'refresh',
				description: 'Refresh tracked accounts data',
				action: 'Refresh tracked accounts',
				routing: {
					request: {
						method: 'POST',
						url: '/accounts/tracked/refresh',
					},
				},
			},
			{
				name: 'Update Max Videos',
				value: 'updateMaxVideos',
				description: 'Update maximum videos to track for an account',
				action: 'Update max videos for tracked account',
				routing: {
					request: {
						method: 'PUT',
						url: '=/accounts/tracked/{{$parameter.accountId}}/max-videos',
					},
				},
			},
			{
				name: 'Update Hashtags',
				value: 'updateHashtags',
				description: 'Update hashtag filters for an account',
				action: 'Update hashtags for tracked account',
				routing: {
					request: {
						method: 'PUT',
						url: '=/accounts/tracked/{{$parameter.accountId}}/hashtags',
					},
				},
			},
			{
				name: 'Update Project Hashtags',
				value: 'updateProjectHashtags',
				description: 'Update project-specific hashtag filters',
				action: 'Update project hashtags for tracked account',
				routing: {
					request: {
						method: 'PUT',
						url: '=/accounts/tracked/{{$parameter.accountId}}/project-hashtags',
					},
				},
			},
		],
		default: 'getAll',
	},
];

export const trackedAccountsFields: INodeProperties[] = [
	// ----------------------------------------
	//        trackedAccounts: getAll
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
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
				resource: ['trackedAccounts'],
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
				resource: ['trackedAccounts'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				default: '',
				description: 'Filter by account username',
				routing: {
					send: {
						type: 'query',
						property: 'username',
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
				displayName: 'Projects',
				name: 'projects',
				type: 'string',
				default: '',
				description: 'Comma-separated list of project IDs',
				routing: {
					send: {
						type: 'query',
						property: 'projects',
						value: '={{$value.split(",").map(p => p.trim())}}',
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
					{
						name: 'Created At',
						value: 'createdAt',
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

	// ----------------------------------------
	//        trackedAccounts: add
	// ----------------------------------------
	{
		displayName: 'Accounts',
		name: 'accounts',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['add'],
			},
		},
		default: {},
		required: true,
		options: [
			{
				displayName: 'Account',
				name: 'account',
				values: [
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
						default: 'tiktok',
						required: true,
					},
					{
						displayName: 'Username',
						name: 'username',
						type: 'string',
						default: '',
						required: true,
						description: 'Account username on the platform',
					},
					{
						displayName: 'Max Videos',
						name: 'maxVideos',
						type: 'number',
						default: 100,
						typeOptions: {
							minValue: 1,
						},
						description: 'Maximum number of videos to track',
					},
					{
						displayName: 'Hashtags Filter',
						name: 'hashtagsFilter',
						type: 'string',
						default: '',
						description: 'Comma-separated list of hashtags to filter content',
					},
				],
			},
		],
		routing: {
			send: {
				type: 'body',
				property: 'accounts',
				value: '={{$value.account}}',
			},
		},
	},

	// ----------------------------------------
	//        trackedAccounts: refresh
	// ----------------------------------------
	{
		displayName: 'Account IDs',
		name: 'accountIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['refresh'],
			},
		},
		default: '',
		required: true,
		description: 'Comma-separated list of account IDs to refresh',
		routing: {
			send: {
				type: 'body',
				property: 'accountIds',
				value: '={{$value.split(",").map(id => id.trim())}}',
			},
		},
	},

	// ----------------------------------------
	//    trackedAccounts: updateMaxVideos
	// ----------------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateMaxVideos', 'updateHashtags', 'updateProjectHashtags'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the tracked account',
	},
	{
		displayName: 'Max Videos',
		name: 'maxVideos',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateMaxVideos'],
			},
		},
		default: 100,
		required: true,
		typeOptions: {
			minValue: 1,
		},
		description: 'Maximum number of videos to track',
		routing: {
			send: {
				type: 'body',
				property: 'maxVideos',
			},
		},
	},

	// ----------------------------------------
	//    trackedAccounts: updateHashtags
	// ----------------------------------------
	{
		displayName: 'Hashtags',
		name: 'hashtags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateHashtags'],
			},
		},
		default: '',
		description: 'Comma-separated list of hashtags to filter content',
		routing: {
			send: {
				type: 'body',
				property: 'hashtags',
				value: '={{$value.split(",").map(h => h.trim())}}',
			},
		},
	},

	// ----------------------------------------
	// trackedAccounts: updateProjectHashtags
	// ----------------------------------------
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateProjectHashtags'],
			},
		},
		default: '',
		required: true,
		routing: {
			send: {
				type: 'body',
				property: 'projectId',
			},
		},
	},
	{
		displayName: 'Hashtags',
		name: 'projectHashtags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateProjectHashtags'],
			},
		},
		default: '',
		description: 'Comma-separated list of hashtags for the project',
		routing: {
			send: {
				type: 'body',
				property: 'hashtags',
				value: '={{$value.split(",").map(h => h.trim())}}',
			},
		},
	},

	// ----------------------------------------
	//        Pagination (for getAll)
	// ----------------------------------------
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['getAll'],
				returnAll: [false],
			},
			hide: {
				limit: [0],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		description: 'Page number to retrieve',
		routing: {
			send: {
				type: 'query',
				property: 'page',
			},
		},
	},
	{
		displayName: 'Items Per Page',
		name: 'perPage',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['getAll'],
				returnAll: [false],
			},
			hide: {
				limit: [0],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 10,
		routing: {
			send: {
				type: 'query',
				property: 'perPage',
				value: '={{$parameter.limit}}',
			},
		},
	},
];