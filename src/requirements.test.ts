import {describe, it} from 'node:test';
import {deepStrictEqual} from 'node:assert';

import {Requirements} from './requirements.ts';
import {unhex} from './util.spec.ts';
import {subview} from './util.ts';

void describe('requirements', () => {
	void it('empty', () => {
		const {sizeof} = Requirements;
		const rs = new Requirements(new ArrayBuffer(sizeof));
		rs.initialize(sizeof);
		deepStrictEqual(
			subview(Uint8Array, rs),
			unhex('FA DE 0C 01 00 00 00 0C 00 00 00 00')
		);
	});
});
