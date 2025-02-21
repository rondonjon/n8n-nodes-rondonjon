import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const NAME = 'rondonjonPumbleApi';
export const API_BASE_URL = 'https://pumble-api-keys.addons.marketplace.cake.com';
export const DOCUMENTATION_URL =
	'https://pumble.com/help/integrations/automation-workflow-integrations/api-keys-integration/';
export const PROPERTY_API_KEY = 'apiKey';

/**
 * Authentication for the [Pumble](https://www.pumble.com) API
 */
export class PumbleApi implements ICredentialType {
	displayName = '[RonDonJon] Pumble API';
	documentationUrl = DOCUMENTATION_URL;
	icon = 'file:PumbleApi.svg' as const;
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
			headers: {
				'Api-Key': `={{$credentials.${PROPERTY_API_KEY}}}`,
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: API_BASE_URL,
			url: '/listChannels',
		},
	};
}
