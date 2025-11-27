import { INodeProperties } from 'n8n-workflow';

export const generalAnalyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['generalAnalytics'],
			},
		},
		options: [
			{
				name: 'Export Daily Gains',
				value: 'exportDailyGains',
				description: 'Export video daily gains to CSV',
				action: 'Export video daily gains',
				routing: {
					request: {
						method: 'POST',
						url: '/analytics/video-daily-gains/export',
					},
				},
			},
			{
				name: 'Get Interaction Metrics',
				value: 'getInteractionMetrics',
				description: 'Get interaction metrics over time',
				action: 'Get interaction metrics',
				routing: {
					request: {
						method: 'GET',
						url: '/analytics/interaction-metrics',
					},
				},
			},
			{
				name: 'Get KPIs',
				value: 'getKpis',
				description: 'Get key performance indicators',
				action: 'Get key performance indicators',
				routing: {
					request: {
						method: 'GET',
						url: '/analytics/kpis',
					},
				},
			},
			{
				name: 'Get Top Accounts',
				value: 'getTopAccounts',
				description: 'Get top performing accounts',
				action: 'Get top performing accounts',
				routing: {
					request: {
						method: 'GET',
						url: '/analytics/top-accounts',
					},
				},
			},
			{
				name: 'Get Top Videos',
				value: 'getTopVideos',
				description: 'Get top performing videos',
				action: 'Get top performing videos',
				routing: {
					request: {
						method: 'GET',
						url: '/analytics/top-videos',
					},
				},
			},
		],
		default: 'getKpis',
	},
];

export const generalAnalyticsFields: INodeProperties[] = [
	// ----------------------------------------
	//      Required Date Fields
	// ----------------------------------------
	{
		displayName: 'Date Range From',
		name: 'dateRangeFrom',
		type: 'dateTime',
		required: true,
		default: '={{$today.minus({days: 14}).toFormat("yyyy-MM-dd")}}',
		description: 'Start date (YYYY-MM-DD)',
		displayOptions: {
			show: {
				resource: ['generalAnalytics'],
				operation: [
					'getKpis',
					'getTopVideos',
					'getTopAccounts',
					'getInteractionMetrics',
					'exportDailyGains',
				],
			},
		},
		// Routing removed - handled in execute function
	},
	{
		displayName: 'Date Range To',
		name: 'dateRangeTo',
		type: 'dateTime',
		required: true,
		default: '={{$today.toFormat("yyyy-MM-dd")}}',
		description: 'End date (YYYY-MM-DD)',
		displayOptions: {
			show: {
				resource: ['generalAnalytics'],
				operation: [
					'getKpis',
					'getTopVideos',
					'getTopAccounts',
					'getInteractionMetrics',
					'exportDailyGains',
				],
			},
		},
		// Routing removed - handled in execute function
	},
	// Date fields for Export Daily Gains (POST request with body)
	// ----------------------------------------
	//      Optional Filters
	// ----------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['generalAnalytics'],
				operation: [
					'getKpis',
					'getTopVideos',
					'getTopAccounts',
					'getInteractionMetrics',
					'exportDailyGains',
				],
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
					'Filter by projects (select multiple). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'query',
						property: 'projects',
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
				description:
					'Filter by specific accounts. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				displayOptions: {
					show: {
						'/operation': [
							'getKpis',
							'getTopVideos',
							'getTopAccounts',
							'getInteractionMetrics',
							'exportDailyGains',
						],
					},
				},
				routing: {
					send: {
						type: 'query',
						property: 'accounts',
					},
				},
			},
			{
				displayName: 'Content Types',
				name: 'contentTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Slideshow',
						value: 'slideshow',
					},
					{
						name: 'Video',
						value: 'video',
					},
				],
				default: [],
				description: 'Filter by content types (video, slideshow)',
				displayOptions: {
					show: {
						'/operation': ['getTopVideos', 'getTopAccounts', 'getInteractionMetrics', 'getKpis'],
					},
				},
				routing: {
					send: {
						type: 'query',
						property: 'contentTypes',
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						'/operation': ['getTopVideos', 'getTopAccounts'],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
				routing: {
					send: {
						type: 'query',
						property: 'limit',
					},
				},
			},
			{
				displayName: 'Only Published',
				name: 'onlyPublished',
				type: 'boolean',
				displayOptions: {
					show: {
						'/operation': ['getTopVideos', 'getTopAccounts'],
					},
				},
				default: false,
				description: 'Whether to include only published content',
				routing: {
					send: {
						type: 'query',
						property: 'onlyPublished',
					},
				},
			},
			// Metric for Get Top Videos
			{
				displayName: 'Metric',
				name: 'metric',
				type: 'options',
				displayOptions: {
					show: {
						'/operation': ['getTopVideos'],
					},
				},
				options: [
					// Period-specific metrics
					{
						name: 'Bookmark Count (In Period)',
						value: 'bookmarkCountInPeriod',
					},
					{
						name: 'Bookmark Count (Lifetime)',
						value: 'bookmarkCount',
					},
					{
						name: 'Comment Count (In Period)',
						value: 'commentCountInPeriod',
					},
					{
						name: 'Comment Count (Lifetime)',
						value: 'commentCount',
					},
					{
						name: 'Engagement Rate (In Period)',
						value: 'engagementRateInPeriod',
					},
					{
						name: 'Engagement Rate (Lifetime)',
						value: 'engagementRate',
					},
					{
						name: 'Like Count (In Period)',
						value: 'likeCountInPeriod',
					},
					{
						name: 'Like Count (Lifetime)',
						value: 'likeCount',
					},
					{
						name: 'Share Count (In Period)',
						value: 'shareCountInPeriod',
					},
					{
						name: 'Share Count (Lifetime)',
						value: 'shareCount',
					},
					{
						name: 'View Count (In Period)',
						value: 'viewCountInPeriod',
					},
					{
						name: 'View Count (Lifetime)',
						value: 'viewCount',
					},
				],
				default: 'viewCount',
				description:
					'Metric to sort videos by. Lifetime metrics show total counts, period metrics show gains during the selected date range.',
				routing: {
					send: {
						type: 'query',
						property: 'metric',
					},
				},
			},
			// Metric for Get Top Accounts
			{
				displayName: 'Metric',
				name: 'metric',
				type: 'options',
				displayOptions: {
					show: {
						'/operation': ['getTopAccounts'],
					},
				},
				options: [
					{
						name: 'Average Views Per Video (In Period)',
						value: 'averageViewsPerVideoInPeriod',
					},
					{
						name: 'Average Views Per Video (Lifetime)',
						value: 'averageViewsPerVideo',
					},
					{
						name: 'Bookmark Count (In Period)',
						value: 'bookmarkCountInPeriod',
					},
					{
						name: 'Bookmark Count (Lifetime)',
						value: 'bookmarkCount',
					},
					{
						name: 'Comment Count (In Period)',
						value: 'commentCountInPeriod',
					},
					{
						name: 'Comment Count (Lifetime)',
						value: 'commentCount',
					},
					{
						name: 'Engagement Rate (In Period)',
						value: 'engagementRateInPeriod',
					},
					{
						name: 'Engagement Rate (Lifetime)',
						value: 'engagementRate',
					},
					{
						name: 'Like Count (In Period)',
						value: 'likeCountInPeriod',
					},
					{
						name: 'Like Count (Lifetime)',
						value: 'likeCount',
					},
					{
						name: 'Share Count (In Period)',
						value: 'shareCountInPeriod',
					},
					{
						name: 'Share Count (Lifetime)',
						value: 'shareCount',
					},
					{
						name: 'Video Count (In Period)',
						value: 'videoCountInPeriod',
					},
					{
						name: 'Video Count (Lifetime)',
						value: 'videoCount',
					},
					{
						name: 'View Count (In Period)',
						value: 'viewCountInPeriod',
					},
					{
						name: 'View Count (Lifetime)',
						value: 'viewCount',
					},
				],
				default: 'viewCount',
				description:
					'Metric to sort accounts by. Lifetime metrics show total counts, period metrics show gains during the selected date range.',
				routing: {
					send: {
						type: 'query',
						property: 'metric',
					},
				},
			},
		],
	},
];
