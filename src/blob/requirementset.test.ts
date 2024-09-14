import {describe, it} from 'node:test';
import {deepStrictEqual, strictEqual} from 'node:assert';

import {RequirementSet} from './requirementset.ts';
import {viewUint8R} from '../util.ts';
import {
	kSecDesignatedRequirementType,
	kSecHostRequirementType
} from '../const.ts';
import {Requirement} from './requirement.ts';

void describe('blob/requirementset', () => {
	void it('empty', () => {
		const r = new RequirementSet();
		const d = new Uint8Array(r.byteLength);
		r.byteWrite(d);
		deepStrictEqual(
			d,
			new Uint8Array(
				Buffer.from(
					'FA DE 0C 01 00 00 00 0C 00 00 00 00'.replaceAll(' ', ''),
					'hex'
				)
			)
		);

		const rd = new RequirementSet();
		strictEqual(rd.byteRead(d), d.byteLength);
		deepStrictEqual(rd, r);
	});

	void it('host + designated', () => {
		const hostData = Buffer.from(
			[
				'00 00 00 01 00 00 00 02 00 00 00 0E',
				'63 6F 6D 2E 61 70 70 6C 65 2E 68 6F 73 74 00 00'
			]
				.join(' ')
				.replaceAll(' ', ''),
			'hex'
		);
		const designatedData = Buffer.from(
			[
				'00 00 00 01 00 00 00 02 00 00 00 14',
				'63 6F 6D 2E 61 70 70 6C 65 2E 64 65 73 69 67 6E 61 74 65 64'
			]
				.join(' ')
				.replaceAll(' ', ''),
			'hex'
		);
		const data = Buffer.from(
			[
				'FA DE 0C 01 00 00 00 68',
				'00 00 00 02',
				'00 00 00 01 00 00 00 1C',
				'00 00 00 03 00 00 00 40',
				'FA DE 0C 00 00 00 00 24',
				hostData.toString('hex'),
				'FA DE 0C 00 00 00 00 28',
				designatedData.toString('hex')
			]
				.join(' ')
				.replaceAll(' ', ''),
			'hex'
		);
		const r = new RequirementSet();
		const designated = new Requirement();
		designated.data = designatedData;
		r.setType(kSecDesignatedRequirementType, designated);
		deepStrictEqual([...r.types()], [kSecDesignatedRequirementType]);
		const host = new Requirement();
		host.data = hostData;
		r.setType(kSecHostRequirementType, host);
		deepStrictEqual(
			[...r.types()],
			[kSecHostRequirementType, kSecDesignatedRequirementType]
		);
		const d = new Uint8Array(r.byteLength);
		r.byteWrite(d);
		deepStrictEqual(viewUint8R(d), viewUint8R(data));

		const rd = new RequirementSet();
		strictEqual(rd.byteRead(d), d.byteLength);
		deepStrictEqual(rd, r);
	});
});