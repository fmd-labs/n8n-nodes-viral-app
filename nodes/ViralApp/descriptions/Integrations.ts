import { INodeProperties } from 'n8n-workflow';

export const integrationsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['integrations'],
			},
		},
		options: [
			{
				name: 'Get Apps',
				value: 'getApps',
				description: 'Get list of connected apps and integrations',
				action: 'Get connected apps',
				routing: {
					request: {
						method: 'GET',
						url: '/apps',
					},
				},
			},
		],
		default: 'getApps',
	},
];

export const integrationsFields: INodeProperties[] = [];