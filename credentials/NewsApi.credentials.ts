import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const NAME = 'rondonjonNewsApi';
export const API_BASE_URL = 'https://newsapi.org';
export const DOCUMENTATION_URL = 'https://newsapi.org/docs';
export const PROPERTY_API_KEY = 'apiKey';

/**
 * Authentication for the [newsapi.org](https://newsapi.org/docs) API.
 */
export class NewsApi implements ICredentialType {
	displayName = '[RonDonJon] newsapi.org API';
	documentationUrl = DOCUMENTATION_URL;
	icon = 'file:NewsApi.svg' as const;
	name = NAME;

	properties: INodeProperties[] = [
		{
			default: '',
			displayName: 'API Key',
			name: PROPERTY_API_KEY,
			required: true,
			type: 'string',
			typeOptions: {
				password: true,
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				apiKey: `={{$credentials.${PROPERTY_API_KEY}}}`,
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: API_BASE_URL,
			url: '/v2/everything?q=n8n&pageSize=1&page=1',
		},
	};
}
