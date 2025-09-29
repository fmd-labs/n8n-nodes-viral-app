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
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['trackedIndividualVideos'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return a simplified version of the response instead of the raw data',
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
						description: 'Platform where the video is hosted',
					},
					{
						displayName: 'Video',
						name: 'videoId',
						type: 'resourceLocator',
						default: { mode: 'url', value: '' },
						required: true,
						description: 'The video to track',
						modes: [
							{
								displayName: 'By URL',
								name: 'url',
								type: 'string',
								hint: 'Enter full video URL from TikTok, Instagram, or YouTube',
								placeholder: 'e.g. https://www.tiktok.com/@user/video/123456789',
								validation: [
									{
										type: 'regex',
										properties: {
											regex: '^https?://(www\.)?(tiktok\.com|instagram\.com|youtube\.com|youtu\.be)',
											errorMessage: 'Please enter a valid TikTok, Instagram, or YouTube URL',
										},
									},
								],
								extractValue: {
									type: 'regex',
									regex: '(?:tiktok\.com.*?video/([0-9]+)|instagram\.com.*?(?:reel|p)/([A-Za-z0-9_-]+)|(?:youtube\.com.*?v=|youtu\.be/)([A-Za-z0-9_-]{11}))',
								},
							},
							{
								displayName: 'By ID',
								name: 'id',
								type: 'string',
								hint: 'Enter platform-specific video ID',
								placeholder: 'e.g. 7234567890123456789 (TikTok), CAbCdEfGhIj (Instagram), dQw4w9WgXcQ (YouTube)',
							},
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								typeOptions: {
									searchListMethod: 'allVideosSearch',
									searchable: true,
									searchFilterRequired: false,
								},
							},
						],
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
						description: 'Platform where the video is hosted',
					},
					{
						displayName: 'Video',
						name: 'videoId',
						type: 'resourceLocator',
						default: { mode: 'url', value: '' },
						required: true,
						description: 'The video to refresh data for',
						modes: [
							{
								displayName: 'By URL',
								name: 'url',
								type: 'string',
								hint: 'Enter full video URL from TikTok, Instagram, or YouTube',
								placeholder: 'e.g. https://www.tiktok.com/@user/video/123456789',
								validation: [
									{
										type: 'regex',
										properties: {
											regex: '^https?://(www\.)?(tiktok\.com|instagram\.com|youtube\.com|youtu\.be)',
											errorMessage: 'Please enter a valid TikTok, Instagram, or YouTube URL',
										},
									},
								],
								extractValue: {
									type: 'regex',
									regex: '(?:tiktok\.com.*?video/([0-9]+)|instagram\.com.*?(?:reel|p)/([A-Za-z0-9_-]+)|(?:youtube\.com.*?v=|youtu\.be/)([A-Za-z0-9_-]{11}))',
								},
							},
							{
								displayName: 'By ID',
								name: 'id',
								type: 'string',
								hint: 'Enter platform-specific video ID',
								placeholder: 'e.g. 7234567890123456789 (TikTok), CAbCdEfGhIj (Instagram), dQw4w9WgXcQ (YouTube)',
							},
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								typeOptions: {
									searchListMethod: 'allVideosSearch',
									searchable: true,
									searchFilterRequired: false,
								},
							},
						],
					},
				],
			},
		],
	},

];