import {describe, it} from 'node:test';
import {deepStrictEqual, strictEqual} from 'node:assert';

import {unhex} from '../util.spec.ts';

import {Requirements} from './requirements.ts';

void describe('Requirements', () => {
	void it('sizeof', () => {
		strictEqual(Requirements.sizeof, 12);
	});

	void it('empty', () => {
		const {sizeof} = Requirements;
		const buffer = new ArrayBuffer(sizeof);
		const rs = new Requirements(buffer);
		rs.initialize2(sizeof);
		deepStrictEqual(
			new Uint8Array(buffer),
			unhex('FA DE 0C 01 00 00 00 0C 00 00 00 00')
		);
	});
});
