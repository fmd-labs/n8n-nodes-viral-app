import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { trackedAccountsOperations, trackedAccountsFields } from './descriptions/TrackedAccounts';
import { trackedIndividualVideosOperations, trackedIndividualVideosFields } from './descriptions/TrackedIndividualVideos';
import { accountAnalyticsOperations, accountAnalyticsFields } from './descriptions/AccountAnalytics';
import { videoAnalyticsOperations, videoAnalyticsFields } from './descriptions/VideoAnalytics';
import { generalAnalyticsOperations, generalAnalyticsFields } from './descriptions/GeneralAnalytics';
import { projectsOperations, projectsFields } from './descriptions/Projects';
import { integrationsOperations, integrationsFields } from './descriptions/Integrations';

export class ViralApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ViralApp',
		name: 'viralApp',
		icon: 'file:viralapp.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with ViralApp API for video analytics on TikTok, Instagram, and YouTube',
		defaults: {
			name: 'ViralApp',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'viralAppApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://viral.app/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account Analytic',
						value: 'accountAnalytics',
						description: 'Analytics for tracked accounts',
					},
					{
						name: 'General Analytic',
						value: 'generalAnalytics',
						description: 'General analytics and overview',
					},
					{
						name: 'Integration',
						value: 'integrations',
						description: 'Third-party integrations',
					},
					{
						name: 'Project',
						value: 'projects',
						description: 'Project management',
					},
					{
						name: 'Tracked Account',
						value: 'trackedAccounts',
						description: 'Manage and monitor tracked accounts',
					},
					{
						name: 'Tracked Individual Video',
						value: 'trackedIndividualVideos',
						description: 'Manage and monitor individual tracked videos',
					},
					{
						name: 'Video Analytic',
						value: 'videoAnalytics',
						description: 'Analytics for tracked videos',
					},
				],
				default: 'trackedAccounts',
			},

			// Tracked Accounts
			...trackedAccountsOperations,
			...trackedAccountsFields,

			// Tracked Individual Videos
			...trackedIndividualVideosOperations,
			...trackedIndividualVideosFields,

			// Account Analytics
			...accountAnalyticsOperations,
			...accountAnalyticsFields,

			// Video Analytics
			...videoAnalyticsOperations,
			...videoAnalyticsFields,

			// General Analytics
			...generalAnalyticsOperations,
			...generalAnalyticsFields,

			// Projects
			...projectsOperations,
			...projectsFields,

			// Integrations
			...integrationsOperations,
			...integrationsFields,
		],
	};
}