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
				name: 'Get Many',
				value: 'getAll',
				description: 'List many tracked accounts',
				action: 'List all tracked accounts',
				routing: {
					request: {
						method: 'GET',
						url: '/accounts/tracked',
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
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Created At',
						value: 'createdAt',
					},
					{
						name: 'Follower Count',
						value: 'followerCount',
					},
					{
						name: 'Max Videos',
						value: 'maxVideos',
					},
					{
						name: 'Platform',
						value: 'platform',
					},
					{
						name: 'Updated At',
						value: 'updatedAt',
					},
					{
						name: 'Username',
						value: 'username',
					},
				],
				default: 'createdAt',
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
						placeholder: 'e.g. viral_creator (without @)',
						description: 'Account username on the platform (without the @ symbol)',
					},
					{
						displayName: 'Max Videos',
						name: 'max_videos',
						type: 'options',
						options: [
							{
								name: '0 (Disable Tracking)',
								value: 0,
							},
							{
								name: '10',
								value: 10,
							},
							{
								name: '30',
								value: 30,
							},
							{
								name: '100',
								value: 100,
							},
							{
								name: '300',
								value: 300,
							},
							{
								name: '1000',
								value: 1000,
							},
							{
								name: '2000',
								value: 2000,
							},
						],
						default: 100,
						description: 'Maximum number of videos to track',
					},
					{
						displayName: 'Hashtags Filter',
						name: 'hashtagsFilter',
						type: 'string',
						default: '',
						placeholder: 'e.g. brand,marketing,viral',
						description: 'Comma-separated list of hashtags to filter content',
					},
				],
			},
		],
	},

	// ----------------------------------------
	//        trackedAccounts: refresh
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
				operation: ['refresh'],
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
						description: 'Social media platform (tiktok, instagram, youtube)',
					},
					{
						displayName: 'Account ID',
						name: 'accountId',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'e.g. edhillai',
						description: 'Native platform account ID',
						hint: 'Enter the username as it appears on the platform, without the @ symbol',
					},
				],
			},
		],
	},

	// ----------------------------------------
	//    trackedAccounts: updateMaxVideos
	// ----------------------------------------
	{
		displayName: 'Account',
		name: 'accountId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateMaxVideos', 'updateHashtags', 'updateProjectHashtags'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select an account...',
				typeOptions: {
					searchListMethod: 'trackedAccountSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'Enter account ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9-_]+$',
							errorMessage: 'Not a valid account ID',
						},
					},
				],
			},
		],
		description: 'The tracked account to operate on',
		extractValue: {
			type: 'regex',
			regex: '^[a-zA-Z0-9-_]+$',
		},
	},
	{
		displayName: 'Max Videos',
		name: 'maxVideos',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateMaxVideos'],
			},
		},
		options: [
			{
				name: '0 (Disable Tracking)',
				value: 0,
			},
			{
				name: '10',
				value: 10,
			},
			{
				name: '30',
				value: 30,
			},
			{
				name: '100',
				value: 100,
			},
			{
				name: '300',
				value: 300,
			},
			{
				name: '1000',
				value: 1000,
			},
			{
				name: '2000',
				value: 2000,
			},
		],
		default: 100,
		required: true,
		description: 'Maximum number of videos to track',
		routing: {
			send: {
				type: 'body',
				property: 'newMaxVideos',
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
	},

	// ----------------------------------------
	// trackedAccounts: updateProjectHashtags
	// ----------------------------------------
	{
		displayName: 'Project',
		name: 'projectId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateProjectHashtags'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a project...',
				typeOptions: {
					searchListMethod: 'projectSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'Enter project ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9-_]+$',
							errorMessage: 'Not a valid project ID',
						},
					},
				],
			},
		],
		description: 'The project to update hashtags for',
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
	},

];
