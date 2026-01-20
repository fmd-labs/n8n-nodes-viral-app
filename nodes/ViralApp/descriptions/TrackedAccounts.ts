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
		},
		{
			name: 'Get Count',
			value: 'getCount',
			description: 'Get count of tracked accounts',
			action: 'Get tracked accounts count',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			description: 'List many tracked accounts',
			action: 'List all tracked accounts',
		},
		{
			name: 'Refresh',
			value: 'refresh',
			description: 'Refresh tracked accounts data',
			action: 'Refresh tracked accounts',
		},
		{
			name: 'Set Competitor Flag',
			value: 'setCompetitor',
			description: 'Mark or unmark a tracked account as a competitor',
			action: 'Set competitor flag for tracked account',
		},
		{
			name: 'Set Competitor Flag (Bulk)',
			value: 'setCompetitors',
			description: 'Mark or unmark multiple tracked accounts as competitors',
			action: 'Set competitor flags in bulk',
		},
		{
			name: 'Update Hashtags',
			value: 'updateHashtags',
			description: 'Update hashtag filters for an account',
			action: 'Update hashtags for tracked account',
		},
		{
			name: 'Update Max Videos',
			value: 'updateMaxVideos',
			description: 'Update maximum videos to track for an account',
			action: 'Update max videos for tracked account',
		},
		{
			name: 'Update Project Hashtags',
			value: 'updateProjectHashtags',
			description: 'Update project-specific hashtag filters',
			action: 'Update project hashtags for tracked account',
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
				type: 'resourceLocator',
				default: {
					mode: 'list',
					value: '',
				},
				modes: [
					{
						displayName: 'List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'projectSearch',
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
					},
				],
				description:
					'Filter by projects (select multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Added By',
						value: 'addedBy',
					},
					{
						name: 'Analytics Latest Load At',
						value: 'analyticsLatestLoadAt',
					},
					{
						name: 'Hashtags Filter',
						value: 'hashtagsFilter',
					},
					{
						name: 'Individual Videos',
						value: 'individualVideos',
					},
					{
						name: 'Last Error Code',
						value: 'lastErrorCode',
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
						name: 'Project Count',
						value: 'projects',
					},
					{
						name: 'Tracking Since',
						value: 'trackingSince',
					},
					{
						name: 'Username',
						value: 'username',
					},
				],
				default: 'username',
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
				displayName: 'View Mode',
				name: 'viewMode',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Competitors', value: 'competitors' },
					{ name: 'Internal Accounts', value: 'internal' },
				],
				default: 'internal',
				description: 'Whether to show your own accounts, competitors, or both',
				routing: {
					send: {
						type: 'query',
						property: 'viewMode',
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
								name: '60',
								value: 60,
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
				displayName: 'Is Competitor',
				name: 'isCompetitor',
				type: 'boolean',
				default: false,
				description: 'Whether to mark all provided accounts as competitors',
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
				name: '60',
				value: 60,
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
		displayName: 'Project Hashtags',
		name: 'projectHashtags',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		required: true,
		placeholder: 'Add Project Hashtag',
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['updateProjectHashtags'],
			},
		},
		options: [
			{
				displayName: 'Project Hashtag',
				name: 'projectHashtag',
				values: [
					{
						displayName: 'Project',
						name: 'projectId',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						required: true,
						extractValue: {
							type: 'regex',
							regex: '^[a-zA-Z0-9-_]+$',
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
					},
					{
						displayName: 'Hashtags Filter',
						name: 'hashtags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of hashtags for the project',
					},
				],
			},
		],
	},

	// ----------------------------------------
	//        trackedAccounts: setCompetitor
	// ----------------------------------------
	{
		displayName: 'Account Name or ID',
		name: 'accountId',
		type: 'resourceLocator',
		default: {
			mode: 'list',
			value: '',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['setCompetitor'],
			},
		},
		modes: [
			{
				displayName: 'List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'accountSearch',
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
			},
		],
		description:
			'Select the tracked account. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Is Competitor',
		name: 'isCompetitor',
		type: 'boolean',
		default: true,
		required: true,
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['setCompetitor'],
			},
		},
		description: 'Whether the tracked account is marked as a competitor',
	},

	// ----------------------------------------
	//        trackedAccounts: setCompetitors (bulk)
	// ----------------------------------------
	{
		displayName: 'Bulk Competitor Update',
		name: 'bulkCompetitors',
		type: 'collection',
		default: {},
		required: true,
		displayOptions: {
			show: {
				resource: ['trackedAccounts'],
				operation: ['setCompetitors'],
			},
		},
		options: [
			{
				displayName: 'Accounts',
				name: 'accounts',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Accounts to update. Leave empty to apply to all tracked accounts.',
				options: [
					{
						displayName: 'Account',
						name: 'account',
						values: [
							{
								displayName: 'Account Name or ID',
								name: 'accountId',
								type: 'resourceLocator',
								default: {
									mode: 'list',
									value: '',
								},
								modes: [
									{
										displayName: 'List',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'accountSearch',
										},
									},
									{
										displayName: 'ID',
										name: 'id',
										type: 'string',
									},
								],
								description:
									'Select the tracked account. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
						],
					},
				],
			},
			{
				displayName: 'Is Competitor',
				name: 'isCompetitor',
				type: 'boolean',
				default: true,
				required: true,
		description: 'Whether the provided accounts are marked as competitors',
	},
		],
	},
];
