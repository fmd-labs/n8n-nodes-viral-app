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
		],
		default: 'getKpis',
	},
];

export const generalAnalyticsFields: INodeProperties[] = [
	// ----------------------------------------
	//      Common Filters
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
				operation: ['getKpis', 'getTopVideos', 'getTopAccounts', 'getInteractionMetrics', 'exportDailyGains'],
			},
		},
		options: [
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
				displayName: 'Accounts',
				name: 'accounts',
				type: 'string',
				default: '',
				description: 'Comma-separated list of account IDs',
				displayOptions: {
					show: {
						'/operation': ['getTopVideos', 'getInteractionMetrics', 'exportDailyGains'],
					},
				},
				routing: {
					send: {
						type: 'query',
						property: 'accounts',
						value: '={{$value.split(",").map(a => a.trim())}}',
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
		],
	},
];