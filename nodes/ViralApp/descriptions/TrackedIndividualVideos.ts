import { INodeProperties } from 'n8n-workflow';

export const trackedIndividualVideosOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['trackedIndividualVideos'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many individually tracked videos',
				action: 'List all individually tracked videos',
				routing: {
					request: {
						method: 'GET',
						url: '/videos/tracked',
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
				name: 'Add',
				value: 'add',
				description: 'Add new videos to track individually',
				action: 'Add individually tracked videos',
				routing: {
					request: {
						method: 'POST',
						url: '/videos/tracked',
					},
				},
			},
			{
				name: 'Refresh',
				value: 'refresh',
				description: 'Refresh tracked video data',
				action: 'Refresh individually tracked videos',
				routing: {
					request: {
						method: 'POST',
						url: '/videos/tracked/refresh',
					},
				},
			},
		],
		default: 'getAll',
	},
];

export const trackedIndividualVideosFields: INodeProperties[] = [
	// ----------------------------------------
	//   trackedIndividualVideos: getAll
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['trackedIndividualVideos'],
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
				resource: ['trackedIndividualVideos'],
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
				resource: ['trackedIndividualVideos'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search videos by ID or title',
				placeholder: 'e.g. video title or ID',
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
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Added By',
						value: 'addedBy',
					},
					{
						name: 'Analytics Load At',
						value: 'analyticsLoadAt',
					},
					{
						name: 'Last Error Code',
						value: 'lastErrorCode',
					},
					{
						name: 'Platform',
						value: 'platform',
					},
					{
						name: 'Platform Video ID',
						value: 'platformVideoId',
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
				default: 'platform',
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
	//   trackedIndividualVideos: add
	// ----------------------------------------
	{
		displayName: 'Videos',
		name: 'videos',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['trackedIndividualVideos'],
				operation: ['add'],
			},
		},
		default: {},
		required: true,
		options: [
			{
				displayName: 'Video',
				name: 'video',
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
						displayName: 'Video ID',
						name: 'videoId',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'e.g. 7555817736354516246',
						description: 'Platform-specific video ID',
						hint: 'Enter the video ID from the platform',
					},
				],
			},
		],
	},

	// ----------------------------------------
	//   trackedIndividualVideos: refresh
	// ----------------------------------------
	{
		displayName: 'Videos',
		name: 'videos',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['trackedIndividualVideos'],
				operation: ['refresh'],
			},
		},
		default: {},
		required: true,
		options: [
			{
				displayName: 'Video',
				name: 'video',
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
						displayName: 'Video ID',
						name: 'videoId',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'e.g. 7555817736354516246',
						description: 'Platform-specific video ID',
						hint: 'Enter the video ID from the platform',
					},
				],
			},
		],
	},

];
