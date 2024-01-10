import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface Vpro8Config {
	host?: string
	take?: boolean
	inputCountString: string
	outputCountString: string
}

/**
 * Returns all configFields for the Webconfig.
 * @constructor
 */
export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			tooltip: 'The IP of the ember+ provider',
			width: 6,
			regex: Regex.IP,
		},
		{
			type: 'checkbox',
			id: 'take',
			label: 'Enable Take? (XY only)',
			width: 6,
			default: false,
		},
	]
}
