export const DEFAULT_VIRALAPP_BASE_URL = 'https://viral.app/api/v1';
export const VIRALAPP_BASE_URL_ENV = 'VIRALAPP_BASE_URL';
export const VIRALAPP_BASE_URL_EXPRESSION = `={{$env.${VIRALAPP_BASE_URL_ENV} || "${DEFAULT_VIRALAPP_BASE_URL}"}}`;

export function resolveBaseUrl(): string {
	const envValue = process.env[VIRALAPP_BASE_URL_ENV];

	if (envValue !== undefined) {
		const trimmed = envValue.trim();
		if (!trimmed) {
			throw new Error(
				`${VIRALAPP_BASE_URL_ENV} is set but empty. Set it to https://preview.viral.app/api/v1 or https://viral.app/api/v1.`,
			);
		}

		return trimmed.replace(/\/$/, '');
	}

	return DEFAULT_VIRALAPP_BASE_URL;
}
