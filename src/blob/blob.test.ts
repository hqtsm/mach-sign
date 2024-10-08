import {describe, it} from 'node:test';
import {strictEqual} from 'node:assert';

import {Blob} from './blob.ts';

void describe('blob', () => {
	void it('sizeof', () => {
		strictEqual(Blob.sizeof, 8);
	});
});