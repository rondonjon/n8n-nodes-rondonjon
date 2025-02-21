import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export const NAME = 'rondonjonGoogleCustomSearchApi';
export const DOCUMENTATION_URL = 'https://developers.google.com/custom-search/v1/introduction';
export const PROPERTY_AUTH = 'auth';
export const PROPERTY_CX = 'cx';

/**
 * Authentication for the [Google Custom Search](https://developers.google.com/custom-search/docs/) API.
 */
export class GoogleCustomSearchApi implements ICredentialType {
	displayName = '[RonDonJon] Google Custom Search API';
	documentationUrl = DOCUMENTATION_URL;
	icon = 'file:GoogleCustomSearchApi.svg' as const;
	name = NAME;

	properties: INodeProperties[] = [
		{
			default: '',
			displayName: 'auth',
			name: PROPERTY_AUTH,
			required: true,
			type: 'string',
			typeOptions: {
				password: true,
			},
		},
		{
			default: '',
			displayName: 'cx',
			name: PROPERTY_CX,
			required: true,
			type: 'string',
		},
	];
}
