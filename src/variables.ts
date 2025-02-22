import type { CompanionVariableDefinition, CompanionVariableValues, InstanceBase } from '@companion-module/base'
import type { Vpro8Config } from './config'
import type { Vpro8State } from './state'

/**
 * Initializes all variables
 * @param self reference to the BaseInstance
 * @param state reference to the modules state
 */
export function initVariables(self: InstanceBase<Vpro8Config>, state: Vpro8State): void {
	const variableDefinitions: CompanionVariableDefinition[] = []
	const variableValues: CompanionVariableValues = {}

	for (let i = 0; i < state.matrices.length; i++) {
		for (const input of state.iterateInputs(i)) {
			if (input.active) {
				variableDefinitions.push({
					name: `Label of input ${state.matrices[i].label} ${input.id}`,
					variableId: `input_${state.matrices[i].label}_${input.id}`,
				})

				variableValues[`input_${state.matrices[i].label}_${input.id}`] = input.label
			}
		}
	}

	for (let i = 0; i < state.matrices.length; i++) {
		for (const output of state.iterateOutputs(i)) {
			if (output.active) {
				variableDefinitions.push({
					name: `Label of output ${state.matrices[i].label} ${output.id}`,
					variableId: `output_${state.matrices[i].label}_${output.id}`,
				})

				variableValues[`output_${state.matrices[i].label}_${output.id}`] = output.label

				variableDefinitions.push({
					name: `Label of input routed to ${state.matrices[i].label} output ${output.id}`,
					variableId: `output_${state.matrices[i].label}_${output.id}_input`,
				})

				variableValues[`output_${state.matrices[i].label}_${output.id}_input`] =
					state.getInput(output.route, i)?.label ?? '?'
			}
		}
	}

	variableDefinitions.push({
		name: 'Label of selected destination',
		variableId: 'selected_target',
	})

	variableDefinitions.push({
		name: 'Label of input routed to selection',
		variableId: 'selected_target_source',
	})

	variableDefinitions.push({
		name: 'Label of undo source',
		variableId: 'selected_target_undo_source',
	})

	updateSelectedTargetVariables(self, state)

	self.setVariableDefinitions(variableDefinitions)
	self.setVariableValues(variableValues)
}

export function updateSelectedTargetVariables(self: InstanceBase<Vpro8Config>, state: Vpro8State): void {
	const variableValues: CompanionVariableValues = {}
	if (state.selected.matrix != -1 && state.selected.target != -1) {
		const selectedOutput = state.matrices[state.selected.matrix].outputs[state.selected.target]
		const inputForSelectedOutput = selectedOutput
			? state.getInput(selectedOutput.route, state.selected.matrix)
			: undefined

		variableValues['selected_target'] = selectedOutput?.label ?? '?'

		variableValues['selected_target_source'] = inputForSelectedOutput?.label ?? '?'

		if (state.matrices[state.selected.matrix].outputs[state.selected.target].fallback.length >= 2) {
			const selOut = state.matrices[state.selected.matrix].outputs[state.selected.target]
			variableValues['selected_target_undo_source'] =
				state.matrices[state.selected.matrix].inputs[selOut.fallback[selOut.fallback.length - 2]].label ?? ''
		} else {
			variableValues['selected_target_undo_source'] = ''
		}
	} else {
		variableValues['selected_target'] = '?'
		variableValues['selected_target_source'] = '?'
		variableValues['selected_target_undo_source'] = ''
	}
	self.setVariableValues(variableValues)
}
