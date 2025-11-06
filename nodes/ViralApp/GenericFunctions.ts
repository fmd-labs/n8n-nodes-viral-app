import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

/**
 * Make an authenticated API request to ViralApp
 */
export async function viralAppApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = {},
	query: IDataObject = {},
): Promise<any> {
	const sanitizedQuery = cleanEmpty(query);
	const sanitizedBody = body ? cleanEmpty(body) : {};

	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const options: IHttpRequestOptions = {
		method,
		url: `https://viral.app/api/v1${path}`,
		qs: sanitizedQuery,
		json: true,
		headers: {},
		arrayFormat: 'repeat',
	};

	const methodUpper = method.toUpperCase();
	const shouldSendBody = ['POST', 'PUT', 'PATCH'].includes(methodUpper);

	if (shouldSendBody) {
		options.body = Object.keys(sanitizedBody).length > 0 ? sanitizedBody : {};

		if (
			methodUpper === 'POST' &&
			(path === '/videos/export' ||
				path === '/accounts/export' ||
				path === '/analytics/video-daily-gains/export')
		) {
			(options.headers as IDataObject)['Content-Type'] = 'application/json';

			if (!options.body || Object.keys(options.body as IDataObject).length === 0) {
				options.body = {};
			}
		}
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'viralAppApi',
			options,
		);
	} catch (error) {
		const statusCode = (error as IDataObject).statusCode ?? (error as IDataObject).httpCode;

		if (statusCode === 404) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Resource not found',
				description: 'The requested resource could not be found. Please check the ID and try again.',
			});
		}

		if (statusCode === 401) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Authentication failed',
				description: 'Please check your API key in the credentials.',
			});
		}

		if (statusCode === 429) {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Rate limit exceeded',
				description: 'Too many requests. Please wait a moment and try again.',
			});
		}

		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an authenticated API request and return all items (handles pagination)
 */
export async function viralAppApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const aggregated: IDataObject[] = [];
	let currentPage = 1;
	const baseQuery = { ...query };

	while (true) {
		const response = await viralAppApiRequest.call(
			this,
			method,
			endpoint,
			body,
			{ ...baseQuery, page: currentPage, perPage: 100 },
		);

		const items = Array.isArray(response?.data) ? response.data : [];
		aggregated.push(...items);

		const pageCount = response?.pageCount ?? 0;
		if (!pageCount || currentPage >= pageCount) {
			break;
		}
		currentPage += 1;
	}

	return aggregated;
}

export function cleanEmpty<T extends IDataObject>(input: T): T {
	const output: IDataObject = {};

	for (const [key, value] of Object.entries(input)) {
		if (value === undefined || value === null) {
			continue;
		}

		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (trimmed === '') {
				continue;
			}
			output[key] = trimmed;
			continue;
		}

		if (Array.isArray(value)) {
			const cleanedArray = value
				.map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
				.filter((entry) => entry !== undefined && entry !== null && entry !== '');
			if (cleanedArray.length === 0) {
				continue;
			}
			output[key] = cleanedArray;
			continue;
		}

		if (typeof value === 'object') {
			const cleanedObject = cleanEmpty(value as IDataObject);
			if (Object.keys(cleanedObject).length === 0) {
				continue;
			}
			output[key] = cleanedObject;
			continue;
		}

		output[key] = value;
	}

	return output as T;
}
